var PORT = process.env.PORT || 8080; // default port 8080

var express = require("express");
var app = express();

const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomString = "";
  let possibleString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwuxyz0123456789";
  for (let i = 0; i < 6; i++) {
    randomString += possibleString.charAt(Math.floor(Math.random() * possibleString.length));
  }
  return randomString;
}


/*~~~~~~~~~~~~~~~~~~~~GET~~~~~~~~~~~~~~~~~~~~*/

app.get("/", (req, res) => {
  res.redirect("urls");
});

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

//Sends user to actualy website of shorURL
app.get("/u/:shortURL", (req, res) => {
  let templateVars = { urls: urlDatabase,username: req.cookies.username };
  //if i enter url into address bar it would redirect me to actual url
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL, templateVars);
});

//Actual index page is being shown with shortURLS and longURLS
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,username: req.cookies.username };
  res.render("urls_index", templateVars);
});

//Adding new URL
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,username: req.cookies.username };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  // let templateVars = { urls: urlDatabase,username: req.cookies.username };
  res.json(urlDatabase);
});

//Modifying long url before making it a shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id, username: req.cookies.username };
  res.render("urls_show", templateVars);

});


/*~~~~~~~~~~~~~~~~~~~~POST~~~~~~~~~~~~~~~~~~~~*/

app.post("/urls", (req, res) => {
  var shortLink = generateRandomString();
  urlDatabase[shortLink] = req.body.longURL;
  let responseLink = `http://localhost:8080/urls/${shortLink}`;
  res.redirect(responseLink);
});

app.post("/urls/:id", (req, res) => {
  let updateShortURL = req.params.id;
  urlDatabase[updateShortURL] = req.body.newURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req,res) => {
  console.log(urlDatabase);
  let key = req.params.id;
  console.log(urlDatabase[req.params.id]);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});