// Decided to not mess with cookies and provide quite
// explicit session handling using expiring database
// storage and explicit passing of the session key
import access from './access'
import mongodb from 'mongodb'

const TTL_SEC = 60

let session = access.db.collection('session')

// ensure TTL index is created on session
session.ensureIndex({at: 1}, { expireAfterSeconds: TTL_SEC })

/**
 * Create new session
 */
export function create(email) {
  // cryptographically strong psedorandom key would be better
  let _id = new mongodb.ObjectID()
  return session.insert({
      _id,
      email,
      at: new Date()
    })
    .then(() => ({sessionKey: _id.toString() }))
}

export function get(key) {
  try {
    key = mongodb.ObjectID(key)
  } catch(ex) {
    return Promise.reject(new Error('badrequest: wrong sessionKey format'))
  }
  return session.findOne({_id: key})
    .then(s => {
      if (!s) throw new Error('noaccess: no such session')
      return s.email
    })
}

/**
 * Auxiliary query for all sessions
 */
export function all() {
  return session.find({})
    .toArray()
    .then(res => {
      console.log(res)
      return res
    })
}
