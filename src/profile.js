// this file has to do with validating and matching profiles
import access from './access'

let users = access.db.collection('users')

const DEFAULT_MATCHES_LIMIT = 5

// Compound index for more or less
// efficient matching searches
users.ensureIndex({
  'profile.age': 1,
  'profile.religion': 1,
  'profile.gender': 1,
  _id: 1, // planning to use _id for exclusion of liked/rejected once
}, {
  name: 'match'
})

export function matches(user, limit) {
  limit = limit || DEFAULT_MATCHES_LIMIT

  let query = {}
  adjustMatchQuery(query, user.preference, user.reviewed)
  users.find(query).limit(limit)
}

function adjustMatchQuery(query, preference, reviewed) {
  if (preference.age) {
    let [min, max] = preference.age
    query.age = { $gte: min, $lte: max }
  }
  if (preference.religion) {
    query.religion = preference.religion
  }
  if (preference.gender) {
    query.gender = preference.gender
  }
  if (reviewed) {
    query._id = { $nin: Object.keys(reviewed) }
  }
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
      } else {
        // ha-ha, 200 seems like a an age )
        if (min < 0 || max > 200 || min > max) {
          violations.push(description + ' bounds are out of range 0 <= min <= max <= 200 numbers')
        }
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
    if (value < 0 || value > 200) {
      violations.push(description + ' is out of range 0 <= value <= 200')
    }
  }
}
