
import access from './access'
import * as passwords from './password'
import * as session from './session'
import * as profile from './profile'

// Just didn't want to dive into Mongoose
// or similar tools just yet,
// but it would be a great idea to define and validate schema for it
const USER_SAMPLE = {
  _id: 'normalized@email',
  password: 'hexhash',
  profile: {
    name: 'Full Name',
    age: 32,
    religion: 'x', // opt, but can be anything, even "jedi" and "spaghetti monster" would not be offended
    gender: '', // opt, assuming "F", "M", but can be anything
  },
  preference: {
    age: [20, 40], // age range
    religion: 'x', //opt
  },
  reviewed: { 'user@email': 1 }, // this is not very scalable, but let it be for now
}
const DUPLICATE_ID_CODE = 11000

let users = access.db.collection('users')

export function signup(user) {
  let { email, password } = user
  if (!email || typeof email != 'string') {
    return Promise.reject(new Error('invalid: please provide valid email(username) string: ' + JSON.stringify(user)))
  }
  if (!password || typeof password != 'string') {
    return Promise.reject(new Error('invalid: please provide valid password string'))
  }
  email = normalizeEmail(email)
  let hash = passwords.hash(email, password)

  let violations = profile.validate(user)
  if (violations.length) {
    let err = new Error('invalid: submitted profile is incomplete or contains mistakes')
    err.violations = violations
    return Promise.reject(err)
  }

  return users.insert({
    _id: email,
    password: hash,
    profile: user.profile,
    preference: user.preference || {},
    reviewed: []
  }).then(result => {
    return {ok: 1}
  }).catch(err => {
    if (err.code == DUPLICATE_ID_CODE) {
      throw new Error(`invalid: user with email ${email} already exists`)
    }
    throw err
  })
}

export function load(email) {
  email = normalizeEmail(email)
  return users.findOne({
      _id: email
    }, {
      fields: {password: 0}
    })
    .then(presentOfFail('noaccess: no such user'))
}

export function login(email, password) {
  email = normalizeEmail(email)
  let hash = passwords.hash(email, password)

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
