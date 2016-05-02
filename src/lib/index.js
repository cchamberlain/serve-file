import { assert } from 'chai'
import send from 'send'
import onFinished from 'on-finished'
import { isAbsolute } from './utils'

export default function serveFile(path, options, callback) {
  return (req, res) => {
    let done = callback
    let next = req.next
    let opts = options || {}
    assert.ok(path, 'path argument is required to serve file')

    // support function as second arg
    if (typeof options === 'function') {
      done = options
      opts = {}
    }
    assert.ok(opts.root || isAbsolute(path), 'path must be absolute or specify root to serve file')

    // create file stream
    let pathname = encodeURI(path)
    let file = send(req, pathname, opts)

    // transfer
    sendfile(res, file, opts, function (err) {
      if (done) return done(err)
      if (err && err.code === 'EISDIR') return next()

      // next() all but write errors
      if (err && err.code !== 'ECONNABORTED' && err.syscall !== 'write')
        next(err)
    })
  }
}


function sendfile(res, file, options, callback) {
  let done = false
  let streaming

  // request aborted
  function onaborted() {
    if (done) return
    done = true

    let err = new Error('Request aborted')
    err.code = 'ECONNABORTED'
    callback(err)
  }

  // directory
  function ondirectory() {
    if (done) return
    done = true

    let err = new Error('EISDIR, read')
    err.code = 'EISDIR'
    callback(err)
  }

  // errors
  function onerror(err) {
    if (done) return
    done = true
    callback(err)
  }

  // ended
  function onend() {
    if (done) return
    done = true
    callback()
  }

  // file
  function onfile() {
    streaming = false
  }

  // finished
  function onfinish(err) {
    if (err && err.code === 'ECONNRESET') return onaborted()
    if (err) return onerror(err)
    if (done) return

    setImmediate(function () {
      if (streaming !== false && !done) {
        onaborted()
        return
      }

      if (done) return
      done = true
      callback()
    })
  }

  // streaming
  function onstream() {
    streaming = true
  }

  file.on('directory', ondirectory)
  file.on('end', onend)
  file.on('error', onerror)
  file.on('file', onfile)
  file.on('stream', onstream)
  onFinished(res, onfinish)

  if (options.headers) {
    // set headers on successful transfer
    file.on('headers', function headers(res) {
      let obj = options.headers
      let keys = Object.keys(obj)

      for (let i = 0; i < keys.length; i++) {
        let k = keys[i]
        res.setHeader(k, obj[k])
      }
    })
  }

  // pipe
  file.pipe(res)
}
