const { PORT } = process.env
const debug = require('debug')('dumbo:app')

const fs = require('fs')
const path = require('path')

const Koa = require('koa')
const logger = require('koa-logger')
const Router = require('koa-router')

const io = require('./utils/io.js')

const app = new Koa()
app.use(logger())

// initialize the database singleton
const connectToDatabase = () => {
  debug('Connecting to database...')
  return require('./utils/database.js')
}

// mount all controllers in `./controllers` and use their filename as prefix
const mountControllers = () => {
  debug('Mounting controllers...')
  return new Promise((resolve, reject) => {
    fs.readdir(path.resolve('controllers'), (err, files) => {
      if (err) return reject(err)

      files
        .filter(file => file[0] !== '.') // exclude hidden files
        .forEach(file => {
          const controller = require(path.resolve('controllers', file))
          const prefix = file.split('.')[0]
          const router = new Router()
          router.use(`/${prefix}`, controller.routes())
          app.use(router.routes())
          app.use(router.allowedMethods())
          debug(`Mounted ${path.resolve('controllers', file)} under /${prefix}`)
        })

      resolve()
    })
  })
}

Promise.all(
  [
    mountControllers(),
    connectToDatabase()
  ])
  .then(() => {
    debug('Initializing socket.io...')
    return io.init(app)
  })
  .then(server => server.listen(
    PORT, () => debug(`Server started and listening on port ${PORT}`)
  ))
  .catch(err => console.error(err))
