const generateToken = require('../utils/generate-token.js')

module.exports = {
  create (db) {
    // every player gets a unique token for authorization
    const token = generateToken()
    return db.table('players')
      .insert({ token }, { returnChanges: true })
      .run()
      .then(result => result.changes[0].new_val)
  }
}
