const Router = require('koa-router')

const db = require('../utils/database.js')
const Player = require('../models/player.js')
const Game = require('../models/game.js')

const router = new Router()

// set up the routes which are going to be exported
router
  // generate player 1 and start a new game
  .post('/', async ctx => {
    const player = await Player.create(db)
    const game = await Game.create(db, player)
    ctx.status = 201
    ctx.body = {
      game,
      you: player
    }
  })
  // get the status for a game
  .get('/:name', async ctx => {
    const game = await Game.get(db, ctx.params.name)
    if (game != null) {
      ctx.body = { game }
    } else {
      ctx.status = 404
      ctx.body = { message: `No game found with name '${ctx.params.name}'` }
    }
  })
  // generate player 2 and join an existing game
  .post('/:name', async ctx => {
    const player = await Player.create(db)
    try {
      const game = await Game.join(db, ctx.params.name, player)
      if (game != null) {
        ctx.body = {
          game,
          you: player
        }
      } else {
        ctx.status = 404
        ctx.body = { message: `No game found with name '${ctx.params.name}'` }
      }
    } catch (err) {
      if (err.name === 'TooBusyError') {
        ctx.status = 403
      } else {
        throw err
      }
    }
  })

module.exports = router
