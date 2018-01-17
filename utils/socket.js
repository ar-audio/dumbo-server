const http = require('http')

let socket = null

// FIXME: Check whether game exists and person is allowed to join

/**
 * This sets up our socket server. **Has to be called before all other methods!**
 * @param app Object  A koa.js app
 */
function init (app) {
  const server = http.createServer(app.callback())

  socket = require('socket.io')(server)
  socket.on('connection', socket => {
    socket.on('movement', _ => console.log('socket movement??', arguments))
    console.log('Somebody connected via websocket')
  })

  return server
}

function get () {
  if (socket == null) throw new TypeError('Socket not initialized! Call init first.')
  return socket
}

module.exports = {
  init, get
}
