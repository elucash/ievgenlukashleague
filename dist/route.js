'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (app) {
  app.get('/', function (req, res) {
    res.send('Hello World');
  });
};