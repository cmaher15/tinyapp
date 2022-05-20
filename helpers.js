const getUserByEmail = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};


// const generateRandomString = function() {
//   const result = Math.random().toString(36).substring(2, 8);
//   return (result);
// };



// const urlsForUser = function(loggedInUserID) {
//   const userURLs = {};
//   for (let shortURL in urlDatabase) {
//     if (loggedInUserID === urlDatabase[shortURL].userID) {
//       userURLs[shortURL] = urlDatabase[shortURL];
//     }
//   }
//   return userURLs;
// };




module.exports = getUserByEmail

