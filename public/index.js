var socket = io()

var app = new Vue({
  el: '#app',
  data: {
    lastsearch: null,
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
        return `Enter a subreddit above to find related subreddits based on user activity`
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
        this.list = msg.freqs.filter(
          a => a.subreddit.toLowerCase() !== this.subreddit.toLowerCase()
        )
        this.total = msg.total
        this.count = msg.count
      })
      socket.on('done', msg => {
        this.searching = false
      })
    },
    requestSubreddit() {
      if (!this.searching) {
        this.list = []
        this.initial = true
        this.lastsearch = this.subreddit.slice(0);
        this.count = 0
        socket.emit('request-subreddit', this.subreddit)
        this.searching = true
      }
    },
    stop() {
      socket.emit('stop')
    },
    subLink(sub) {
      return `https://www.reddit.com/r/${sub}`
    },
    countText(count) {
      if (count === 1) return `1 match`
      else return `${count} matches`
    },
    getBarWidthStyle(count) {
      if (this.maxMatches === 0) return `width: 0;`
      const pct = count / this.maxMatches
      return `width: ${pct * 100}%;`
    },
    getLoadingBarStyle() {
      if (!this.searching) return `width: 0;`
      const pct = this.count / this.total
      return `width: ${pct * 100}%;`
    },
    getLoadingBarWrapperStyle() {
      if (!this.searching) return ''
      return `border: 1px solid #90bcea;`
    },
  },
})
