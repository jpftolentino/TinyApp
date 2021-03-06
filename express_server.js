/*~~~~~~~~~~~~~~~~~~~~REQUIRED MODULES & DECLARATIONS~~~~~~~~~~~~~~~~~~~~*/


const PORT = process.env.PORT || 8080; // default port 8080
const bcrypt = require('bcrypt');
const methodOverride = require('method-override')
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const express = require("express");

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

app.use(cookieSession({
  name: 'session',
  keys: ['key1','key2'],

  maxAge: 24 * 60 * 60 * 1000
}))
/*~~~~~~~~~~~~~~~~~~~~USERS~~~~~~~~~~~~~~~~~~~~*/

//for numbers use for loop, for strings for in
const users = {
  "userRandomID": {
    'id': "userRandomID",
    'email': "user@example.com",
    'password': "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    'id': "user2RandomID",
    'email': "user2@example.com",
    'password': "dishwasher-funk"
  },
  "user3RandomID": {
    'id': "user3RandomID",
    'email': "goku@saiyan.com",
    'password': "supersaiyan"
  },
  "user4RandomID": {
    'id': "user4RandomID",
    'email': "winston@battle.net",
    'password': "harambe"
  }
}

/*~~~~~~~~~~~~~~~~~~~~URL DB~~~~~~~~~~~~~~~~~~~~*/


var urlDatabase = {
  "9sm4uK": {
    'longURL': "http://www.lighthouselabs.ca",
    'shortURL': '9sm4uK',
    'id': "user3RandomID"
  },
  "b3xVn4": {
    'longURL': "http://www.newegg.ca",
    'shortURL': 'b3xVn4',
    'id': "user3RandomID"
  },
  "b2xVn2": {
    'longURL': "http://www.battle.net",
    'shortURL': 'b2xVn2',
    'id': "user4RandomID"
  },
  "9sm5xK": {
    'longURL': "http://www.google.com",
    'shortURL': '9sm5xK',
    'id': "user4RandomID"
  }
};

/*~~~~~~~~~~~~~~~~~~~~ENCRYPT EXISTING PASSWORDS~~~~~~~~~~~~~~~~~~~~*/


for(var key in users){
  let password = users[key]['password'];
  var hashed_password = bcrypt.hashSync(password,10);
  users[key]['password'] = hashed_password;
}

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

function checkPassword(password, userId) {
  let hashedPassword = users[userId]['password'];
  return bcrypt.compareSync(password, hashedPassword);
}

/*~~~~~~~~~~~~~~~~~~~~GET~~~~~~~~~~~~~~~~~~~~*/

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let userId = req.session.user_id;
  if ( userId != undefined){
    res.redirect("/urls");
  } else {
    let userInfo = users[userId];
    let templateVars = { urls: urlDatabase, users: userInfo};
    let longURL = urlDatabase[req.params.shortURL];
    res.render("urls_login", templateVars);
  }
});

//Gets register page
app.get("/register", (req, res) => {
  let userId = req.session.user_id;
  if(userId !== undefined){
    res.redirect("/urls")
  } else {
    res.render("urls_register");
  }
});

//Sends user to actual website of shorURL
app.get("/u/:shortURL", (req, res) => {
  let userId = req.session.user_id;
  let userInfo = users[userId];
  let templateVars = { urls: urlDatabase, users: userInfo};
  let longURL = urlDatabase[req.params.shortURL]['longURL'];
  console.log(longURL);
  res.redirect(longURL);
});

//Actual index page is being shown with shortURLS and longURLS
app.get("/urls", (req, res) => {
  let userId = req.session.user_id;
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
  let userId = req.session.user_id;
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

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  let userId = req.session.user_id;
  if(userId === undefined){
    res.redirect("/login");
  } else {
    let shortURL = req.params.id;
    let userId = req.session.user_id;
    let userInfo = users[userId];
    let userEmail = users[userId]['email'];
    let templateVars = { urls: urlDatabase, users: userInfo, currentUser: userEmail, shortURL: shortURL};
    res.render("urls_show", templateVars);
  }
});


/*~~~~~~~~~~~~~~~~~~~~POST~~~~~~~~~~~~~~~~~~~~*/

app.post("/register", (req, res) => {
  let randomUSERid = generateRandomUSERid();
  let registerEMAIL = req.body.email;
  let registerPASS = req.body.password;
  var emailExist = false;

  emailExist = checkEmail(registerEMAIL);

  if( registerEMAIL == "" || registerPASS == ""){
    res.status(400).send("Email or Password cannot be empty!");
  } else if(emailExist == true){
    res.status(400).send("Email already exists!");
  } else {
    let hashedPassword = bcrypt.hashSync(registerPASS, 10);
    users[randomUSERid] = {id:randomUSERid, email:registerEMAIL, password:hashedPassword}
    req.session.user_id = randomUSERid;
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  var shortLink = generateRandomURLid();
  urlDatabase[shortLink] = {'longURL':req.body.longURL, 'shortURL':shortLink, 'id':req.session.user_id};
  let responseLink = `http://localhost:8080/urls/${shortLink}`;
  res.redirect(responseLink);
});

app.put("/urls/:id", (req, res) => {
    let userId = req.session.user_id;
    if( userId !== undefined ){
      let updateShortURL = req.params.id;
      urlDatabase[updateShortURL]['longURL'] = req.body.newURL;
      res.redirect("/urls");
    } else {
      res.redirect("/urls_404");
    }
});

app.delete("/urls/:id/delete", (req,res) => {
  let userId = req.session.user_id;
  if(userId !== undefined){
    let key = req.params.id;
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    let templateVars = { urls: urlDatabase, currentUser: false};
    res.redirect("/urls_404");
  }
});

app.post("/login", (req, res) => {
  let loginEmail = req.body.email;
  let loginPassword = req.body.password;
  let userId = getUserId(loginEmail);

  if(checkEmail(loginEmail)){
    if(checkPassword(loginPassword, userId)){
        req.session.user_id = userId;
        res.redirect("/urls");
    } else {
      res.status(403).send("Password does not match");
    }
  } else {
    res.status(403).send("User does not exist");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});