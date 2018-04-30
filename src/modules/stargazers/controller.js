const Stargazer = require('../../models/stargazers')
const github = require('./github')

// Create new stargazer
async function createStargazer (ctx) {
  // const user = new Stargazer(ctx.request.body.user)
  const user = ctx.request.body.user

  console.log(`user: ${JSON.stringify(user, null, 2)}`)

  try {
    // Check to see if the stargazer has stared the repo.
    let success = await github.getClientStargazers(user.githubUser)
    if (!success) {
      ctx.body = {
        success: false,
        message: `User has not starred GitHub repository.`
      }
      return
    }

    // Check to see if the stargazer already exists in the local DB.
    const userInDb = await findUserInDB(user.githubUser)
    console.log(`userInDb: ${JSON.stringify(userInDb, null, 2)}`)
    if (userInDb) {
      console.log(`User already in DB.`)
      ctx.body = {
        success: false,
        message: 'User already in database.'
      }
      return
    }

    // Check the balance in the wallet.

    // Send money to new stargazer

    // Add stargazer to the local DB.

    if (success) {
      ctx.body = { success: true }
    }
  } catch (err) {
    console.error(`Error in createUser: `, err)
    ctx.throw(422, err.message)
  }

/*
  try {
    await user.save()
  } catch (err) {
    ctx.throw(422, err.message)
  }

  ctx.body = {
    user
  }
*/
}

// Get info on existing stargazers
async function getUsers (ctx) {
  const users = await Stargazer.find({})
  ctx.body = { users }
}

// Get info on a specific stargazer
async function getUser (ctx, next) {
  try {
    console.log(`user id: ${ctx.params.id}`)

    await Stargazer.findOne({githubUser: ctx.params.id}, (err, user) => {
      if (err) {
        ctx.throw(err)
      }

      ctx.body = { user }
    })

/*
    const user = await Stargazer.findById(ctx.params.id)
    if (!user) {
      ctx.throw(404)
    }

    ctx.body = {
      user
    }
*/
  } catch (err) {
    if (err === 404 || err.name === 'CastError') {
      ctx.throw(404)
    }

    ctx.throw(500)
  }

  if (next) { return next() }
}

// Update info on a stargazer
async function updateUser (ctx) {
  const user = ctx.body.user

  Object.assign(user, ctx.request.body.user)

  await user.save()

  ctx.body = {
    user
  }
}

// delete a stargazer
async function deleteUser (ctx) {
  const user = ctx.body.user

  if (!user) ctx.throw(404)

  await user.remove()

  ctx.status = 200
  ctx.body = {
    success: true
  }
}

module.exports = {
  createStargazer,
  getUsers,
  getUser,
  updateUser,
  deleteUser
}

/*
  Support/private functions
*/

async function findUserInDB (username) {
  try {
    await Stargazer.findOne({githubUser: username}, (err, user) => {
      if (err) {
        throw (err)
      }

      return user
    })
  } catch (err) {
    throw err
  }
}
