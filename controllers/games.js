const Router = require('koa-router')
const generateName = require('../utils/generate-name.js')

const router = new Router()

const fs = require('fs')
const path = require('path')
const names = String(fs.readFileSync(path.resolve('assets/dict/propernames'))).split('\n').map(name => name.toLocaleLowerCase())

router
  .post('/', ctx => {
    ctx.body = {id: generateName(names)}
  })
  .get('/:id', ctx => {
    // TODO: Upgrade to websocket (?)
    ctx.body = {message: `You are trying to join the game "${ctx.params.id}"`}
  })

module.exports = router
