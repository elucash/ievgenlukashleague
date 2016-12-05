'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // this file has to do with validating and matching profiles


exports.matches = matches;
exports.validate = validate;

var _access = require('./access');

var _access2 = _interopRequireDefault(_access);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var users = _access2.default.db.collection('users');

var DEFAULT_MATCHES_LIMIT = 5;

// Compound index for more or less
// efficient matching searches
users.ensureIndex({
  'profile.age': 1,
  'profile.religion': 1,
  'profile.gender': 1,
  _id: 1 }, {
  name: 'match'
});

function matches(user, limit) {
  limit = limit || DEFAULT_MATCHES_LIMIT;

  var query = {};
  adjustMatchQuery(query, user.preference, user.reviewed);
  users.find(query).limit(limit);
}

function adjustMatchQuery(query, preference, reviewed) {
  if (preference.age) {
    var _preference$age = _slicedToArray(preference.age, 2),
        min = _preference$age[0],
        max = _preference$age[1];

    query.age = { $gte: min, $lte: max };
  }
  if (preference.religion) {
    query.religion = preference.religion;
  }
  if (preference.gender) {
    query.gender = preference.gender;
  }
  if (reviewed) {
    query._id = { $nin: Object.keys(reviewed) };
  }
}

/**
 * While we would generally match by using db query,
 * but we will also do reverse matching in code
 */
function matchesPreference(profile, preference) {
  if (preference.age) {
    var _preference$age2 = _slicedToArray(preference.age, 2),
        min = _preference$age2[0],
        max = _preference$age2[1];

    if (profile.age < min || profile.age > max) return false;
  }
  if (preference.religion) {
    if (profile.religion != preference.religion) return false;
  }
  if (preference.gender) {
    if (profile.gender != preference.gender) return false;
  }
  return true;
}

function validate(user) {
  var validate = validations();
  validate.preference(user.preference || {});
  validate.profile(user.profile);
  return validate.violations;
}

function validations() {
  var violations = [];
  return {
    preference: function preference(_preference) {
      validateAgeRange(_preference.age, 'age range preference');
      validateString(_preference.religion, 'religion preference');
      validateString(_preference.gender, 'gender preference');
    },
    profile: function profile(_profile) {
      validateRequiredAge(_profile.age, 'profile age');
      validateString(_profile.religion, 'profile religion');
      validateString(_profile.gender, 'profile gender');
    },

    get violations() {
      return violations;
    }
  };

  // Below are very basic validations.
  // I would replace this with some sort of schema validation library.

  function validateAgeRange(range, description) {
    if (range === null || range === undefined) return;
    if (!range instanceof Array || range.length != 2) {
      violations.push(description + ' is not [min, max]');
    } else {
      var _range = _slicedToArray(range, 2),
          min = _range[0],
          max = _range[1];

      if (typeof min != 'number' || typeof max != 'number') {
        violations.push(description + ' bounds are not [min, max] numbers');
      } else {
        // ha-ha, 200 seems like a an age )
        if (min < 0 || max > 200 || min > max) {
          violations.push(description + ' bounds are out of range 0 <= min <= max <= 200 numbers');
        }
      }
    }
  }

  function validateString(value, description) {
    if (value === null || value === undefined) return;
    if (typeof value != 'string') {
      violations.push(description + ' is not a string');
    }
  }

  function validateRequiredAge(value, description) {
    if (typeof value != 'number') {
      violations.push(description + ' is required as a number');
    }
    if (value < 0 || value > 200) {
      violations.push(description + ' is out of range 0 <= value <= 200');
    }
  }
}