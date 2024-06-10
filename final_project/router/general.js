const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const public_users = express.Router();
const books = require("./booksdb.js");

// Middleware
public_users.use(bodyParser.json());
public_users.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

// Example middleware for authentication
const authenticateUser = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};

public_users.use(authenticateUser);

// Route handlers
public_users.get('/example', (req, res) => {
  res.status(200).json({ message: 'Example route' });
});

// Promise callback example for fetching books
public_users.get('/promise', async (req, res) => {
  try {
    const response = await axios.get('https://ariellathomp-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Async-await example for fetching books
public_users.get('/async', async (req, res) => {
  try {
    const response = await axios.get('https://ariellathomp-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/');
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
  res.status(200).json(books);
});

// Get book details based on ISBN using async-await
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    if (!isbn) {
      return res.status(400).json({ message: "ISBN is required" });
    }
    try {
      const book = await getBookByISBN(isbn);
      if (book) {
        res.status(200).json(book);
      } else {
        res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
  });
  
  // Function to get book details by ISBN
  function getBookByISBN(isbn) {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error(`Book with ISBN ${isbn} not found`));
      }
    });
  }
  

public_users.get('/author/:author', async (req, res) => {
    try {
      const author = req.params.author.toLowerCase();
      const response = await axios.get('https://ariellathomp-5000.theianext-0-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/'); // Assuming this is the endpoint to fetch books
      const books = response.data;
      const booksByAuthor = Object.values(books).filter(book => book.author.toLowerCase().includes(author));
      if (booksByAuthor.length > 0) {
        res.status(200).json(booksByAuthor);
      } else {
        res.status(404).json({ message: `Books by author ${author} not found` });
      }
    } catch (error) {
      res.status(500).json({ message: "Error fetching books", error: error.message });
    }
  });

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
  const title = req.params.title.toLowerCase().replace("_", " ");
  const booksByTitle = Object.values(books).filter(book => book.title.toLowerCase().includes(title));
  if (booksByTitle.length > 0) {
    res.status(200).json(booksByTitle);
  } else {
    res.status(404).json({ message: `Books with title ${title} not found` });
  }
});



// Get book review
public_users.get('/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    res.status(200).json(book.reviews);
  } else {
    res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

module.exports.general = public_users;
