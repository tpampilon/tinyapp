const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

// middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  },
  'testtest': {
    id: 'testtest',
    email: "test@test.com",
    password: "1234"
  }
};

app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_new", templateVars);
});

// generates a randomized shortURL and creates a new object in urlDatabase
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

// route that deletes shortURLs
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// edits the longURL from urls_show
app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// urls index list
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_index", templateVars);
});

// route containing shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("urls_show", templateVars);
});

// route that redirects the client to the longURL site
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// login page
app.get("/login", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render('login', templateVars)
});

// login post that verifies email and password
app.post("/login", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  const email = req.body.email;
  const password = req.body.password;
  const idEmail = getUserByEmail(email);

  if (idEmail === undefined) {
    res.send('Error 403 Forbidden');
  }
  if (users[idEmail].password !== password) {
    res.send('Error 403 Forbidden');
  }
  if (users[idEmail].email === email && users[idEmail].password === password) {
    res.cookie("user_id", users[idEmail].id);
    res.redirect('/urls');
  }

  res.render('login', templateVars)
});

// logout logic
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// register page
app.get("/register", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.cookies.user_id
  };
  res.render("register", templateVars);
});

// register POST where we take requests from register pages
app.post("/register", (req, res) => {
  const id = generateRandomString(13);
  const email = req.body.email;
  const password = req.body.password;
  
  if (email === '' || password === '') {
    res.send(`Error 400 Bad Request`);
  }
  if (getUserByEmail(email)) {
    res.send(`Error 400 Bad Request`);
  }

  users[id] = { 
    id: id,
    email: email,
    password: password
  };
  res.cookie("user_id", users[id].id);
  res.redirect('/urls');
});

// default page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// app.get("*", (req, res) => {
//   res.redirect("404");
// });


app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});

function generateRandomString(idLength) {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const length = idLength;
  let random = '';

  for (let i = length; i > 0; i--) {
    random += characters[Math.round(Math.random() * (characters.length - 1))];
  }
  return random;
}

function getUserByEmail(mail) {
  let userId = undefined;

  for (user in users) {
    if (users[user].email === mail) {
      userId = users[user].id
    } 
  }
  return userId;
};