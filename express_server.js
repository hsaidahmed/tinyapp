const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


app.use(cookieParser());
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

const getUserByEmail = (email) => {
  const userVal = Object.values(users);
  // const user = users[id];
  for (const user of userVal) {
    if (user.email === email) {
      return user;
    }
  }
  return null;

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
  const userid = req.cookies["user_id"];
  const user = users[userid];
  if (!user) {
    return res.status(400).send("login first!");
  }
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const userid = req.cookies["user_id"];
  const user = users[userid];
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars = {user};
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userid = req.cookies["user_id"];
  const user = users[userid];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {shortURL, longURL, user};


  res.render("urls_show", templateVars);

});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {
    res.redirect("/urls");
    return;
  }

  res.render("register", {user});
});

app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];

  if (user) {
    
    res.redirect("/urls");
    return;
  }

  res.render("login",{user});
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Email or password field cannot be empty");
  }
  if (getUserByEmail(email)) {
    return res.status(400).send("Email already exists!");
  }
  const id = generateRandomString();
  const user = {id , email, password};
  users[id] = user;
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (!user) {
    return res.status(400).send("login first!");
  }
  const userID = req.cookies["user_id"];
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
  const loginUser = getUserByEmail(email);
  if (!loginUser || loginUser.password !== password) {
    return res.status(400).send("Invalid credentials provided. Please re-enter valid email and password");
  }
  res.cookie("user_id", loginUser.id);
  res.redirect("/urls");
  
});
  
app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
