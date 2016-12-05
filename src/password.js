// this file is not about real security,
// but rather is a sketch or an imitation
// of security concerns. Proper salt and bcrypt
// (or what is fashionable nowadays) would be better
import crypto from 'crypto'

const GLOBAL_SALT = 'CAFEBABEDEADBEEFCAFEBABEDEADBEEF'

function sha512(plaintext) {
  var h = crypto.createHmac('sha512', GLOBAL_SALT)
  h.update(plaintext)
  return h.digest('hex')
}

export function hash(email, password) {
  return sha512(email + '_/_' + password)
}
