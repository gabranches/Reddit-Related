const async = require('async')
const utils = require('./utils')
const api = require('./reddit-api')

module.exports = class Reddit {
  constructor(subreddit, io) {
    this._subreddit = subreddit
    this._io = io
  }

  async findRelated() {
    return new Promise(async (resolve, reject) => {
      try {
        this._sub = await api.getSubredditPosts(this._subreddit, 50)
        this._posts = this._sub.data.children
        this._authors = this.getAuthors()
        this._subreddits = await this.getAuthorSubreddits()
      } catch (error) {
        reject(error)
      }
    })
  }

  package() {
    const all = [].concat.apply([], this._subreddits)
    const freqs = utils.getFreqs(all).sort((a, b) => b.count - a.count)
    return JSON.stringify(freqs)
  }

  getAuthors() {
    const authors = []
    this._posts.forEach(post => {
      authors.push(post.data.author)
    })
    return new Set(authors)
  }

  async getAuthorSubreddits() {
    return new Promise(async (resolve, reject) => {
      let subreddits = []
      this._subreddits = subreddits
      try {
        let i = 1
        async.eachSeries(
          this._authors,
          async author => {
            const s = await this.getSubreddits(author)
            console.log(`Getting ${i} of ${this._authors.size}`)
            i++
            this._subreddits.push(Array.from(new Set(s)))
            this._io.emit('related', this.package())
            await utils.waitFor(1000)
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
