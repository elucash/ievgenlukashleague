import access from './access'
import mongodb from 'mongodb'

// Decided to not mess with cookies and provide quite
// explicit session handling using expiring database
// storage and explicit passing of the session key

// Properly encrypted cookies could be better alternative
// for storing expiring sessions to avoid DB lookups
const TTL_SEC = 60

let session = access.db.collection('session')

// ensure TTL index is created on session
session.ensureIndex({at: 1}, { expireAfterSeconds: TTL_SEC })

/** Create new session */
export function create(email) {
  // cryptographically strong psedorandom key would be better
  let _id = new mongodb.ObjectID()
  return session.insert({
      _id,
      email,
      at: new Date()
    })
    .then(() => _id.toString())
}

/** Get session by key */
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
