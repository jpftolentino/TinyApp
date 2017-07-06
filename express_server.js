/*~~~~~~~~~~~~~~~~~~~~REQUIRED MODULES~~~~~~~~~~~~~~~~~~~~*/


var PORT = process.env.PORT || 8080; // default port 8080

var express = require("express");
var app = express();

const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

/*~~~~~~~~~~~~~~~~~~~~USERS~~~~~~~~~~~~~~~~~~~~*/

//for numbers use for loop, for strings for in
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "goku@saiyan.com",
    password: "supersaiyan"
  },
  "user4RandomID": {
    id: "user4RandomID",
    email: "winston@battle.net",
    password: "harambe"
  }
}

/*~~~~~~~~~~~~~~~~~~~~URL DB~~~~~~~~~~~~~~~~~~~~*/


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

/*~~~~~~~~~~~~~~~~~~~~ADDITIONAL FUNCTIONS~~~~~~~~~~~~~~~~~~~~*/

//generates 5 random characters
function generateRandomURLid() {
  return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1);
}

//generates 6 random characters
function generateRandomUSERid() {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
}

function getUserId(email){
  for (var userId in users) {
    if(users[userId]['email'] == email){
      return userId;
    }
  }
}

function checkEmail(email) {
  for (var userId in users) {
    if(users[userId]['email'] == email){
      return true;
    }
  }

  return false;
}

function checkPassword(password) {
  for (var userId in users) {
    if(users[userId]['password'] == password){
      return true;
    }
  }

  return false;
}

/*~~~~~~~~~~~~~~~~~~~~GET~~~~~~~~~~~~~~~~~~~~*/

app.get("/", (req, res) => {
  res.redirect("urls");
});

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/login", (req, res) => {
  let userId = req.cookies.user_id;
  let userInfo = users[userId];
  let templateVars = { urls: urlDatabase, users: userInfo};
  let longURL = urlDatabase[req.params.shortURL];
  res.render("urls_login", templateVars);
});

//Gets register page
app.get("/register", (req, res) => {
  res.render("urls_register");
});

//Sends user to actual website of shorURL
app.get("/u/:shortURL", (req, res) => {
  let userId = req.cookies.user_id;
  let userInfo = users[userId];
  let templateVars = { urls: urlDatabase, users: userInfo};
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL, templateVars);
});

//Actual index page is being shown with shortURLS and longURLS
app.get("/urls", (req, res) => {
  let userId = req.cookies.user_id;
  if(userId === undefined){
    let templateVars = { urls: urlDatabase, currentUser: false};
    res.render("urls_index", templateVars);
  } else {
    let userInfo = users[userId];
    let userEmail = users[userId]['email'];
    let templateVars = { urls: urlDatabase, users: userInfo, currentUser: userEmail };
    res.render("urls_index", templateVars);
  }
});

//Adding new URL
app.get("/urls/new", (req, res) => {
  let userId = req.cookies.user_id;
  if(userId === undefined){
    let templateVars = { urls: urlDatabase, currentUser: false};
    res.render("urls_index", templateVars);
  } else {
    let userInfo = users[userId];
    let userEmail = users[userId]['email'];
    let templateVars = { urls: urlDatabase, users: userInfo, currentUser: userEmail };
  res.render("urls_new", templateVars);
  }
});

//checks URL database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Modifying long url before making it a shortURL
app.get("/urls/:id", (req, res) => {
  let userId = req.cookies.user_id;
  let userInfo = users[userId];
  let userEmail = users[userId]['email'];
  let templateVars = { urls: urlDatabase, users: userInfo, currentUser: userEmail };
  res.render("urls_show", templateVars);

});


/*~~~~~~~~~~~~~~~~~~~~POST~~~~~~~~~~~~~~~~~~~~*/

app.post("/register", (req, res) => {
  //generate new user ID
  let randomUSERid = generateRandomUSERid();
  let registerEMAIL = req.body.email;
  let registerPASS = req.body.password;
  var emailExist = false;
  //Create a function that checks to see if email exists

  emailExist = checkEmail(registerEMAIL);

  if( registerEMAIL == "" || registerPASS == ""){
    res.status(400).send("Email or Password cannot be empty!");
  } else if(emailExist == true){
    res.status(400).send("Email already exists!");
  } else {
    users[randomUSERid] = {id:randomUSERid, email:registerEMAIL, password:registerPASS}
    res.cookie("user_id", randomUSERid);
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  var shortLink = generateRandomURLid();
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
  let key = req.params.id;
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;
  let userId = getUserId(loginEmail);

  if(checkEmail(loginEmail)){
    if(checkPassword(loginPassword)){
        res.cookie('user_id', userId);
        console.log(userId);
        res.redirect("/");
    } else {
      res.status(403).send("Password does not match");
    }
  } else {
    res.status(403).send("User does not exist");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});