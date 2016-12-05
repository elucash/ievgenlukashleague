'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.populateUsers = populateUsers;

var _access = require('./access');

var _access2 = _interopRequireDefault(_access);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// started to play with "faker" but then just decided to
// stick with plain counters and randoms

var users = _access2.default.db.collection('users');

var religions = ['A', 'B', 'C', undefined, undefined, undefined];
var genders = ['F', 'M', undefined];

function randomReligion() {
  return religions[Math.floor(Math.random() * religions.length)];
}

function randomGender() {
  return genders[Math.floor(Math.random() * genders.length)];
}

function randomAge(median, radius) {
  return Math.floor(median - radius + Math.random() * radius * 2);
}

function randomBoolean() {
  return Math.random() < 0.5;
}

function randomPassword() {
  return 'passwd' + Math.random();
}

function randomName() {
  return 'Name ' + Math.random();
}

function randomEmail() {
  return Math.random() + '@server.com';
}

function randomUser() {
  return {
    _id: randomEmail(),
    password: randomPassword(),
    profile: {
      name: randomName(),
      age: randomAge(40, 20),
      religion: randomReligion(),
      gender: randomGender()
    },
    preference: {
      age: randomBoolean() ? undefined : [randomAge(28, 10), randomAge(40, 10)],
      religion: randomReligion()
    },
    reviewed: {}
  };
}

var batchSize = 10;
var batchCount = 10;

function populateUsers() {
  var data = [];
  for (var c = 0; c < batchSize; c++) {
    data.push(randomUser());
  }
  users.insert(data, function () {
    if (--batchCount > 0) {
      populateUsers();
    }
  });
}