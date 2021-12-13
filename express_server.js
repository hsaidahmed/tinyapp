const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const {getUserByEmail, urlsForUser} = require('./helpers.js');



app.use(morgan("dev"));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  secret: '-KaPdSgVkYp2s5v8y/B?E(H+MbQeThWm'
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};


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
  }
};
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
 
app.get("/urls", (req, res) => {
 
  const userid = req.session.user_id;
  const user = users[userid];
  const urls = urlsForUser(userid, urlDatabase);
  const templateVars = { urls, user };
  if (!user) {
    return res.status(403).render("urls_index",templateVars);
  }
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {user};
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userid = req.session.user_id;
  
  if (!urlDatabase[shortURL] || !userid) {
    res.send("Please try again!");
  }
    if (urlDatabase[shortURL].userID != userid) {
      res.send("Please try again!");
    }

  
    const user = users[userid];
    const longURL = urlDatabase[shortURL].longURL;
    const userUrls = urlsForUser(userid, urlDatabase);
    const templateVars = {shortURL, longURL, user, userUrls};
    res.render("urls_show", templateVars);
  });

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userid = req.session.user_id;
  
  if (!urlDatabase[shortURL] || !userid) {
    res.send("Please try again!");
  }
    if (urlDatabase[shortURL].userID != userid) {
      res.send("Please try again!");
    }

  
    const user = users[userid];
    const longURL = urlDatabase[shortURL].longURL;
    const userUrls = urlsForUser(userid, urlDatabase);
    const templateVars = {shortURL, longURL, user, userUrls};
    res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = {user: users[req.session.user_id]};
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    
    res.redirect("/urls");
    return;
  }
 
  const templateVars = {user: users[req.session.user_id]};
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(403).send("Email or password field cannot be empty");
  }
  if (getUserByEmail(email, users)) {
    return res.status(403).send("Email already exists!");
  }
  const id = generateRandomString();
  const user = {id , email, hashedPassword};
  users[id] = user;
  req.session.user_id = id;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    return res.status(403).send("login first!");
  }
  const userID = req.session.user_id;
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userID};
  res.redirect(`/urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {

  console.log("deleting");

  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");

});
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const loginUser = getUserByEmail(email, users);
  
  if (loginUser && bcrypt.compareSync(password, loginUser.hashedPassword)) {
    req.session.user_id = loginUser.id;
    res.redirect("/urls");
    return;
  }
  
  return res.status(403).send("Invalid credentials provided. Please re-enter valid email and password");
});
  
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect("/urls");
});
