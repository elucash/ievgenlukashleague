import access from './access'
import mongodb from 'mongodb'

// started to play with "faker" but then just decided to
// stick with plain counters and randoms

let users = access.db.collection('users')

const religions = ['A', 'B', 'C', undefined, undefined, undefined]
const genders = ['F', 'M', undefined]

function randomReligion() {
  return religions[Math.floor(Math.random() * religions.length)]
}

function randomGender() {
  return genders[Math.floor(Math.random() * genders.length)]
}

function randomAge(median, radius) {
  return Math.floor(median - radius + Math.random() * radius * 2)
}

function randomBoolean() {
  return Math.random() < 0.5
}

function randomPassword() {
  return 'passwd' + Math.random()
}

function randomName() {
  return 'Name ' + Math.random()
}

function randomEmail() {
  return Math.random() + '@server.com'
}

function randomUser() {
  return {
    _id: randomEmail(),
    password: randomPassword(),
    profile: {
      name: randomName(),
      age: randomAge(40, 20),
      religion: randomReligion(),
      gender: randomGender(),
    },
    preference: {
      age: randomBoolean() ? undefined : [randomAge(28, 10), randomAge(40, 10)],
      religion: randomReligion(),
    },
    reviewed: {}
  }
}

const batchSize = 10
let batchCount = 10

export function populateUsers() {
  let data = []
  for (let c = 0; c < batchSize; c++) {
    data.push(randomUser())
  }
  users.insert(data, () => {
    if (--batchCount > 0) {
      populateUsers()
    }
  })
}
