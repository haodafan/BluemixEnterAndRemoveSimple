//Let us import things, my dude. -----------------------------------------------
var express = require('express');
var pug = require('pug');
var fs = require('fs');
var assert = require('assert');
var util = require('util');
var bodyParser = require('body-parser');

// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

//Database: MySQL
var mysql = require('mysql');

//Local module(s)
var load = require('./load')

// -----------------------------------------------------------------------------

//Let's start this thing, my dude
var app = express();
app.set('view engine', 'pug');
app.use(bodyParser.urlencoded({
  extended: false
}));


//Define port
var port = process.env.PORT || 8080;

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();


//Database setup ---------------------------------------------------------------
// Within the application environment (appEnv) there's a services object
var services = appEnv.services;

// The services object is a map named by service so we extract the one for MySQL
var mysql_services = services["compose-for-mysql"];

//This check ensures there is a services for MySQL databases
assert(!util.isUndefined(mysql_services), "Must be bound to compose-for-mysql services");

// We now take the first bound MySQL service and extract it's credentials object
var credentials = mysql_services[0].credentials;

var connectionString = credentials.uri;
// set up a new connection using our config details
var connection = mysql.createConnection(credentials.uri);
var databaseExists = false;

//Use this to access static files
app.use(express.static(__dirname + '/public'));

//First time mysql setup!
connection.connect(function(err) {
  console.log("First time setup function has begun running. Connection.connect 'd!'");
  if (err) {
    console.log(err);
  }
  else {
    /*
    connection.query("CREATE DATABASE IF NOT EXIST ShoutDB;", function(data) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
      }
      else {
        console.log("Database created.");

        */
        //connection.query("USE compose;", function(data) {
          //console.log("Database in use. ");
          connection.query("CREATE TABLE Shouts (ID INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), shout VARCHAR(512));", function(error, data) {
            if (error) {
              console.log(error);
              //res.status(500).send(err);
              if (error.code == 'ER_TABLE_EXISTS_ERROR') {
                databaseExists = true;
              }
            }
            else {
              console.log("Table has been created.");
              databaseExists = true;
              console.log("DATABASE EXISTS!");
              getMsges(res, function(data) {
                console.log("GET MSGS CALLBACK");
                console.log(data);
                load.make(res, data, function() {
                  console.log("Page created!");
                });
              });
            }
          });
        //});
      //}
    //});
  }
  console.log("Okay, we're done with this connection.connect function.");
});

// MODULAR HELPER FUNCTIONS ----------------------------------------------------
function addMsg(res, msg, next) {
  console.log("addMsg() has been invoked.");
  var newQuery = "INSERT INTO Shouts(name, shout) VALUES ('Some guy','"+ msg +"');"

  console.log("Query: '" + newQuery +"'");
  connection.query(newQuery, function(err, data, fields) {
    if (err) {
      res.status(500).send(err);
      console.log(err)
    }
    else {
      console.log("Query success! ");
      next(data);
    }
  });
}

function getMsges(res, next) {
  console.log("GetMsgs() function has been invoked. ");
  var newQuery = "SELECT * FROM Shouts;";
  console.log("Query: '" + newQuery +"'");

  var output;
  connection.query(newQuery, function(err, data, fields) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    }
    else {
      console.log("Query response: ");
      console.log(data);
      if (/*data === undefined ||*/ data === null || data === [] || data === '') {
        output = [];
      }
      else {
        output = []; //Not sure if this whole putting it into an output array thing is necessary tbh
        var i = 0
        data.forEach(function(item) {
            output[i] = item;
            i++;
        });
      }
      next(output);
    }
  });
}

//Routing ----------------------------------------------------------------------

app.get('/', function(req, res) {
  console.log("Routed from '/'");
  //Since there's no database let's make up some values
  //var tempData = ["Hello, world!", "D'Oh!", "You can't fight in here, this is the war room!", "Napoleon did nothing wrong. "];

  if (databaseExists) {
    console.log("DATABASE EXISTS!");
    getMsges(res, function(data) {
      console.log("GET MSGS CALLBACK");
      console.log(data);
      load.make(res, data, function() {
        console.log("Page created!");
      });
    });
  }
  else {
    load.make(res, ["Database does not exist, please reload."]);
    console.log("NO DATABASE DETECTED.");
  }

  //load.make(res, newData, function() {
  //  console.log("Page created!");
  //});
});

app.put('/add', function(req, res) {
  console.log("Routed from '/add'... ");
  console.log("----------------------- HERE IS THE CURRENT REQUEST STATUS -----------------------")
  console.log(req.body);
  var message = req.body.shout;
  addMsg(res, message, function(data) {
    console.log("AddMsg has successfully called back")
    console.log(data)
    location.reload();
  });
});

app.get('/DELETE-ERYTHIGN', function(req, res) {
  console.log("routed from DELETEJAL EVRYTHGNGN!!!!! D:");

  connection.query("DELETE FROM Shouts;", function(err, data, fields) {
    if (err) {
      res.status(500).send(err);
      console.log(err)
    }
    else {
      console.log("You have successfuly DELETED EVERYTHGING!@!!!1!!");
      location.reload();
    }
  });

});


//Let's start the app!
app.listen(port);
console.log("App is listening on: " + port);

require("cf-deployment-tracker-client").track();
