// Generated by CoffeeScript 1.10.0
(function() {
  var chain, connect, createChannel, curry, listen, sendToQueue, toString;

  connect = require('amqplib').connect;

  curry = require('ramda').curry;

  chain = curry((function(_this) {
    return function(f, p) {
      return p.then(f);
    };
  })(this));

  toString = (function(_this) {
    return function(b) {
      return b.toString();
    };
  })(this);

  createChannel = (function(_this) {
    return function(conn) {
      return conn.createChannel();
    };
  })(this);

  sendToQueue = curry((function(_this) {
    return function(queue, msg, ch) {
      ch.assertQueue(queue, {
        durable: false
      });
      return ch.sendToQueue(queue, new Buffer(msg));
    };
  })(this));

  listen = curry((function(_this) {
    return function(queue, f, ch) {
      var handler;
      handler = function(msg) {
        return Promise.resolve(msg.content.toString()).then(f).then(function() {
          return ch.ack(msg);
        });
      };
      ch.assertQueue(queue, {
        durable: false
      });
      return ch.consume(queue, handler, {
        noAck: false
      });
    };
  })(this));

  module.exports = (function(_this) {
    return function(url) {
      var channel, push, worker;
      channel = chain(createChannel, connect(url));
      push = curry(function(queue, msg) {
        return chain(sendToQueue(queue, msg), channel);
      });
      worker = curry(function(queue, handler) {
        chain(listen(queue, handler), channel);
        return chain(listen(queue, handler), channel).then(function(e) {
          return console.log('worker registered');
        });
      });
      return {
        push: push,
        worker: worker
      };
    };
  })(this);

}).call(this);