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

//The above databases are required in this file, as the functions below call on them specifically. 

///TO CHECK THE USERS BY THEIR EMAILS IN THE DATABASE///
const getUserByEmail = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

///TO GENERATE A RANDOM STRING TO USE FOR USER ID AND SHORT URLS///
const generateRandomString = () => {
  const result = Math.random().toString(36).substring(2, 8);
  return (result);
};


///TO FILTER THE URLS PAGE BASED ON THE URLS THAT USER HAS MADE///
const urlsForUser = (loggedInUserID) => {
  const userURLs = {};
  for (let shortURL in urlDatabase) {
    if (loggedInUserID === urlDatabase[shortURL].userID) {
      userURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return userURLs;
};




module.exports =  { getUserByEmail,
generateRandomString,
urlsForUser 
};
 

