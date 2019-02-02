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

  const r = new Reddit(socket)

  socket.on('request-subreddit', function(msg) {
    console.log('Subreddit requested: ' + msg)
    r.findRelated(msg)
      .then(() => {
        io.emit('done')
        console.log('Done.')
      })
      .catch(e => {
        throw e
      })
  })

  socket.on('stop', () => {
    r.stop()
  })

  socket.on('disconnect', function() {
    console.log(`User ${clientIp}:${clientId} disconnected`)
  })
})

http.listen(3000, () => {
  console.log('Application running.')
})
