const Stargazer = require('../../models/stargazers')
const github = require('./github')
const ob = require('openbazaar-node')

const OB_USERNAME = 'yourUsername'
const OB_PASSWORD = 'yourPassword'

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

    // Initialize config object for OpenBazaar server
    const obConfig = {
      apiCredentials: '',
      server: 'http://localhost',
      obPort: 4002,
      clientId: OB_USERNAME,
      clientSecret: OB_PASSWORD
    }
    obConfig.apiCredentials = ob.getOBAuth(obConfig)

    // Check the balance in the wallet.
    const walletBalance = await ob.getWalletBalance(obConfig)
    console.log(`walletBalance: ${walletBalance.confirmed}`)

    // Verify the address starts with 'bitcoincash:'
    const validAddress = user.bchAddress.indexOf(`bitcoincash:`)
    if (validAddress === -1) {
      ctx.body = {
        success: false,
        message: 'Invalid BCH address.'
      }
      return
    }

    // Get the exchange rate in USD.
    const exchangeRate = await ob.getExchangeRate(obConfig)

    // Calculate $0.10 in Satoshis
    const usdExchangeRate = exchangeRate.USD
    const bchPerDollar = 1 / usdExchangeRate
    // Five and Ten cents in Satoshis.
    const fiveCents = roundSatoshis(bchPerDollar * 0.05)
    const tenCents = fiveCents * 2
    const fifteenCents = fiveCents * 3

    // Exit if balance is not big enough.
    if (walletBalance.confirmed < fifteenCents) {
      ctx.body = {
        success: false,
        message: 'Out of money.'
      }
      return
    }

    // Send money to new stargazer
    const moneyObj = {
      address: user.bchAddress,
      amount: fiveCents,
      feeLevel: 'ECONOMIC',
      memo: 'P2P VPS Stargazer Reward'
    }

    // const result = await ob.sendMoney(obConfig, moneyObj)
    // console.log(`result: ${JSON.stringify(result, null, 2)}`)

    // Add stargazer to the local DB.
    const stargazer = new Stargazer(user)
    try {
      await stargazer.save()
    } catch (err) {
      ctx.throw(422, err.message)
    }

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

// Returns false if user is not in database. Otherwise returns the user model.
async function findUserInDB (username) {
  try {
    const userRecord = await Stargazer.findOne({githubUser: username}, (err, user) => {
      if (err) {
        return false
      }

      // console.log(`findUserInDb: ${JSON.stringify(user, null, 2)}`)
    })

    if (!userRecord) return false

    return userRecord
  } catch (err) {
    return false
  }
}

// Rounds the floating point val to a precise number of satoshis
function roundSatoshis (val) {
  const satoshis = Number(val) * 100000000
  const roundedSatoshis = Math.round(satoshis)
  return roundedSatoshis
}
