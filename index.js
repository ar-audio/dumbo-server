const PORT = 3000 || process.env.DUMBO_PORT

const fs = require('fs')
const path = require('path')

const Koa = require('koa')
const logger = require('koa-logger')
const Router = require('koa-router')

const app = new Koa()
app.use(logger())

// mount all controllers in `./controllers` and use their filename as prefix
const mountControllers = () => {
  console.log('Mounting controllers...')
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve('controllers'), (err, files) => {
      if (err) return reject(err)

      files.forEach(file => {
        const controller = require(path.resolve('controllers', file))
        const prefix = file.split('.')[0]
        const router = new Router()
        router.use(`/${prefix}`, controller.routes())
        app.use(router.routes())
        app.use(router.allowedMethods())
        console.log(`Mounted ${path.resolve('controllers', file)} under /${prefix}`)
      })
      resolve()
    })
  })
}

// start the app and ready steady go
mountControllers().then(() =>
  app.listen(PORT, () => {
    console.log(`Server started and listening on port ${PORT}`)
  })
)
