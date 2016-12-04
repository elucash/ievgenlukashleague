import * as users from './users'
import * as session from './session'

export default function(app) {
  app.get('/', (req, res) => {
    res.send('Hello World')
  })

  app.get('/session', (req, res) => {
    session.create()
      .then(sendContent(res))
      .catch(sendError(res))
  })

  app.get('/sessions', (req, res) => {
    session.all()
      .then(sendContent(res))
      .catch(sendError(res))
  })

  app.get('/me', loggedIn, (req, res) => {
    sendContent(res)(req.user)
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

  app.post('/signup', (req, res) => {
    let r = req.body

  })
}

function sendError(res) {
  return err => {
    let message = err.message || err + ''

    res.status(500).send({
      err: message
    })
  }
}

function sendContent(res, formatFn) {
  formatFn = formatFn || (obj => obj)
  return v => {
    res.status(200).send(formatFn(v))
  }
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
