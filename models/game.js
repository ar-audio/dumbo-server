const debug = require('debug')('dumbo:models:game')

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
    debug(`${player1.id} trying to create new game`)
    // abort after x tries, otherwise people could crash this by calling it often enough
    if (tries > MAX_GAME_CREATION_TRIES) return Promise.reject(new Error('Could not create new game'))

    const now = db.now()
    return db.table('games')
      .insert({
        name: generateName(names),
        players: [player1.id],
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
          debug(`Created game ${change.name}`)
          return change
        } else {
          debug('Recurring. Game with name already exists.')
          return Game.create(db, player1, ++tries)
        }
      })
  },

  get (db, name) {
    return db.table('games').get(name)
      .run()
      .then(result => {
        if (result == null) return
        return result
      })
  },

  join (db, name, player, socket) {
    debug(`Player ${player.id} trying to join ${name}`)
    return db.table('games').get(name)
      .update(game => db.branch(
        game('players').count().lt(2),
        { players: game('players').append(player.id) },
        null
      ), {returnChanges: true})
      .run()
      .then(result => {
        if (!result.changes.length) {
          debug(`Too many players in ${name}`)
          throw tooBusyError()
        }

        const change = result.changes[0].new_val
        debug(`Players in ${name}: ${change.players.join(',')}`)
        return change
      })
  },

  /**
   * This method simply updates a timestamp to prevent games from being deleted
   */
  recordActivity (db, name) {
    return db.table('games').get(name)
      .update({updatedAt: db.now()})
      .run()
      .then(result => result.replaced === 1)
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
