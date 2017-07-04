var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

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

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

//only able to access urls key not the actualy object
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  var shortLink = generateRandomString();
  urlDatabase[shortLink] = req.body.longURL;
  let responseLink = `http://localhost:8080/urls/${shortLink}`;
  res.redirect(responseLink);
});


app.get("/urls/:id", (req, res) => {
  let templateVars = { urls: urlDatabase, shortURL: req.params.id};
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  //if i enter url into address bar it would redirect me to actual url
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});