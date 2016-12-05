'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _access = require('./access');

var _access2 = _interopRequireDefault(_access);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var appPort = process.env.PORT || 8080;
var dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

// For the sake of simplicity, we'll try to connect to the database
// and only when connection will succeed, there will be call to init
// callback. If connection or server start will fail, we're better to
// exit process and defer any actions like trying to restart us again
// to the surrounding infrastructure.
// The another aspect is storing 'app' and 'db' references

function initApp() {
  var app = (0, _express2.default)();
  _access2.default.app = app;

  // registering routes on the app,
  // we doing this lazily to make sure any modules referenced
  // from route.js will be able to observe 'access {app, db}' already initialized
  // having to use ['default'] is an es6/babel quirk
  require('./route')['default'](app);

  var server = app.listen(appPort, function () {
    console.log('running app on port: ' + server.address().port);
  });
}

function initDatabase() {
  _mongodb2.default.MongoClient.connect(dbUri, function (err, db) {
    if (err) {
      console.error('Cannot connect to mongodb: ' + dbUri);
      process.exit(1);
    }
    _access2.default.db = db;
    console.log('Connection to mongodb established: ' + dbUri);

    initApp();
  });
}

//starting init sequence
initDatabase();