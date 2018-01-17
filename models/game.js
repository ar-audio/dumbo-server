// required for game name generation
const fs = require('fs')
const path = require('path')
const names = String(fs.readFileSync(path.resolve('assets/dict/propernames'))).split('\n').map(name => name.toLocaleLowerCase())

const generateName = require('../utils/generate-name.js')

const MAX_GAME_CREATION_TRIES = 10
module.exports = {
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
      .then(result => result.changes.length ? result.changes[0].new_val : newGame(player1, ++tries))
  },

  get (db, name) {
    return db.table('games').get(name)
      .run()
      .then(result => result != null
        // remove tokens from result
        ? {...result, players: result.players.map(({id, token}) => ({id}))}
        : result
      )
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
