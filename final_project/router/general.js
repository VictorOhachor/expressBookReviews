const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      message: 'Username and password are required to register a user.'
    })
  }

  if (isValid(username)) {
    return res.status(400).json({
      message: 'User with given username already exists'
    })
  }

  users.push({
    username, password
  })

  return res.status(201).json({
    data: {
      id: users.length,
      user: users[users.length - 1],
      message: 'New user created successfully.'
    }
  })
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  return res.json({ data: books })
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params
  const bookIdx = Object.keys(books).indexOf(isbn)

  if (bookIdx === -1) {
    return res.status(404).json({ message: 'No book found under given isbn' })
  }

  return res.json({ data: { isbn, book: books[isbn] } })
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params

  const foundBooks = Object.values(books).filter(book => {
    return book.author.toLowerCase().includes(author.toLowerCase()) ||
      author.toLowerCase().includes(book.author.toLowerCase())
  })

  return res.json({
    data: {
      count: foundBooks.length,
      books: foundBooks
    }
  })
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params
  const foundBooks = Object.values(books).filter(book => {
    return book.title.toLowerCase() === title.toLowerCase()
  })

  return res.json({
    data: {
      count: foundBooks.length,
      books: foundBooks
    }
  })
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params
  const bookReviews = books[isbn]?.reviews

  if (bookReviews) {
    return res.json({
      data: {
        reviews: bookReviews
      }
    })
  }

  return res.status(404).json({ message: 'No book found under the given isbn' })
});

module.exports.general = public_users;
