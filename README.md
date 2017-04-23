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

// Using user-defined funciton
module.exports = function(req, res) {
  // http://expressjs.com/en/api.html
  res.json({
    success: true,
    msg: 'Hello, Node.js!'
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
