'use strict'

exports.up = (r, connection) =>
  r.tableCreate('games', { primaryKey: 'name' }).run(connection)

exports.down = (r, connection) =>
  r.tableDrop('games').run(connection)
