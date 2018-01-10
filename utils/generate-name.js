/**
 * Picks a random element out of an array of elements
 * @param  Array<T> items
 * @return T
 */
function pickFrom (items) {
  const pick = Math.floor(Math.random() * items.length)
  return items[pick]
}

/**
 * Generates a name from one of the dictionary lists in /assets/dict
 */
module.exports = function generateName (list) {
  // TODO: Improve random picks
  const first = pickFrom(list)
  const remainingCandidates = list.filter(item => item[0] === first[0] && item !== first)
  const second = pickFrom(remainingCandidates)
  return `${first}-${second}`
}
