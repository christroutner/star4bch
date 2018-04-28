const Stargazer = require('../../models/stargazers')

// Create new stargazer
async function createUser (ctx) {
  const user = new Stargazer(ctx.request.body.user)

  console.log(`user: ${JSON.stringify(user, null, 2)}`)

  try {
    await user.save()
  } catch (err) {
    ctx.throw(422, err.message)
  }

  ctx.body = {
    user
  }
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

  await user.remove()

  ctx.status = 200
  ctx.body = {
    success: true
  }
}

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser
}
