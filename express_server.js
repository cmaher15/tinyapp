const express = require("express");
const req = require("express/lib/request");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080;
const bodyParser = require("body-parser");
const res = require("express/lib/response");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.ca"
};

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());


function generateRandomString(url) {
  const result = Math.random().toString(36).substring(2, 8);
  return (result);
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

//MAIN USER PAGE WHICH STORES THE URL DATABASE
app.get("/urls", (req, res) => {
  const username = req.cookies["username"];
  if (username) {
    const templateVars = { username, urls: urlDatabase };
    res.render("urls_index", templateVars);
  } else {
    const templateVars = { username, urls: urlDatabase };
    res.render("urls_index", templateVars);
  }
});

//PAGE FOR USER TO ADD A NEW URL 
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_new", templateVars);
});

//CODE WHICH LETS USER ADD NEW URL AND GENERATES A RANDOM CODE FOR THAT URL. REDIRECTS THEM TO /SHORTURL PAGE ONCE LINK IS COMPLETE
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

//REDIRECTS USER TO THE ACTUAL WEBSITE REPRESENTED BY SHORT URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//DELETES A LINK
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//DIRECTS USER TO "EDIT" PAGE FOR THAT LINK WHEN EDIT BUTTON IS CLICKED.
app.get("/urls/:shortURL/", (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});

//ALLOWS A USER TO EDIT A LONG URL 
app.post("/urls/:shortURL/", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  console.log(urlDatabase);
  res.redirect('/urls');
});

//LOGIN FOR USER
app.post("/login", (req, res) => {
  const username = req.body.username;
  console.log(username);
  res.cookie("username", username);
  res.redirect("/urls");
});

//LOGOUT FOR USER
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});