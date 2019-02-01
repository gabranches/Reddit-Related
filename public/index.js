var socket = io()
var app = new Vue({
  el: '#app',
  data: {
    subreddit: '',
    related: '[]',
  },
  created() {
    this.requestSubreddit()
    socket.on('related', msg => {
      this.related = msg
    })
  },
  computed: {
    list() {
      return JSON.parse(this.related)
    },
    multi() {
      const arr = this.list
        .filter(a => a.count > 1)
        .map(a => a.subreddit)
      return `https://www.reddit.com/r/${arr.join('+')}`
    },
  },
  methods: {
    requestSubreddit() {
      socket.emit('request-subreddit', this.subreddit)
    },
    subLink(sub) {
      return `https://www.reddit.com/r/${sub}`
    },
  },
})
