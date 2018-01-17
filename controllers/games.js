const Router = require('koa-router')

const db = require('../utils/database.js')
const Player = require('../models/player.js')
const Game = require('../models/game.js')

const router = new Router()

// set up the routes which are going to be exported
router
  .post('/', async ctx => {
    // we generate a player for each game; there is no such thing as a player
    // playing multiple games for now
    const player = await Player.create(db)
    const game = await Game.create(db, player)
    ctx.status = 201
    ctx.body = game
  })
  .get('/:name', async ctx => {
    const game = await Game.get(db, ctx.params.name)
    if (game != null) {
      ctx.body = game
    } else {
      ctx.status = 404
      ctx.body = { 'message': `No game found with name '${ctx.params.name}'` }
    }
  })

module.exports = router
