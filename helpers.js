const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};
const urlsForUser =  (id, database) => {
  const result = {};
  for (const shortURL in database) {
    const urlObj = database[shortURL];
    if (urlObj.userID === id) {
      result[shortURL] = urlObj;
    }
  }
  return result;

};
module.exports = {getUserByEmail, urlsForUser};