'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.hash = hash;
// this file is not about real security,
// but rather is a sketch or an imitation
// of security concerns. Proper salt and bcrypt
// (or what is fashionable nowadays) would be better

var GLOBAL_SALT = 'CAFEBABEDEADBEEFCAFEBABEDEADBEEF';

function sha512(plaintext) {
  var hash = crypto.createHmac('sha512', GLOBAL_SALT);
  hash.update(plaintext);
  return hash.digest('hex');
}

function hash(email, password) {
  return sha512(email + '_/_' + password);
}