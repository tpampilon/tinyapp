const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const hfunc = require('./helpers');

app.set("view engine", "ejs");

// middleware

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'user_id',
  keys: ['key1', 'key2']
}));

// Database

let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "testtest" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "testtest" },
  "5sfdsK": { longURL: "http://www.facebook.com", userID: "nottesttest" }
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
    password: "$2a$10$HZ2FDxu/0KX3z7HPbO4PZeBSyWi2QKXzIIWaGMIHB6a.UbTZk0Lc6"
  }
};

// Routes

// route for new shortURL creation
app.get("/urls/new", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  // used cookieId = templateVars.user_id for clarity
  const cookieId = templateVars.user_id;
  if (templateVars.users[cookieId] === undefined) {
    return res.redirect('/login');
  }
  
  res.render("urls_new", templateVars);
});

// generates a randomized shortURL and creates a new object in urlDatabase
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const shortURL = hfunc.generateRandomString(6);
  
  urlDatabase[shortURL] = {

    longURL: req.body.longURL,
    userID: users[userId].id
  
  };
  
  res.redirect('/urls');
});

// route that deletes shortURLs
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(401).send('You must be logged in access this feature');
  }

  delete urlDatabase[req.params.shortURL];
  
  res.redirect("/urls");
});

// posts the edit of the longURL from urls_show
app.post("/urls/:shortURL/edit", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(401).send('You must be logged in access this feature');
  }

  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  
  res.redirect("/urls");
});

// urls index list
app.get("/urls", (req, res) => {
  const shortUrlsOnly = hfunc.urlsForUser(req.session.user_id, urlDatabase);
  const templateVars = {
    urls: shortUrlsOnly,
    users: users,
    user_id: req.session.user_id
  };

  if (users[req.session.user_id] === undefined) {
    return res.redirect('/notlogged');
  }

  res.render("urls_index", templateVars);
});

// route for users that are not logged in yet
app.get("/notlogged", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };

  res.render('register_or_login', templateVars);
});

// route containing shortURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    dataBase: urlDatabase,
    users: users,
    user_id: req.session.user_id
  };
  
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Page does not exist');
  }
  if (urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.status(401).send('You must be logged in access this feature');
  }

  res.render("urls_show", templateVars);
});

// route that redirects the client to the longURL site
app.get("/u/:shortURL", (req, res) => {
  
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Page does not exist');
  }
  
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// login page
app.get("/login", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  
  res.render('login', templateVars);
});

// login post that verifies email and password
app.post("/login", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  const email = req.body.email;
  const password = req.body.password;
  const idEmail = hfunc.getUserByEmail(email, users);
  
  if (!idEmail) {
    return res.status(403).send('Wrong password or email');
  }
  if (!bcrypt.compareSync(password, users[idEmail].password)) {
    return res.status(403).send('Wrong password or email');
  }
  if (users[idEmail].email === email && bcrypt.compareSync(password, users[idEmail].password)) {
    req.session.user_id = users[idEmail].id;
    return res.redirect('/urls');
  }
  
  res.render('login', templateVars);
});

// logout logic
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// register page
app.get("/register", (req, res) => {
  const templateVars = {
    users: users,
    user_id: req.session.user_id
  };
  
  res.render("register", templateVars);
});

// register POST where we take requests from register pages
app.post("/register", (req, res) => {
  const randomId = hfunc.generateRandomString(13);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  if (email === '' || password === '') {
    return res.status(400).send('Bad Request');
  }
  if (hfunc.getUserByEmail(email, users)) {
    return res.status(400).send('Bad Request');
  }

  users[randomId] = {
    id: randomId,
    email: email,
    password: hashedPassword
  };
  
  req.session.user_id = users[randomId].id;
  res.redirect('/urls');
});

//default page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//catch page
app.get("*", (req, res) => {
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});