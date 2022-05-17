const express = require("express");
const req = require("express/lib/request");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

function generateRandomString(url) {
  const result = Math.random().toString(36).substring(2, 8);
  return (result);
}


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.ca"
};

const bodyParser = require("body-parser");
const res = require("express/lib/response");
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req, res) => {
  res.send("Hello!");
});

//MAIN USER PAGE WHICH STORES THE URL DATABASE
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//PAGE FOR USER TO ADD A NEW URL 
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//CODE WHICH LETS USER ADD NEW URL AND GENERATES A RANDOM CODE FOR THAT URL. REDIRECTS THEM TO /SHORTURL PAGE ONCE LINK IS COMPLETE
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  console.log(req.body);
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL] = newLongURL;
  console.log(urlDatabase);
  res.redirect('/urls');
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