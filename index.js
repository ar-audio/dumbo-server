const PORT = 3000 || process.env.DUMBO_PORT

const fs = require('fs')
const path = require('path')

const Koa = require('koa')
const logger = require('koa-logger')

const app = new Koa()
app.use(logger())

// mount all controllers in `./controllers` and use their filename as prefix
console.log('Mounting controllers...')
fs.readdir(path.resolve('controllers'), (err, files) => {
  if (err) return console.error(err)

  files.forEach(file => {
    const controller = require(path.resolve('controllers', file))
    const prefix = file.split('.')[0]
    controller.prefix(prefix)
    app.use(controller.routes())
    app.use(controller.allowedMethods())
    console.log(`Mounted ${path.resolve('controllers', file)} under /${prefix}`)
  })
})

app.listen(PORT, () => {
  console.log(`Server started and listening on port ${PORT}`)
})
