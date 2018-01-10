const Router = require('koa-router')
const generateName = require('../utils/generate-name.js')
const db = require('../utils/database.js')

const router = new Router()

// required for game name generation
const fs = require('fs')
const path = require('path')
const names = String(fs.readFileSync(path.resolve('assets/dict/propernames'))).split('\n').map(name => name.toLocaleLowerCase())

const MAX_TRIES = 10

/**
 * This starts a new game that is guaranteed to have a unique name
 */
function newGame (tries = 1) {
  // abort after x tries, otherwise people could crash this by calling it often enough
  if (tries > MAX_TRIES) return Promise.reject(new Error('Could not create new game'))

  const now = Date.now()
  return db.table('games')
    .insert({
      name: generateName(names),
      players: [],
      createdAt: now,
      updatedAt: now
    }, {
      conflict: 'error',
      returnChanges: true
    })
    .run()
    .then(result => result.changes.length ? result.changes[0].new_val : newGame(++tries))
}

function findGame (name) {
  return db.table('games').get(name).run()
}

// set up the routes which are going to be exported
router
  .post('/', async ctx => {
    const game = await newGame()
    ctx.status = 201
    ctx.body = { game }
  })
  .get('/:name', async ctx => {
    const game = await findGame(ctx.params.name)
    if (game != null) {
      ctx.body = { game }
    } else {
      ctx.status = 404
    }
  })

module.exports = router
