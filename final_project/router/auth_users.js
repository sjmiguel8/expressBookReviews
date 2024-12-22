const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [  
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' }
];

function isValid(username) {
  return users.some(user => user.username === username);
//returns boolean
//write code to check is the username is valid
}

function doesExist(username) {
  return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}
//returns boolean
//write code to check if username and password match the one we have in records.
regd_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

//only registered users can login
regd_users.post("/login", (req,res) => {
const username = req.body.username;
const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    if (!isValid(username)) {
        return res.status(404).json({ message: "Invalid username" });
    }
    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:index", (req, res) => {
  const index = req.params.index;
  const review = req.body.review;
  const authorization = req.session.authorization;
  if (!authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }
  const username = authorization.username;

  const bookKeys = Object.keys(books);
  if (index < 1 || index > bookKeys.length) {
    return res.status(404).json({ message: "Book not found" });
  }

  const isbn = bookKeys[index - 1];
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;
  return res.status(200).json({ message: "Review successfully posted", reviews: books[isbn].reviews });
});

regd_users.delete("/auth/review/:index", (req, res) => {
  const index = req.params.index;
  const authorization = req.session.authorization;
  if (!authorization) {
    return res.status(403).json({ message: "User not logged in" });
  }
  const username = authorization.username;

  const bookKeys = Object.keys(books);
  if (index < 1 || index > bookKeys.length) {
    return res.status(404).json({ message: "Book not found" });
  }

  const isbn = bookKeys[index - 1];
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found" });
  }

  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review successfully deleted", reviews: books[isbn].reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
