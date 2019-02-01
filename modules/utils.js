const _ = require('lodash')

module.exports = {
  waitFor: ms => {
    return new Promise(r => setTimeout(r, ms))
  },
  getFreqs: arr => {
    const freqs = []
    arr.forEach(item => {
      const match = _.find(freqs, { subreddit: item })
      if (match) {
        match.count++
      } else {
        freqs.push({
          subreddit: item,
          count: 1,
        })
      }
    })
    return freqs
  },
}
