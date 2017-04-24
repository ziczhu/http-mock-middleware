'use strict'

const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')
const pathToRegexp = require('path-to-regexp')

const HTTP_METHODS = require('http').METHODS

const isFunction = (x) => {
  return Object.prototype.toString.call(x) === '[object Function]'
}

const requireUncached = function (module) {
  delete require.cache[require.resolve(module)]
  return require(module)
}

module.exports = function (mockDirectory, options = {}) {
  const pointToPath = {}
  const resolvePoint = (filePath) => {
    const pathToMock = path.relative(mockDirectory, filePath)
    const point = '/' + pathToMock.substring(0, pathToMock.lastIndexOf('.'))
    return point
  }

  chokidar.watch(mockDirectory + '/**/*.js', {
    ignored: /(^|[\\])\../
  })
    .on('add', pathToFile => {
      const absPath = path.resolve(pathToFile)
      const point = resolvePoint(absPath)
      if (!pointToPath[point]) {
        console.log(chalk.green('Installing new Mock API:\n'))
        console.log(chalk.cyan(point) + ': ' + chalk.cyan(absPath))
        console.log()
        pointToPath[point] = absPath
      }
    })
    .on('unlink', pathToFile => {
      const absPath = path.resolve(pathToFile)
      const point = resolvePoint(absPath)
      if (pointToPath[point]) {
        console.log(chalk.green('Removing Mock API:\n'))
        console.log(chalk.red(point) + ': ' + chalk.red(absPath))
        console.log()
        delete pointToPath[point]
      }
    })

  ;(function traverseMockDir (mockDir) {
    fs.readdirSync(mockDir).forEach(function (file) {
      const filePath = path.resolve(mockDir, file)
      if (fs.statSync(filePath).isDirectory()) {
        traverseMockDir(filePath)
      } else {
        if (path.extname(file) !== '.js') {
          return
        }
        const point = resolvePoint(filePath)
        pointToPath[point] = filePath
      }
    })
  })(mockDirectory)

  console.log(chalk.cyan('Installing Mock files:\n'))
  console.dir(pointToPath)
  console.log()

  return function mock (req, res, next) {
    const originalUrl = req.originalUrl
    const pathname = req.path
    let point = null
    const points = Object.keys(pointToPath)
    const regexpArr = points.map(pathToRegexp)

    for (let i = 0, j = regexpArr.length; i < j; i++) {
      const re = regexpArr[i]
      const result = re.exec(pathname)
      if (result) {
        re.keys.forEach((key, idx) => {
          req.params[key.name] = result[idx + 1]
        })
        point = points[i]
        break
      }
    }

    if (!point) {
      return next()
    }

    const filePath = pointToPath[point]

    let mock = null

    try {
      mock = requireUncached(filePath)
    } catch (err) {
      console.log(chalk.red(`Error happened in Mock File: ${filePath}.\n`))
      console.log(err.stack)
      console.log()
      return next()
    }

    console.log('Request from ' + chalk.cyan(`[${req.method}] ${originalUrl}`) + ' received.\n')

    if (isFunction(mock)) {
      mock(req, res, next)
    } else {
      var methodDefined = false
      var returned = false
      for (let method in mock) {
        if (!method.startsWith('__')) {
          continue
        }

        var rawMethod = method.toUpperCase().slice(2)
        if (HTTP_METHODS.indexOf(rawMethod) === -1) {
          continue
        }

        methodDefined = true
        if (req.method === rawMethod) {
          returned = true
          mock = mock[method]
          if (isFunction(mock)) {
            mock(req, res, next)
          } else {
            res.json(mock)
          }
          break
        }
      }

      if (!methodDefined) {
        res.json(mock)
        returned = true
      }

      if (!returned) {
        console.log(chalk.red(req.method) + ' method doesn\'t exist for ' +
          chalk.cyan(originalUrl) + ', please define ' + chalk.cyan(`__${req.method}`) +
          ' in ' + chalk.cyan(filePath) + '\n')
        next()
      } else {
        console.log('Response mock data in ' + chalk.cyan(filePath) + '\n')
      }
    }
  }
}
