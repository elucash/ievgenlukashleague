'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signup = signup;
exports.load = load;
exports.signin = signin;

var _access = require('./access');

var _access2 = _interopRequireDefault(_access);

var _password = require('./password');

var password = _interopRequireWildcard(_password);

var _session = require('./session');

var session = _interopRequireWildcard(_session);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var USER_SAMPLE = {
  _id: 'normalized@email',
  password: 'hexhash',
  name: 'Full Name',
  age: 32,
  religion: 'x', // opt
  gender: '', // opt
  preference: {
    age: [20, 40],
    religion: 'x' }
};

var users = _access2.default.db.collection('users');

function signup(user) {
  email = normalizeEmail(email);
  var hash = password.hash(email, password);
}

function load(email) {
  email = normalizeEmail(email);
  return users.findOne({ _id: email }, { fields: { password: 0 } }).presentOfFail('noaccess: no such user');
}

function signin(email, password) {
  email = normalizeEmail(email);
  var hash = password.hash(email, password);

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