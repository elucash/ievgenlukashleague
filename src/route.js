import bodyParser from 'body-parser'
import * as users from './users'
import * as session from './session'
import * as profile from './profile'

export default function(app) {
  app.use(bodyParser.json())
  app.use(httpsOnly)

  app.get('/', (req, res) => {
    res.send('Kinda dating app API')
  })

  app.post('/signup', (req, res) => {
    users.signup(req.body)
      .then(sendContent(res))
      .catch(sendError(res))
  })

  app.get('/me', loggedIn, (req, res) => {
    sendContent(res)(req.user)
  })

  app.get('/sessions', (req, res) => {
    session.all()
      .then(sendContent(res))
      .catch(sendError(res))
  })

  app.get('/matches', loggedIn, (req, res) => {
    profile.matches(req.user, req.query.limit)
      .then(sendContent(res))
      .catch(sendError(res))
  })

  app.post('/login', (req, res) => {
    let {email, password} = req.body
    if (!email || !password) {
      sendError(res)(new Error('invalid: empty email or password'))
      return
    }

    users.login(email, password)
      .then(sendContent(res))
      .catch(sendError(res))
  })
}

/**
 * Middleware for checking and loading our session user
 */
function loggedIn(req, res, next) {
  let sessionKey = req.get('Session-Key') || req.query.sessionKey
  if (!sessionKey) sendError(res)(new Error('noaccess: sessionKey not provided'))

  session.get(sessionKey)
    .then(email => users.load(email))
    .then(user => {
      req.user = user
      next()
    })
    .catch(sendError(res))
}

let errorStatuseCodes = {
  badrequest: 400,
  noaccess: 401,
  notfound: 404,
  error: 500
}

function sendError(res) {
  return err => {
    let message = err.message || err + ''
    res.status(statusCodeFor(message)).send({
      err: message,
      violations: err.violations
    })
  }
  function statusCodeFor(message) {
    let [errorTag] = message.split(/\:/,)
    return errorStatuseCodes[errorTag] || errorStatuseCodes.error
  }
}

function sendContent(res, formatFn) {
  formatFn = formatFn || (obj => obj)
  return v => {
    res.status(200).send(formatFn(v))
  }
}

function httpsOnly(req, res, next) {
  let originalProtocol = req.get('X-Forwarded-Proto')
  // only check if header is present, i.e. behind reverse proxy
  if (originalProtocol && originalProtocol != 'https') {
    // maybe redirect would be better, but anyway
    res.status(403).send({err: 'Only https requests are allowed'})
  } else {
    next()
  }
}
