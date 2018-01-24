const http = require('http')

const db = require('./database.js')
const Player = require('../models/player.js')
const Game = require('../models/game.js')

const debug = require('debug')('dumbo:sockets')

let io = null

// FIXME: Check whether game exists and person is allowed to join

/**
 * This sets up our socket server. **Has to be called before all other methods!**
 * @param app Object  A koa.js app
 */
function init (app) {
  const server = http.createServer(app.callback())

  io = require('socket.io')(server)

  io.on('connection', socket => {
    debug('Somebody connected via websocket')
    // After connecting to our socket.io server the player has to prove they're
    // who they claim to be. When a player is created we generate a token. This
    // is in combination with their id used for authentication
    // and authorization.
    socket.on('auth', message => {
      const {id, token, gameName} = JSON.parse(message)
      debug(`Received auth message from player ${id}`)
      Player.authorize(db, {id, token, gameName})
        .then(_ => {
          debug(`${id} authorized succesfully`)
          // allow player to receive message in the room representing their
          // current game
          socket.join(gameName)
          Game.recordActivity(db, gameName)
          // all socket events are broadcast to all other players in the room
          socket.on('location', message => {
            debug(`${id} is moving`)
            Game.recordActivity(db, gameName)
            const {latitude, longitude, accuracy} = JSON.parse(message)
            socket.broadcast.to(gameName).emit('location', {id, latitude, longitude, accuracy})
          })
          socket.on('join', _ => {
            debug(`${id} joined game`)
            socket.broadcast.to(gameName).emit('join', {id})
          })
          socket.on('abort', _ => {
            debug(`${id} aborted game`)
            socket.broadcast.to(gameName).emit('abort', {id})
          })
          socket.on('gameOver', _ => {
            debug(`${id} sent game over message`)
            socket.broadcast.to(gameName).emit('gameOver', {id})
          })
        })
        .catch(error => {
          console.error('AuthorizationError', error)
          socket.emit('error', {error: 'AuthorizationError'})
        })
    })
  })

  return server
}

module.exports = {
  init
}
