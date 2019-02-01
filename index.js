const express = require('express')
const app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
const Reddit = require('./modules/reddit.js')

app.use(express.static('public'))

io.on('connection', function(socket) {
  console.log('User connected')

  socket.on('request-subreddit', function(msg){
    console.log('Subreddit requested: ' + msg);
    const r = new Reddit(msg, io)
    r.findRelated(io)
  });

  socket.on('disconnect', function() {
    console.log('User disconnected')
  })
})

http.listen(3000, () => {
  console.log('Application running.')
})
