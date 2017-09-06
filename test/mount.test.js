import {JSDataExpress} from './_setup'
import {Container, utils} from 'js-data'
import express from 'express'
import request from 'supertest'
import sinon from 'sinon'
import {assert} from 'chai'

describe('mount', function () {
  it('should be a function', function () {
    assert.equal(typeof JSDataExpress.mount, 'function')
  })
  it('should mount queryParser', function (done) {
    const app = express()
    const store = new Container()
    store.defineMapper('user')
    JSDataExpress.mount(app, store)

    app.get('/', function (req, res, next) {
      assert.deepEqual(req.query, {
        where: {
          foo: 'bar'
        }
      })
      res.send('hi').end()
    })

    request(app)
      .get('/')
      .query({
        where: {
          foo: 'bar'
        }
      })
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(response.text, 'hi')
        done()
      })
  })
  it('should mount a store', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    const stub = sinon.stub(UserMapper, 'find').callsFake(function (id) {
      return utils.resolve({ id })
    })

    JSDataExpress.mount(app, store)

    request(app)
      .get('/user/abcd')
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.equal(stub.firstCall.args[0], 'abcd')
        assert.deepEqual(response.body, { id: 'abcd' })
        done()
      })
  })
  it('should mount a store at a path', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    const stub = sinon.stub(UserMapper, 'find').callsFake(function (id) {
      return utils.resolve({ id })
    })

    JSDataExpress.mount(app, store, '/api')

    request(app)
      .get('/api/user/abcd')
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.equal(stub.firstCall.args[0], 'abcd')
        assert.deepEqual(response.body, { id: 'abcd' })
        done()
      })
  })

  it('returns an error when the store is not an instance of Container', function () {
    const app = express()
    assert.throws(() => JSDataExpress.mount(app, {}, '/api'), Error)
  })
})
