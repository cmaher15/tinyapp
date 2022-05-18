const PORT = 8080;
const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { use } = require('express/lib/application');


//CONFIGURATION 
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

//DATABASES 

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xk': 'http://www.google.ca'
};

const users = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'raccon-up-a-tree'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

//MIDDLEWARE
app.set('view engine', 'ejs');
app.use(cookieParser());


//SUPPORTING CODE

function generateRandomString(url) {
  const result = Math.random().toString(36).substring(2, 8);
  return (result);
}


//ROUTES

//MAIN USER PAGE WHICH STORES THE URL DATABASE
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_ID'];
  console.log('userID:', userID);
  const user = users[userID];
  if (user) {
    const templateVars = { user, urls: urlDatabase };
    res.render('urls_index', templateVars);
  } else {
    const templateVars = { user, urls: urlDatabase };
    res.render('urls_index', templateVars);
  }
});

//PAGE FOR USER TO ADD A NEW URL 
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_ID'];
  const user = users[userID];
  const templateVars = { user, urls: urlDatabase };
  res.render('urls_new', templateVars);
});

//CODE WHICH LETS USER ADD NEW URL AND GENERATES A RANDOM CODE FOR THAT URL. REDIRECTS THEM TO /SHORTURL PAGE ONCE LINK IS COMPLETE
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//THE PAGE THAT GENERATES AFTER A SHORT URL IS CREATED.
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_ID'];
  const user = users[userID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render('urls_show', templateVars);
});

//REDIRECTS USER TO THE ACTUAL WEBSITE REPRESENTED BY SHORT URL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//DELETES A LINK
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//DIRECTS USER TO 'EDIT' PAGE FOR THAT LINK WHEN EDIT BUTTON IS CLICKED.
app.get('/urls/:shortURL/', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//ALLOWS A USER TO EDIT A LONG URL 
app.post('/urls/:shortURL/', (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});

//LOGIN FOR USER
app.post("/login", (req, res) => {
  const email = req.body.email;
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      console.log('user object:', user);
      res.cookie('user_ID', user.id);
      return res.redirect('/urls');
    }
  }
  return res.redirect('/urls');
});


//LOGOUT FOR USER
app.post('/logout', (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('/urls');
});

//REGISTRATION PAGE
app.get('/register', (req, res) => {
  const userID = req.cookies['user_ID'];
  const user = users[userID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render('url_register', templateVars);
});

//REGISTRATION FORM
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  users[userID] = { id: userID, email: req.body.username, password: req.body.password };
  res.cookie('user_ID', userID);
  // console.log('users', users);
  // console.log(users[userID]);
  res.redirect('/urls');
});

// //404 ERROR ROUTE
// app.get('*', (req, res) => {
//   res.render('404');
// });


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