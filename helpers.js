const getUserByEmail = (email, database) => {
  for(const user in database) {
    if(database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
}
const urlsForUser =  (id) => {
  const result = {};
  for (const shortURL in urlDatabase) {
    const urlObj = urlDatabase[shortURL];
    if (urlObj.userID === id) {
      result[shortURL] = urlObj;
    }
  }
  return result;

};
module.exports = {getUserByEmail, urlsForUser}