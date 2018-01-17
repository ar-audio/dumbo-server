const { PORT } = process.env

const fs = require('fs')
const path = require('path')

const Koa = require('koa')
const logger = require('koa-logger')
const Router = require('koa-router')

const socket = require('./utils/socket.js')

const app = new Koa()
app.use(logger())

// initialize the database singleton
const connectToDatabase = () => {
  console.log('Connecting to database...')
  return require('./utils/database.js')
}

// mount all controllers in `./controllers` and use their filename as prefix
const mountControllers = () => {
  console.log('Mounting controllers...')
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
          console.log(`Mounted ${path.resolve('controllers', file)} under /${prefix}`)
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
    console.log('Initializing socket.io...')
    return socket.init(app)
  })
  .then(server => server.listen(
    PORT, () => console.log(`Server started and listening on port ${PORT}`)
  ))
  .catch(err => console.error(err))
