# serve-file

[![NPM](https://nodei.co/npm/serve-file.png?stars=true&downloads=true)](https://nodei.co/npm/serve-file/)

Like [serve-static](https://npmjs.com/package/serve-static) but for individual files. Refactored and decoupled from [express](https://npmjs.com/package/express) `res.sendFile`. Can be used standalone with [router](https://npmjs.com/package/router) to support HTTP/2 protocol.

`npm i -S serve-file`


### Usage


```js
import Router from 'router'
import serveFile from 'serve-file'

const app = Router()
app.use('/my-file.txt', serveFile('path/to/my-file.txt'))
```
