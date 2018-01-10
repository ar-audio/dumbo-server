const { DATABASE_HOST, DATABASE_NAME } = process.env

/**
 * A singleton providing a connection pool to our database instance
 * @module
 */
module.exports = require('rethinkdbdash')({
  host: DATABASE_HOST,
  db: DATABASE_NAME
})
