module.exports = {
  driver: 'rethinkdb',
  db: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST
}
