const express = require('express')
const app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
const Reddit = require('./modules/reddit.js')

app.use(express.static('public'))

io.on('connection', function(socket) {
  const clientIp = socket.request.connection.remoteAddress
  const clientId = socket.id

  console.log(`User ${clientIp}:${clientId} connected`)

  socket.on('request-subreddit', function(msg) {
    console.log('Subreddit requested: ' + msg)
    const r = new Reddit(msg, socket)
    r.findRelated()
      .then(() => {
        io.emit('done')
        console.log('Done.')
      })
      .catch(e => {
        throw e
      })
  })

  socket.on('disconnect', function() {
    console.log(`User ${clientIp}:${clientId} disconnected`)
  })
})

http.listen(3000, () => {
  console.log('Application running.')
})
