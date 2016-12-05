// this file has to do with validating and matching profiles
import access from './access'

let users = access.db.collection('users')

const DEFAULT_MATCHES_LIMIT = 5
const MIN_AGE = 0
const MAX_AGE = 200 // haha
const REVIEW_LIKE = 1
const REVIEW_REJECT = -1

// Compound index for more efficient matching searches
users.ensureIndex({
  'profile.age': 1,
  'profile.religion': 1,
  'profile.gender': 1,
  _id: 1, // use _id for exclusion of reviewed (liked/rejected)
}, {
  name: 'match' // just as paranoia I'll reference it by using a hint
})


// Scalability notes: It is better create background job to precompute
// potential matches with more detailed checks. However here we just attempting
export function matches(user, limit) {
  limit = limit || DEFAULT_MATCHES_LIMIT

  let options = {hint: 'match', fields: {password: 0, reviewed: 0}}
  let query = buildMatchQuery(user.preference, user.reviewed)

  return new Promise((resolve, reject) => {
    let results = []

    // Cursor here instead of limit().toArray()
    // because we're not sure if all 5 (limit) will match us
    // via reverse preference check
    // default batchSize makes streaming more or less efficient
    let cursor = users.find(query, options)
    cursor.each((err, potentialCandidate) => {
      if (err) {
        reject(err)
        return
      }
      if (!potentialCandidate || results.length >= limit) {
        // no new results or enough results
        cursor.close()
        resolve(results)
        return
      }

      // here we check for other's user preference
      // to determine if we are a
      // currently, there is no check if we were rejected by other user
      if (matchesPreference(user.profile, potentialCandidate.preference)) {
        results.push(potentialCandidate)
      }
    })
  })
}

function buildMatchQuery(preference, reviewed) {
  let query = {}
  if (preference.age) {
    let [min, max] = preference.age
    query['profile.age'] = { $gte: min, $lte: max }
  }
  if (preference.religion) {
    query['profile.religion'] = preference.religion
  }
  if (preference.gender) {
    query['profile.gender'] = preference.gender
  }
  if (reviewed && reviewed.length) {
    query._id = { $nin: Object.keys(reviewed) }
  }
  return query
}

/**
 * While we would generally match by using db query,
 * but we will also do reverse matching in code
 */
function matchesPreference(profile, preference) {
  if (preference.age) {
    let [min, max] = preference.age
    if (profile.age < min || profile.age > max) return false
  }
  if (preference.religion) {
    if (profile.religion != preference.religion) return false
  }
  if (preference.gender) {
    if (profile.gender != preference.gender) return false
  }
  return true
}

export function review(user, review) {
  // TODO Reviews are incomplete,
  // basically idea to insert valid review values REVIEW_LIKE, REVIEW_REJECT
  // {
  //
  //}
}

export function validate(user) {
  let validate = validations()
  validate.preference(user.preference || {})
  validate.profile(user.profile)
  return validate.violations
}

function validations() {
  let violations = []
  return {
    preference(preference) {
      validateAgeRange(preference.age, 'age range preference')
      validateString(preference.religion, 'religion preference')
      validateString(preference.gender, 'gender preference')
    },
    profile(profile) {
      validateRequiredAge(profile.age, 'profile age')
      validateString(profile.religion, 'profile religion')
      validateString(profile.gender, 'profile gender')
    },
    get violations() {
      return violations
    }
  }

  // Below are very basic validations.
  // I would replace this with some sort of schema validation library.

  function validateAgeRange(range, description) {
    if (range === null || range === undefined) return
    if (!range instanceof Array || range.length != 2) {
     violations.push(description + ' is not [min, max]')
    } else {
      let [min, max] = range
      if (typeof min != 'number' || typeof max != 'number') {
        violations.push(description + ' bounds are not [min, max] numbers')
      } else if (min < MIN_AGE || max > MAX_AGE || min > max) {
        violations.push(description + ' bounds are out of range 0 <= min <= max <= 200 numbers')
      }
    }
  }

  function validateString(value, description) {
    if (value === null || value === undefined) return
    if (typeof value != 'string') {
      violations.push(description + ' is not a string')
    }
  }

  function validateRequiredAge(value, description) {
    if (typeof value != 'number') {
      violations.push(description + ' is required as a number')
    }
    if (value < MIN_AGE || value > MAX_AGE) {
      violations.push(description + ' is out of range 0 <= value <= 200')
    }
  }
}
