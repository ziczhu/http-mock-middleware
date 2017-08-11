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
  setTimeout(() => {
    res.json({
      success: true,
      msg: 'Hello, Node.js!'
    })
  }, 2000)
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
// * Caution Please *
// If you ever call any method of res object(this second argument) synchronously
// in your function, the middleware will ignore the return of your function.
// If you call any method of res object asynchronously but return anything except
// null/undefined at the same time, the return value will served as the result.
// So please use plain object for return or call specific method on res object.
// Do not mixing them up!
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
