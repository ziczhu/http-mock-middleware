# http-mock-middleware

### A Http Mock Middleware for Express.js

## Install

``` bash
npm install --save http-mock-middleware
```

## Usage

``` js
const mockMiddleware = require('http-mock-middleware')
const mockDirectory = 'mock'

app.use(mockMiddleware(mockDirectory))
```

## Mock Data (under /mock)
/api/test.json => /api/test.json.js

``` js
module.exports = {
  success: true,
  msg: 'Hello, Node.js!'
}

// Using user-defined funciton (See more methods on req/res in [Express 4.x API](http://expressjs.com/en/4x/api.html#req))
module.exports = function(req, res) {
  res.json({
    success: true,
    msg: 'Hello, Node.js!'
  })
}

// Using params in url (See more details about url pattern in [path-to-regexp](https://www.npmjs.com/package/path-to-regexp))
// /api/test/1 => /api/test/:test_id.js
module.exports = function(req, res) {
  res.json({
    success: true,
    msg: req.params.test_id
  })
}

// Simplify the response, default to return JSON format
// *Caution* Please! If you ever call any methods of res object(this second argument) in your function, the middleware will ignore the return of your function. So use plain object for return or call specific method on res object.
module.exports = function(req) {
  return {
    success: true,
    msg: req.params.test_id
  })
}

// Define different HTTP methods
module.exports = {
  __GET: {
    success: true,
    msg: 'Hello, Node.js!'
  },

  __POST: {
    success: 'true'
  }
}
```
