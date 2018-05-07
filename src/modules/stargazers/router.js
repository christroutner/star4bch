// const ensureUser = require('../../middleware/validators')
const stargazer = require('./controller')

// export const baseUrl = '/users'
module.exports.baseUrl = '/stargazers'

module.exports.routes = [

  {
    method: 'POST',
    route: '/',
    handlers: [
      stargazer.createStargazer
    ]
  },

  {
    method: 'GET',
    route: '/',
    handlers: [
      stargazer.getUsers
    ]
  },

  {
    method: 'GET',
    route: '/:id',
    handlers: [
      stargazer.getUser
    ]
  }
/*
  {
    method: 'PUT',
    route: '/:id',
    handlers: [
      stargazer.getUser,
      stargazer.updateUser
    ]
  },

  {
    method: 'DELETE',
    route: '/:id',
    handlers: [
      stargazer.getUser,
      stargazer.deleteUser
    ]
  }
*/
]
