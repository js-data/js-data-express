import {
  assert,
  JSData,
  JSDataExpress
} from './_setup'
import request from 'supertest'
import express from 'express'

describe('js-data-express', function () {
  it('should have correct exports', function () {
    assert.equal(typeof JSDataExpress.Router, 'function')
    let router

    assert.throws(() => {
      router = new JSDataExpress.Router()
    }, Error, 'You must provide an instance of JSData.Container, JSData.DataStore, or JSData.Mapper!')

    const store = new JSData.Container()
    router = new JSDataExpress.Router(store)
    assert.equal(router instanceof JSDataExpress.Router, true)

    assert.equal(JSDataExpress.version, '<%= version %>')
    assert.equal(typeof JSDataExpress.parseQuery, 'function')
    assert.equal(typeof JSDataExpress.queryParser, 'function')
  })

  it('should use custom router request middleware', function () {
    const store = new JSData.Container()
    const userMapper = store.defineMapper('user')
    JSDataExpress.Router(userMapper, {
      request: (req, res, next) => {}
    })
  })

  it('should use custom getEndpoint method', function () {
    const store = new JSData.Container()
    store.defineMapper('user')
    JSDataExpress.Router(store, {
      getEndpoint: (mapper) => { return '/user' }
    })
  })

  it('makeHandler errors should be executed', function () {
    const _app = express()
    const __app = express()
    const store = new JSData.Container()
    store.defineMapper('user')
    const _config = {
      'find': {
        request: (req, res, next) => {
          next('error')
        }
      }
    }
    const __config = {
      'find': {
        action: (component, req) => {
          return new Promise((resolve, reject) => {
            reject('error')
          })
        }
      }
    }

    JSDataExpress.mount(_app, store, _config)
    JSDataExpress.mount(__app, store, __config)

    request(_app)
      .get('/user/abc')
      .end(function (err, response) {
        if (err) {}
      })
    request(__app)
      .get('/user/abc')
      .end(function (err, response) {
        if (err) {}
      })
  })
})
