// Helper Functions

const generateRandomString = (idLength) => {
  const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const length = idLength;
  let random = '';

  for (let i = length; i > 0; i--) {
    random += characters[Math.round(Math.random() * (characters.length - 1))];
  }

  return random;
};

const getUserByEmail = (mail, database) => {
  let userId = undefined;

  for (let user in database) {
    if (database[user].email === mail) {
      userId = database[user].id;
    }
  }
  return userId;
};

const urlsForUser = (id, database) => {
  let allUrls = {};
  for (let urls in database) {
    if (database[urls].userID === id) {
      allUrls[urls] = database[urls];
    }
  }
  return allUrls;
};

module.exports = {

  generateRandomString,
  getUserByEmail,
  urlsForUser

};