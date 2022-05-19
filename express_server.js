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

// const urlDatabase = {
//   'b2xVn2': 'http://www.lighthouselabs.ca',
//   '9sm5xk': 'http://www.google.ca'
// };

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


//HELPER FUNCTIONS

function generateRandomString(url) {
  const result = Math.random().toString(36).substring(2, 8);
  return (result);
}

// function findTheURL(urlDatabase) {
//   for (let ids in urlDatabase) {
//    let shortURL = urlDatabase[ids];
//    console.log('shortURL:', shortURL);
//    let longURL = urlDatabase[shortURL].longURL;
//    console.log('longURL', longURL);
//    let userID = urlDatabase[ids].userID;
//    console.log('userID:', userID)
//   }
// }

//ROUTES

//MAIN USER PAGE WHICH STORES THE URL DATABASE
app.get('/urls', (req, res) => {
  const userID = req.cookies['user_ID'];
  // console.log('userID:', userID);
  const user = users[userID];
  if (user) {
    const templateVars = { user, urls: urlDatabase };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

//PAGE FOR USER TO ADD A NEW URL 
app.get('/urls/new', (req, res) => {
  const userID = req.cookies['user_ID'];
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
  urlDatabase[shortURL] = req.body.longURL;
  const userID = req.cookies['user_ID'];
  const user = users[userID];
  if (user) {
    res.redirect(`/urls/${shortURL}`);
  }
  res.status(403).send("Error 403 - Forbidden");

});

//THE PAGE THAT GENERATES AFTER A SHORT URL IS CREATED.
app.get('/urls/:shortURL', (req, res) => {
  const userID = req.cookies['user_ID'];
  const user = users[userID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user };
  if (user) {
    res.render('urls_show', templateVars);
  } res.status(403).send("Error 403 - Forbidden");
});

//REDIRECTS USER TO THE ACTUAL WEBSITE REPRESENTED BY SHORT URL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL)
  res.redirect(longURL);
});

//DELETES A LINK
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL]
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
  urlDatabase[shortURL].longURL = newLongURL;
  // console.log(urlDatabase);
  res.redirect('/urls');
});

//LOGIN PAGE FOR USER 
app.get('/login', (req, res) => {
  const userID = req.cookies['user_ID'];
  const user = users[userID];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
  res.render('url_login', templateVars);
});

//LOGIN FORM FOR USER
app.post("/login", (req, res) => {
  const loginEmail = req.body.username;
  // console.log('login email', loginEmail);
  const loginPassword = req.body.password;
  // console.log('login password', loginPassword);
  for (const id in users) {
    const user = users[id];
    // console.log('user email', user.email);
    // console.log('user password', user.password);
    if (user.email === loginEmail && user.password === loginPassword) {
      // console.log('user object:', user);
      res.cookie('user_ID', user.id);
      return res.redirect('/urls');

    }
  }
  return res.status(403).send("Error 403 - Forbidden");
});


//LOGOUT FOR USER
app.post('/logout', (req, res) => {
  res.clearCookie('user_ID');
  res.redirect('/login');
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
  // console.log('req.body.username', req.body.username);
  // console.log('req.body.password', req.body.password);
  for (const id in users) {
    let user = users[id];
    // console.log('usersID', users[id]);
    // console.log('id', id);
    // console.log('user.email:', user.email);
    if (user.email === req.body.username) {
      return res.status(404).send("Error 404 - Not Found");
    } else if ((req.body.username === "") || (req.body.password === "")) {
      res.status(404).send("Error 404 - Not Found");
    }
  }
  const userID = generateRandomString();
  users[userID] = { id: userID, email: req.body.username, password: req.body.password };
  // console.log('new email register', users[userID].email);
  res.cookie('user_ID', userID);
  return res.redirect('/urls');
});

// //403 ERROR ROUTE
// app.get('/403', (req, res) => {
//   const userID = req.cookies['user_ID'];
//   const user = users[userID];
//   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
//   res.render('url_forbidden', templateVars);
// });


// //404 ERROR ROUTE
// app.get('/error/404', (req, res) => {
//   const userID = req.cookies['user_ID'];
//   const user = users[userID];
//   const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user };
//   res.render('url_error', templateVars);
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