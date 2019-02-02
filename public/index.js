var socket = io()

var app = new Vue({
  el: '#app',
  data: {
    subreddit: '',
    list: [],
    searching: false,
    count: null,
    total: null,
    initial: false,
  },
  created() {
    this.initializeSocket()
  },
  computed: {
    multi() {
      const arr = this.list.filter(a => a.count > 1).map(a => a.subreddit)
      return `https://www.reddit.com/r/${arr.join('+')}`
    },
    statusText() {
      if (this.initial) return `Getting user list...`
      if (this.searching) {
        return `Searching user ${this.count} of ${this.total}...`
      } else {
        return `Enter a subreddit below to find related subreddits based on user activity`
      }
    },
    maxMatches() {
      if (this.list) {
        return this.list[0].count
      } else {
        return 0
      }
    },
  },
  methods: {
    initializeSocket() {
      socket.on('related', msg => {
        this.initial = false
        msg = JSON.parse(msg)
        this.list = msg.freqs
          .filter(a => a.subreddit.toLowerCase() !== this.subreddit.toLowerCase())
        this.total = msg.total
        this.count = msg.count
      })
      socket.on('done', msg => {
        this.searching = false
      })
    },
    requestSubreddit() {
      this.initial = true
      socket.emit('request-subreddit', this.subreddit)
      this.searching = true
    },
    subLink(sub) {
      return `https://www.reddit.com/r/${sub}`
    },
    countText(count) {
      if (count === 1) return `1 match`
      else return `${count} matches`
    },
    getBarWidthStyle(count) {
      if (this.maxMatches === 0) return ''
      const pct = count / this.maxMatches
      return `width: ${pct * 100}%;`
    },
  },
})
