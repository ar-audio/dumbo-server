'use strict'

exports.up = (r, connection) =>
  r.tableCreate('players').run(connection)

exports.down = (r, connection) =>
  r.tableDrop('players').run(connection)
