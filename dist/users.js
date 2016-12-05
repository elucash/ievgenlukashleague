'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signup = signup;
exports.load = load;
exports.login = login;

var _access = require('./access');

var _access2 = _interopRequireDefault(_access);

var _password = require('./password');

var passwords = _interopRequireWildcard(_password);

var _session = require('./session');

var session = _interopRequireWildcard(_session);

var _profile = require('./profile');

var profile = _interopRequireWildcard(_profile);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Just didn't want to dive into Mongoose
// or similar tools just yet,
// but it would be a great idea to define and validate schema for it
var USER_SAMPLE = {
  _id: 'normalized@email',
  password: 'hexhash',
  profile: {
    name: 'Full Name',
    age: 32,
    religion: 'x', // opt, but can be anything, even "jedi" and "spaghetti monster" would not be offended
    gender: '' },
  preference: {
    age: [20, 40], // age range
    religion: 'x' },
  reviewed: { 'user@email': 1 } };
var DUPLICATE_ID_CODE = 11000;

var users = _access2.default.db.collection('users');

function signup(user) {
  var email = user.email,
      password = user.password;

  if (!email || typeof email != 'string') {
    return Promise.reject(new Error('invalid: please provide valid email(username) string: ' + JSON.stringify(user)));
  }
  if (!password || typeof password != 'string') {
    return Promise.reject(new Error('invalid: please provide valid password string'));
  }
  email = normalizeEmail(email);
  var hash = passwords.hash(email, password);

  var violations = profile.validate(user);
  if (violations.length) {
    var err = new Error('invalid: submitted profile is incomplete or contains mistakes');
    err.violations = violations;
    return Promise.reject(err);
  }

  return users.insert({
    _id: email,
    password: hash,
    profile: user.profile,
    preference: user.preference || {},
    reviewed: []
  }).then(function (result) {
    return { ok: 1 };
  }).catch(function (err) {
    if (err.code == DUPLICATE_ID_CODE) {
      throw new Error('invalid: user with email ' + email + ' already exists');
    }
    throw err;
  });
}

function load(email) {
  email = normalizeEmail(email);
  return users.findOne({
    _id: email
  }, {
    fields: { password: 0 }
  }).then(presentOfFail('noaccess: no such user'));
}

function login(email, password) {
  email = normalizeEmail(email);
  var hash = passwords.hash(email, password);

  return users.findOne({
    _id: email,
    password: hash
  }).then(presentOfFail('noaccess: email or password do not match our records')).then(function () {
    return session.create(email);
  });
}

function presentOfFail(message) {
  return function (v) {
    if (!v) throw new Error(message);
    return v;
  };
}

// speculative canonicalization of the email
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}