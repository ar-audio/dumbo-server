const generateRandomString = require('crypto-random-string')
const TOKEN_LENGTH = 64

/**
 * Generates a token that's used for player authentication. The token is a
 * string with length `TOKEN_LENGTH` that has to be kept secret by the client.
 *
 * @return String
 */
module.exports = function generateToken () {
  return generateRandomString(TOKEN_LENGTH)
}
