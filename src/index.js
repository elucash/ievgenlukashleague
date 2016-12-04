import express from "express"
import mongodb from "mongodb"
import bodyParser from "body-parser"
import access from "./access"

// For the sake of simplicity, we'll try to connect to the database
// and only when connection will succeed, there will be call to init
// callback. If connection or server start will fail, we're better to
// exit process and defer any actions like trying to restart us again
// to the surrounding infrastructure.
// The another aspect is storing 'app' and 'db' references

function initApp() {
  let app = express()
  access.app = app

  app.use(bodyParser.json())

  // registering routes on the app,
  // we doing this lazily to make sure any modules referenced
  // from route.js will be able to observe 'access {app, db}' already initialized
  // having to use ["default"] is es6/babel quirk
  require("./route")["default"](app)

  var server = app.listen(process.env.PORT || 8080, () => {
    console.log(`running app on port: ${server.address().port}`)
  })
}

function initDatabase() {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017'
  mongodb.MongoClient.connect(url, (err, db) => {
    if (err) {
      console.error(`Cannot connect to mongodb using url: ${url}`)
      process.exit(1)
    }
    access.db = db
    console.log(`Connection to mongodb established: ${url}`)

    initApp()
  })
}

initDatabase()
