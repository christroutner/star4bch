/*
  This library contains the helper functions needed to interact with the
  GitHub API and verify stargazers.
*/

'use strict'

const rp = require('request-promise')

async function getClientStargazers (username) {
  try {
    const options = {
      method: 'GET',
      uri: `https://api.github.com/repos/P2PVPS/p2pvps-client/stargazers`,
      json: true, // Automatically stringifies the body to JSON
      headers: {
        'User-Agent': 'P2P VPS'
      }
    }

    // Get the stargazer data from GitHub.
    const data = await rp(options)
    // console.log(`data: ${JSON.stringify(data, null, 2)}`)

    // Loop through each stargazer to see if there is a match to the provided
    // user name.
    for (let i = 0; i < data.length; i++) {
      const thisUser = data[i].login
      // console.log(`thisUser: ${thisUser}`)

      if (thisUser === username) {
        return true
      }
    }

    return false
  } catch (err) {
    console.error('Error in github.js/getClientStargazers')
    throw err
  }
}

module.exports = {
  getClientStargazers
}
