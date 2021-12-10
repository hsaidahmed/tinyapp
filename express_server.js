const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const database = require("mime-db");
const { STATUS_CODES } = require("http");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }

}
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
}
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
  const templateVars = { urls: urlDatabase, user };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const userid = req.cookies["user_id"];
  const user = users[userid];
  const templateVars = {user};
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const userid = req.cookies["user_id"];
  const user = users[userid];
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {shortURL, longURL, user};


  res.render("urls_show", templateVars);

});
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const userid = req.cookies["user_id"];
  const user = users[userid];
  const templateVars = {user};

res.render("register",templateVars);
})

app.post("/register", (req, res) => {
 if (req.body.email && req.body.password) {
   console.log(req.body.email)
   if (!getUserByEmail(req.body.email, users)) {

     let id = generateRandomString();
     const email = req.body.email;
     const password = req.body.password;
     users[id] = {
       id , email, password
     }
     res.cookie("user_id", id);
     res.redirect("/urls");
   }
   else {
    res.statusCode = 400;   
    res.send('Email already exists');

   }
 }
 else {
  res.statusCode = 400;
  res.send('Email field cannot be empty');
  }
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
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
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");

});
app.post("/login", (req, res) => {

  const username = req.body.Username;
  res.cookie("username", username);
  res.redirect("/urls");
});
app.post("/logout", (req,res) => {
  res.clearCookie("user_id");
  res.redirect("/register");
});
