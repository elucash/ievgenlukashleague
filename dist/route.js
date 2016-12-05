'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = function (app) {
  app.use(_bodyParser2.default.json());
  app.use(httpsOnly);

  app.get('/', function (req, res) {
    res.send('Kinda dating app API');
  });

  app.post('/signup', function (req, res) {
    users.signup(req.body).then(sendContent(res)).catch(sendError(res));
  });

  app.get('/me', loggedIn, function (req, res) {
    sendContent(res)(req.user);
  });

  app.get('/sessions', function (req, res) {
    session.all().then(sendContent(res)).catch(sendError(res));
  });

  app.get('/matches', loggedIn, function (req, res) {
    profile.matches(req.user, req.query.limit).then(sendContent(res)).catch(sendError(res));
  });

  app.post('/login', function (req, res) {
    var _req$body = req.body,
        email = _req$body.email,
        password = _req$body.password;

    if (!email || !password) {
      sendError(res)(new Error('invalid: empty email or password'));
      return;
    }

    users.login(email, password).then(sendContent(res)).catch(sendError(res));
  });
};

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _users = require('./users');

var users = _interopRequireWildcard(_users);

var _session = require('./session');

var session = _interopRequireWildcard(_session);

var _profile = require('./profile');

var profile = _interopRequireWildcard(_profile);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Middleware for checking and loading our session user
 */
function loggedIn(req, res, next) {
  var sessionKey = req.get('Session-Key') || req.query.sessionKey;
  if (!sessionKey) sendError(res)(new Error('noaccess: sessionKey not provided'));

  session.get(sessionKey).then(function (email) {
    return users.load(email);
  }).then(function (user) {
    req.user = user;
    next();
  }).catch(sendError(res));
}

var errorStatuseCodes = {
  badrequest: 400,
  noaccess: 401,
  notfound: 404,
  error: 500
};

function sendError(res) {
  return function (err) {
    var message = err.message || err + '';
    res.status(statusCodeFor(message)).send({
      err: message,
      violations: err.violations
    });
  };
  function statusCodeFor(message) {
    var _message$split = message.split(/\:/),
        _message$split2 = _slicedToArray(_message$split, 1),
        errorTag = _message$split2[0];

    return errorStatuseCodes[errorTag] || errorStatuseCodes.error;
  }
}

function sendContent(res, formatFn) {
  formatFn = formatFn || function (obj) {
    return obj;
  };
  return function (v) {
    res.status(200).send(formatFn(v));
  };
}

function httpsOnly(req, res, next) {
  var originalProtocol = req.get('X-Forwarded-Proto');
  // only check if header is present, i.e. behind reverse proxy
  if (originalProtocol && originalProtocol != 'https') {
    // maybe redirect would be better, but anyway
    res.status(403).send({ err: 'Only https requests are allowed' });
  } else {
    next();
  }
}