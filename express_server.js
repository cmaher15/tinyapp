const PORT = 8080;
const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { use } = require('express/lib/application');


//CONFIGURATION 
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//DATABASES 


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
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'raccon-up-a-tree',
    hashedPassword: 'vrymltknehltm'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk',
    hashedPassword: '#C5jl36hvl4b6'
  }
};

//MIDDLEWARE
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['user_ID', 'key2'],
  maxAge: 24 * 60 * 60 * 1000
}));


//HELPER FUNCTIONS

function generateRandomString(url) {
  const result = Math.random().toString(36).substring(2, 8);
  return (result);
}

function urlsForUser(loggedInUserID) {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (loggedInUserID === urlDatabase[shortURL].userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};

//ROUTES

//MAIN USER PAGE WHICH STORES THE URL DATABASE
app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user) {
    return res.status(403).send("Error 403 - You must be logged in to see this page");
  }
  const urls = urlsForUser(userID);
  const templateVars = { user, urls };
  res.render('urls_index', templateVars);
});

//PAGE FOR USER TO ADD A NEW URL 
app.get('/urls/new', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { user, urls: urlDatabase };
  if (user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//CODE WHICH LETS USER ADD NEW URL AND GENERATES A RANDOM CODE FOR THAT URL. REDIRECTS THEM TO /SHORTURL PAGE ONCE LINK IS COMPLETE
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  let returnUser = {
    longURL: req.body.longURL,
    userID
  };
  urlDatabase[shortURL] = returnUser;
  const user = users[userID];
  if (user) {
    res.redirect(`/urls/${shortURL}`);
  }
});


//THE PAGE THAT GENERATES AFTER A SHORT URL IS CREATED.
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user, urls: urlDatabase };
  if (!user) {
    return res.status(403).send("Error 403 - you must be logged in to see this page");
  }
  res.render('urls_show', templateVars);
});

//REDIRECTS USER TO THE ACTUAL WEBSITE REPRESENTED BY SHORT URL
app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("404 - Page Not Found.");
  }

  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

//DELETES A LINK
app.post('/urls/:shortURL/delete', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (url.userID !== userID) {
    return res.status(403).send('Error 403 - you do not have permission for this feature.');
  }

  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//DIRECTS USER TO 'EDIT' PAGE FOR THAT LINK WHEN EDIT BUTTON IS CLICKED.
app.get('/urls/:shortURL/', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//ALLOWS A USER TO EDIT A LONG URL 
app.post('/urls/:shortURL/', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (url.userID !== userID) {
    return res.status(403).send('Error 403 - You do not have permission for this feature.');
  }

  let returnUser = {
    longURL: req.body.longURL,
    userID
  };
  urlDatabase[shortURL] = returnUser;
  res.redirect('/urls');
});

//LOGIN PAGE FOR USER 
app.get('/login', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render('url_login', templateVars);
});

//LOGIN FORM FOR USER
app.post("/login", (req, res) => {
  const loginEmail = req.body.email;
  const loginPassword = req.body.password;
  for (const id in users) {
    const user = users[id];
    if (user.email === loginEmail && bcrypt.compareSync(loginPassword, user.password)) {
      req.session.user_id = user['id'];
      return res.redirect('/urls');
    }
  }
  return res.status(401).send("Error 401 - Password or email are incorrect.");
});


//LOGOUT FOR USER
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//REGISTRATION PAGE
app.get('/register', (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render('url_register', templateVars);
});

//REGISTRATION FORM
app.post('/register', (req, res) => {

  for (const id in users) {
    let user = users[id];
    if ((req.body.email === "") || (req.body.password === "")) {
      return res.status(400).send('Error 400 - Email and password must not be blank');
    } else if (user.email === req.body.email) {
      return res.status(400).send('Error 400 - Email already in use');
    }
  }
  const userID = generateRandomString();
  const password = req.body.password;
  const hashPassword = bcrypt.hashSync(password, 10);
  users[userID] = { id: userID, email: req.body.email, password: hashPassword };
  return res.redirect('/login');
});




////////////NOT SURE IF I NEED THESE/////////////

//STORES CODE FOR DATABASE
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

//TEST CODE FOR SERVER
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

//TEST CODE FOR SERVER
app.get('/', (req, res) => {
  res.send('Hello!');
});

///////////////////////////////////////////////////


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});