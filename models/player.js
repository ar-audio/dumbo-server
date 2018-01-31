const debug = require('debug')('marco-polo:models:player')
const generateToken = require('../utils/generate-token.js')

module.exports = {
  create (db) {
    // every player gets a unique token for authorization
    const token = generateToken()
    return db.table('players')
      .insert({ token }, { returnChanges: true })
      .run()
      .then(result => result.changes[0].new_val)
  },

  authorize (db, {id, token, gameName}) {
    // FIXME: select('player').with(playerId).where('token = $token')
    return db.table('games')
      .getAll(gameName)
      .filter(doc => doc('players').contains(id))
      // .merge(game => ({ player: db.table('players').getAll(id).filter({token}) }))
      .run()
      .then(result => {
        debug('authorize result positive', result)
        return Promise.resolve(result.length === 1)
      })
  }
}
