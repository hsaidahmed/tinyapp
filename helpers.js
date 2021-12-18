const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};
const urlsForUser = (id, database) => {
  const result = {};
  for (const shortURL in database) {
    const urlObj = database[shortURL];
    if (urlObj.userID === id) {
      result[shortURL] = urlObj;
    }
  }
  return result;
};

const generateRandomString = () => {
  return Math.floor((1 + Math.random()) * 0x1000000)
    .toString(16)
    .substring(1);
};
module.exports = { getUserByEmail, urlsForUser, generateRandomString };
