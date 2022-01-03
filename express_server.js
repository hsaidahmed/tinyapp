// importing external modules
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers.js");

app.use(morgan("dev"));
app.use(
  cookieSession({
    name: "session",
    secret: "-KaPdSgVkYp2s5v8y/B?E(H+MbQeThWm",
  })
);
app.use(bodyParser.urlencoded({ extended: true })); // enables body parse
app.set("view engine", "ejs");

// URL database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

// User database
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
// Urls page with short URLs and long URLs
app.get("/urls", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  const urls = urlsForUser(userid, urlDatabase);
  const templateVars = { urls, user };
  if (!user) {
    return res.status(403).render("urls_index", templateVars);
  }
  res.render("urls_index", templateVars);
});
// Generates a new short URL from a long URL
app.get("/urls/new", (req, res) => {
  const userid = req.session.user_id;
  const user = users[userid];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
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
  const templateVars = { shortURL, longURL, user, userUrls };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Registering new user and password
app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
    return;
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("register", templateVars);
});

// Logging in with registered username and password 
app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls"); // redirecting to urls page when logged in
    return;
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
// Makes sure email or password field is not empty
  if (!email || !password) {
    return res.status(403).send("Email or password field cannot be empty");
  }
  // Makes sure an email already registered is not registered again
  if (getUserByEmail(email, users)) {
    return res.status(403).send("Email already exists!");
  }
  const id = generateRandomString(); // generating a new short ID for a new user
  const user = { id, email, hashedPassword };
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
  let shortURL = generateRandomString(); // generates random short ID for the short URL
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});
app.post("/urls/:shortURL/delete", (req, res) => {
  console.log("deleting");
  let shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  if (urlDatabase[shortURL].userID != userID) {
    res.send("You cannot delete this URL!"); // cannot delete short URL of other users
    return;
  }
  delete urlDatabase[shortURL]; // deletes short URL 
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = req.body.longURL;
  const userID = req.session.user_id;
  if (urlDatabase[shortURL].userID != userID) {
    res.send("You cannot edit this URL!"); // cannot edit short URL of other users
    return;
  }
  urlDatabase[shortURL].longURL = longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const loginUser = getUserByEmail(email, users); 
  // confirms the password of the user is correct
  if (loginUser && bcrypt.compareSync(password, loginUser.hashedPassword)) {
    req.session.user_id = loginUser.id;
    res.redirect("/urls");
    return;
  }
  return res // if incorrect password used to login then invalid message appears
    .status(403)
    .send(
      "Invalid credentials provided. Please re-enter valid email and password"
    );
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Server running in development mode & listening on port ${PORT}:`);
}); 
