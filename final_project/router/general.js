const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Create a map of books by author
let booksByAuthorMap = new Map();
Object.values(books).forEach(book => {
  const author = book.author.toLowerCase();
  if (!booksByAuthorMap.has(author)) {
    booksByAuthorMap.set(author, []);
  }
  booksByAuthorMap.get(author).push(book);
});

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

public_users.post("/register", (req, res) => {
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

// Get the book list available in the shop
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
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
      try {
        const bookDetails = {
          title: book.title,
          author: book.author,
          url: book.url
        };
        res.status(200).json(bookDetails);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  });
  
// Get book details based on author 
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author.toLowerCase();
    const booksByAuthor = booksByAuthorMap.get(author) || [];
    if (booksByAuthor.length > 0) {
      try {
        const bookDetails = booksByAuthor.map(book => ({
          title: book.title,
          author: book.author,
          url: book.url
        }));
        res.status(200).json(bookDetails);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else {
      res.status(404).json({ message: "No books found by author" });
    }
  });
  
  // Get all books based on title
  public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title.toLowerCase();
    const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase() === title);
    if (booksByTitle.length > 0) {
      try {
        const bookDetails = booksByTitle.map(book => ({
          title: book.title,
          author: book.author,
          url: book.url
        }));
        res.status(200).json(bookDetails);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    } else {
      res.status(404).json({ message: "No books found by this title" });
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
