{connect} = require 'amqplib'
{curry} = require 'ramda'

chain = curry (f, p) => p.then f
toString = (b) => b.toString()
createChannel = (conn) => conn.createChannel()

sendToQueue = curry (queue, msg, ch) =>
  ch.assertQueue queue, durable: false
  ch.sendToQueue queue, new Buffer(msg)

listen = curry (queue, f, ch) =>
  handler = (msg) =>
    Promise.resolve msg.content.toString()
      .then f
      .then () => ch.ack msg

  ch.assertQueue queue, durable: false
  ch.consume queue, handler, noAck: false


module.exports = (url) =>
  channel = chain createChannel, connect url

  push = curry (queue, msg) =>
    chain (sendToQueue queue, msg), channel

  worker = curry (queue, handler) =>
    chain (listen queue, handler), channel

    chain (listen queue, handler), channel
      .then (e) => console.log 'worker registered'

  {push, worker}
