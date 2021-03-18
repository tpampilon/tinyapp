const assert = require('chai').assert;
const hfunc = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "testtest": {
    id: "testtest", 
    email: "test@example.com", 
    password: "dishwasher-funk"
  }
};

let urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "testtest" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "testtest" },
  "5sfdsK": { longURL: "http://www.facebook.com", userID: "nottesttest" }
};


describe('getUserByEmail', function() {

  it('should return a user with valid email', function() {
    const actual = hfunc.getUserByEmail("test@example.com", testUsers);
    const expectedOutput = "testtest";
    
    assert.strictEqual(actual, expectedOutput);
  });

  it('should return undefined if user has an invalid email', function() {
    const actual = hfunc.getUserByEmail("notTest@example.com", testUsers);
    const expectedOutput = undefined;
    

    assert.strictEqual(actual, expectedOutput);
  });

});

describe('generateRandomString', function() {

  it('should return 6 random strings if 6 (length) was passed it', function() {
    const actual = hfunc.generateRandomString(6).length;
    const expectedOutput = 6;

    assert.strictEqual(actual, expectedOutput);
  });

  it('should return 10 random strings if 10 (length) was passed it', function() {
    const actual = hfunc.generateRandomString(10).length;
    const expectedOutput = 10;

    assert.strictEqual(actual, expectedOutput);
  });
});

describe('urlsForUser', function() {

  it('should return an empty object if the userID does not exist', function() {
    const actual = hfunc.urlsForUser("notTest", urlDatabase);
    const expectedOutput = {};

    assert.deepEqual(actual, expectedOutput);
  });

  it('should return the object that has the same userID', function() {
    const actual = hfunc.urlsForUser("testtest", urlDatabase);
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "testtest" },
      "9sm5xK": { longURL: "http://www.google.com", userID: "testtest"} 
    };

    assert.deepEqual(actual, expectedOutput);
  });
});