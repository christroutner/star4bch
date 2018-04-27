const mongoose = require('mongoose')

const Stargazer = new mongoose.Schema({
  githubUser: { type: String, required: true, unique: true },
  bchAddress: { type: String, required: true, unique: true },
  repos: []
})

module.exports = mongoose.model('stargazer', Stargazer)
