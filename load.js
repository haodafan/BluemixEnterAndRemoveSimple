//Requires
var pug = require('pug')
var express = require('express')

//Starts the app
app = express();
app.set('view engine', 'pug');

//Define port
var port = process.env.PORT || 8081


//Our main rendering function
function make(res, shoutData, callback) {
  //shoutData should be an array of data
  //Maybe in the future I'll make it into an array of arrays??
  console.log("make was invoked. ");
  //Outputs details
  res.render('home.pug', {data: shoutData})

  if (typeof callback === "function") {
    callback()
  }
}

module.exports = {
  make
};
