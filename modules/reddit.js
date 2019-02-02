const async = require('async')
const utils = require('./utils')
const api = require('./reddit-api')

module.exports = class Reddit {
  constructor(socket) {
    this._socket = socket
    this._run = false
  }
  
  async findRelated(subreddit) {
    return new Promise(async (resolve, reject) => {
      try {
        this._subreddit = subreddit
        this._run = true
        this._sub = await api.getSubredditPosts(this._subreddit, 100)
        this._posts = this._sub.data.children
        this._authors = this.getAuthors()
        this._subreddits = await this.getAuthorSubreddits()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  package(count) {
    const all = [].concat.apply([], this._subreddits)
    const freqs = utils.getFreqs(all).sort((a, b) => b.count - a.count)
    const pkg = {
      count: count,
      total: this._authors.size,
      freqs: freqs,
    }
    return JSON.stringify(pkg)
  }

  getAuthors() {
    const authors = []
    this._posts.forEach(post => {
      authors.push(post.data.author)
    })
    return new Set(authors)
  }

  stop() {
    this._run = false
  }


  async getAuthorSubreddits() {
    return new Promise(async (resolve, reject) => {
      let subreddits = []
      this._subreddits = subreddits
      try {
        let i = 1
        async.eachSeries(
          this._authors,
          async (author) => {
            if (this._socket.connected && this._run) {
              const s = await this.getSubreddits(author)
              console.log(`Getting ${i} of ${this._authors.size}`)
              this._subreddits.push(Array.from(new Set(s)))
              this._socket.emit('related', this.package(i))
              i++
              await utils.waitFor(1000)
            } else {
              console.log('User disconnected. Stopping.')
            }
          },
          err => {
            if (err) reject(err)
            resolve(subreddits)
          }
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  async getSubreddits(author) {
    return new Promise(async (resolve, reject) => {
      try {
        const subreddits = []
        const res = await api.getUserPosts(author, 100)
        if (res) {
          const posts = res.data.children
          posts.forEach(post => {
            subreddits.push(post.data.subreddit)
          })
        }
        resolve(subreddits)
      } catch (error) {
        reject(error)
      }
    })
  }
}
