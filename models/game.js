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
            players: _.map(change.players, 'id')
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
          players: _.map(result.players, 'id')
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
          players: _.map(change.players, 'id')
        }
      })
  },

  delete () {
    return Promise.reject(new Error('TODO: Implement me'))
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
