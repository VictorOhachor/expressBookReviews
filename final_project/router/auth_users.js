const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  const userIdx = users.findIndex(u => {
    return u.username.toLowerCase() === username.toLowerCase()
  })

  if (userIdx === -1) {
    return false
  }
  return true
}

const authenticatedUser = (username, password) => {
  const user = users.filter(u => {
    return isValid(username) && u.password === password
  })

  if (user.length === 0) {
    return false
  }

  return true
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: 'Username or password is incorrect.' })
  }

  const accessToken = jwt.sign({ username, password }, '4jndjdidjej444',
    { expiresIn: 60 * 60 * 2 })
  req.session.authorization = { accessToken }

  return res.json({ data: { token: accessToken, username } })
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params
  const { review } = req.query

  if (!review) {
    return res.status(400).json({
      message: 'No review passed as a request query.'
    })
  }

  const bookReviews = books[isbn]?.reviews

  if (!bookReviews) {
    return res.status(400).json({ message: 'No book with given isbn found.' })
  }

  bookReviews[req.user.username] = review

  return res.json({
    data: books[isbn]
  })
});

// Delete a book review
regd_users.delete('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params

  const bookReviews = books[isbn]?.reviews

  if (!bookReviews) {
    return res.status(400).json({ message: 'No book with given isbn found.' })
  }

  delete bookReviews[req.user.username]
  return res.json({
    data: {
      message: "Deleted review successfully",
    }
  })
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
