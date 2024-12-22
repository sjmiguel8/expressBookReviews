const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
   // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    res.status(200).json(Object.values(books));
  });
// Replace with the actual URLs of your books APIs
const bookUrls = Object.values(books).map(book => book.url);


const fetchBooks = () => {
    return new Promise((resolve, reject) => {
      const booksPromises = bookUrls.map(url => axios.get(url));
      Promise.all(booksPromises)
        .then(booksResponses => {
          const books = booksResponses.map(response => response.data);
          resolve(books);
        })
        .catch(error => {
          reject(new Error('Error fetching books: ' + error.message));
        });
    });
  };
  
  // Get the book list available in the shop using Promises
  public_users.get('/', function (req, res) {
    fetchBooks()
      .then((books) => {
        res.status(200).json(books);
      })
      .catch((error) => {
        res.status(500).json({ message: error.message });
      });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books[isbn];
    if (book) {
        res.status(200).json(book);
    } else {
        res.status(404).json({message: "No books found by ISBN"});
    }
} );
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;
  const booksByAuthor = Object.values(books).filter(book => book.author === author);
    if (booksByAuthor.length > 0) {
        res.status(200).json(booksByAuthor);
    } else {
        res.status(404).json({message: "No books found by author"});
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    //Write your code here
    const title = req.params.title;
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title.toLowerCase());
     
    if (booksByTitle.length > 0) {
          res.status(200).json(booksByTitle);
      } else {
          res.status(404).json({message: "No books found by this title"});
      }
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (book && book.reviews) {
        res.status(200).json(book.reviews);
    } else {
        res.status(404).json({message: "No reviews found for this ISBN"});
    }
    //Write your code here
  });

module.exports.general = public_users;
