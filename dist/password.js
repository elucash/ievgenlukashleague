'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hash = hash;

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GLOBAL_SALT = 'CAFEBABEDEADBEEFCAFEBABEDEADBEEF'; // this file is not about real security,
// but rather is a sketch or an imitation
// of security concerns. Proper salt and bcrypt
// (or what is fashionable nowadays) would be better


function sha512(plaintext) {
  var h = _crypto2.default.createHmac('sha512', GLOBAL_SALT);
  h.update(plaintext);
  return h.digest('hex');
}

function hash(email, password) {
  return sha512(email + '_/_' + password);
}