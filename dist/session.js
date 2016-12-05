'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create = create;
exports.get = get;

var _access = require('./access');

var _access2 = _interopRequireDefault(_access);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Decided to not mess with cookies and provide quite
// explicit session handling using expiring database
// storage and explicit passing of the session key

// Properly encrypted cookies could be better alternative
// for storing expiring sessions to avoid DB lookups
var TTL_SEC = 60;

var session = _access2.default.db.collection('session');

// ensure TTL index is created on session
session.ensureIndex({ at: 1 }, { expireAfterSeconds: TTL_SEC });

/** Create new session */
function create(email) {
  // cryptographically strong psedorandom key would be better
  var _id = new _mongodb2.default.ObjectID();
  return session.insert({
    _id: _id,
    email: email,
    at: new Date()
  }).then(function () {
    return _id.toString();
  });
}

/** Get session by key */
function get(key) {
  try {
    key = _mongodb2.default.ObjectID(key);
  } catch (ex) {
    return Promise.reject(new Error('badrequest: wrong sessionKey format'));
  }
  return session.findOne({ _id: key }).then(function (s) {
    if (!s) throw new Error('noaccess: no such session');
    return s.email;
  });
}