var app = require("express")();
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var axios = require("axios");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// var request = require('request');
var request = require("request-promise");

app.get("/data", async (req, res) => {
  var options = {
    method: "POST",
    uri: "https://cms.bahria.edu.pk/Logins/Student/Login.aspx",
    form: {
      // Like <input type="text" name="name">
      ctl00$BodyPH$tbEnrollment: "02-134181-070",
      ctl00$BodyPH$tbPassword: "pak342:::%&*-PAK",
      ctl00$BodyPH$ddlInstituteID: "2",
      ctl00$BodyPH$ddlSubUserType: "None",
      ctl00$hfJsEnabled: "0",
    },
    transform: function (body) {
      return cheerio.load(body);
    },
  };

  request(options)
    .then(function ($) {
      // POST succeeded...
      console.log($.html());
      console.log("Helleo");
      res.send($.html());
    })
    .catch(function (err) {
      // POST failed...
      console.log(err);
      res.send(err);
    });
});

app.listen(5001, console.log("App Running"));
