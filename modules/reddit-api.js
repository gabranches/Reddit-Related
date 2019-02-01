const axios = require('axios')

const self = {}

self.getSubredditPosts = (subreddit, limit = 10) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://www.reddit.com/r/${subreddit}/.json?limit=${limit}`)
      .then(result => {
        resolve(result.data)
      })
      .catch(error => {
        reject(new Error(`Could not get subreddit posts: ${subreddit}`))
      })
  })
}

self.getUserPosts = (user, limit = 10) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`https://www.reddit.com/user/${user}/submitted/.json?limit=${limit}`)
      .then(result => {
        resolve(result.data)
      })
      .catch(error => {
        console.log(`Could not get user posts: ${user}`)
        resolve(null)
      })
  })
}

module.exports = self
