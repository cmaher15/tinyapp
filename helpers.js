const getUserByEmail = (email, users) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};


module.exports = getUserByEmail;
 

