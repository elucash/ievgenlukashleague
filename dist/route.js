'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {
  app.get('/', function (req, res) {
    res.send('Hello World');
  });

  app.get('/session', function (req, res) {
    session.create().then(sendContent(res)).catch(sendError(res));
  });

  app.get('/sessions', function (req, res) {
    session.all().then(sendContent(res)).catch(sendError(res));
  });

  app.get('/me', loggedIn, function (req, res) {
    sendContent(res)(req.user);
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

  app.post('/signup', function (req, res) {
    var r = req.body;
  });
};

var _users = require('./users');

var users = _interopRequireWildcard(_users);

var _session = require('./session');

var session = _interopRequireWildcard(_session);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function sendError(res) {
  return function (err) {
    var message = err.message || err + '';

    res.status(500).send({
      err: message
    });
  };
}

function sendContent(res, formatFn) {
  formatFn = formatFn || function (obj) {
    return obj;
  };
  return function (v) {
    res.status(200).send(formatFn(v));
  };
}

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