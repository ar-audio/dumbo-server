const Router = require('koa-router')
const router = new Router()

router
  .post('/', ctx => {
    ctx.body = {"hello": 1234}
  })

module.exports = router
