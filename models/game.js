const _ = require('lodash')

// required for game name generation
const fs = require('fs')
const path = require('path')
const names = String(fs.readFileSync(path.resolve('assets/dict/propernames'))).split('\n').map(name => name.toLocaleLowerCase())

const generateName = require('../utils/generate-name.js')

const MAX_GAME_CREATION_TRIES = 10

function tooBusyError () {
  const err = new Error('Maximum number of players exceeded')
  err.name = 'TooBusyError'
  return err
}

function hideToken (obj) {
  return _.omit(obj, 'token')
}

const Game = {
  /**
   * Starts a new game that is guaranteed to have a unique name.
   *
   * @return Promise
   */
  create (db, player1, tries = 1) {
    // abort after x tries, otherwise people could crash this by calling it often enough
    if (tries > MAX_GAME_CREATION_TRIES) return Promise.reject(new Error('Could not create new game'))

    const now = Date.now()
    return db.table('games')
      .insert({
        name: generateName(names),
        players: [player1],
        createdAt: now,
        updatedAt: now
      }, {
        conflict: 'error',
        returnChanges: true
      })
      .run()
      .then(result => {
        if (result.changes.length) {
          const change = result.changes[0].new_val
          return {
            ...change,
            players: _.map(change.players, hideToken)
          }
        } else {
          return Game.create(db, player1, ++tries)
        }
      })
  },

  get (db, name) {
    return db.table('games').get(name)
      .run()
      .then(result => {
        if (result == null) return
        return {
          ...result,
          // remove tokens from result
          players: _.map(result.players, hideToken)
        }
      })
  },

  join (db, name, player) {
    return db.table('games').get(name)
      .update(game => db.branch(
        game('players').count().lt(2),
        { players: game('players').append(player) },
        null
      ), {returnChanges: true})
      .run()
      .then(result => {
        if (!result.changes.length) {
          throw tooBusyError()
        }

        console.log('update result', result.changes[0])
        const change = result.changes[0].new_val
        return {
          ...change,
          players: _.map(change.players, hideToken)
        }
      })
  },

  /**
   * Pushes updates about a game on a websocket
   */
  watch (db, name, socket) {
    let numPlayers = 0
    const channel = socket.get().of(name)
    console.log('Opened channel', name)

    channel.on('connection', client => {
      numPlayers++
      console.log(`Connection on channel ${name}, players active: ${numPlayers}`)

      // TODO: Emit movements, make sure to only push valid changes
      client.on('movement', message => {
        console.log('Received message in', name)
        console.log(message)
      })

      client.on('disconnect', _ => {
        numPlayers--
        if (numPlayers === 0) {
          // TODO: Delete channel
        }
      })
    })

    // return db.table('games').get(name)
    //   .changes()
    //   .run((err, cursor) => {
    //     if (err) {
    //       console.error('Error in changefeed of', name)
    //       console.error(err)
    //       return
    //     }

    //     console.log('Got changes in game', name)
    //     console.log('Change callback called with args:', arguments)
    //     cursor.each(c => {
    //       console.log('cursor', cursor)
    //       channel.emit('movement', cursor)
    //     })
    //     channel.emit('test', 'hey there, this is a test')
    //  })
  },

  /**
   * Deletes all games older than `minLastActivity`.
   * @param Date minLastActivity
   * @return Promise
   */
  clean (minLastActivity) {
    return Promise.reject(new Error('TODO: Implement me'))
  }
}

module.exports = Game
