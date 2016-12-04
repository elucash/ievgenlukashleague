
import access from './access'
import * as password from './password'
import * as session from './session'

const USER_SAMPLE = {
  _id: 'normalized@email',
  password: 'hexhash',
  name: 'Full Name',
  age: 32,
  religion: 'x', // opt
  gender: '', // opt
  preference: {
    age: [20, 40],
    religion: 'x', //opt
  }
}

let users = access.db.collection('users')

export function signup(user) {
  email = normalizeEmail(email)
  let hash = password.hash(email, password)
}

export function load(email) {
  email = normalizeEmail(email)
  return users.findOne({_id: email}, {fields: {password: 0}})
    .presentOfFail('noaccess: no such user')
}

export function signin(email, password) {
  email = normalizeEmail(email)
  let hash = password.hash(email, password)

  return users.findOne({
      _id: email,
      password: hash
    })
    .then(presentOfFail('noaccess: email or password do not match our records'))
    .then(() => session.create(email))
}

function presentOfFail(message) {
  return v => {
    if (!v) throw new Error(message)
    return v
  }
}

// speculative canonicalization of the email
function normalizeEmail(email) {
  return email.trim().toLowerCase()
}
