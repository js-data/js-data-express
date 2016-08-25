import { JSDataExpress, queryParser } from './_setup'
import { Container, utils } from 'js-data'

import express from 'express'
import request from 'supertest'
import sinon from 'sinon'
import { assert } from 'chai'

describe('Router', function () {
  let app, store

  beforeEach(function () {
    app = express()
    store = new Container()
    store.defineMapper('user')
    store.defineMapper('post')
  })

  it('should be a function', function () {
    assert.equal(typeof JSDataExpress.Router, 'function')
  })

  describe('options', function () {
    describe('request', function () {
      it('can be set globally')

      it('can be set per method', function (done) {
        const users = [{ id: 1, role: 'admin' }, { id: 2, role: 'dev' }]
        const stub = sinon.stub(store.getMapper('user'), 'findAll', () => utils.resolve([users[0]]))
        const jsdataOpts = {
          with: ['posts', 'posts.comments']
        }
        const params = { role: 'admin' }
        const query = Object.assign({}, params, jsdataOpts)

        app.use('/', queryParser)
        JSDataExpress.mount(app, store, {
          findAll: {
            request (req, res, next) {
              req.query.foo = 'bar'
              next()
            }
          }
        })

        request(app)
          .get('/user')
          .query(query)
          .end((err, response) => {
            if (err) {
              return done(err)
            }
            assert.equal(stub.calledOnce, true)
            assert.deepEqual(stub.firstCall.args[0], Object.assign({ foo: 'bar' }, params))
            assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
            assert.deepEqual(response.body, [users[0]])
            done()
          })
      })
    })

    describe('response', function () {
      it('can be set globally')

      it('can be set per method', function (done) {
        const users = [{ id: 1, role: 'admin' }, { id: 2, role: 'dev' }]
        const stub = sinon.stub(store.getMapper('user'), 'findAll', () => utils.resolve([users[0]]))
        const jsdataOpts = {
          with: ['posts', 'posts.comments']
        }
        const params = { role: 'admin' }
        const query = Object.assign({}, params, jsdataOpts)

        app.use('/', queryParser)
        JSDataExpress.mount(app, store, {
          findAll: {
            response (req, res, next) {
              res.send({ data: req.jsdataResult })
            }
          }
        })

        request(app)
          .get('/user')
          .query(query)
          .end((err, response) => {
            if (err) {
              return done(err)
            }
            assert.equal(stub.calledOnce, true)
            assert.deepEqual(stub.firstCall.args[0], params)
            assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
            assert.deepEqual(response.body, { data: [users[0]] })
            done()
          })
      })
    })

    describe('toJSON', function () {
      it('can be set to a function globally')

      it('can be set to a function per method')

      it('can be set to false globally')

      it('can be set to false per method')

      it('can be set to true or left undefined globally')

      it('can be set to true or left undefined per method')
    })

    describe('statusCode', function () {
      it('can be set per method')
    })
  })

  describe('GET /:resource', function (done) {
    it('should handle request', function (done) {
      const users = [{ id: 1, role: 'admin' }, { id: 2, role: 'dev' }]
      const stub = sinon.stub(store.getMapper('user'), 'findAll', () => utils.resolve([users[0]]))
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }
      const params = { role: 'admin' }
      const query = Object.assign({}, params, jsdataOpts)

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .get('/user')
        .query(query)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args[0], params)
          assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
          assert.deepEqual(response.body, [users[0]])
          done()
        })
    })
  })

  describe('GET /:resource/:id', function (done) {
    it('should handle request', function (done) {
      const user = { id: 1, role: 'admin' }
      const stub = sinon.stub(store.getMapper('user'), 'find', (id) => utils.resolve(user))
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .get('/user/1')
        .query(jsdataOpts)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args, ['1', jsdataOpts])
          assert.deepEqual(response.body, user)
          done()
        })
    })
  })

  describe('POST /:resource', function (done) {
    it('should handle request with a single resource', function (done) {
      const props = { role: 'admin' }
      const user = { id: 1, role: 'admin' }
      const stub = sinon.stub(store.getMapper('user'), 'create', () => utils.resolve(user))
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .post('/user')
        .query(jsdataOpts)
        .send(props)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args, [props, jsdataOpts])
          assert.deepEqual(response.body, user)
          done()
        })
    })

    it('should handle request with an array of resources', function (done) {
      const props = [{ role: 'admin' }, { role: 'dev' }]
      const users = [{ id: 1, role: 'admin' }, { id: 2, role: 'dev' }]
      const stub = sinon.stub(store.getMapper('user'), 'createMany', () => utils.resolve(users))
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .post('/user')
        .query(jsdataOpts)
        .send(props)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args, [props, jsdataOpts])
          assert.deepEqual(response.body, users)
          done()
        })
    })
  })

  describe('PUT /:resource', function (done) {
    it('should handle request with a single resource', function (done) {
      const props = { role: 'admin' }
      const params = { role: 'dev' }
      const users = [{ id: 1, role: 'admin' }, { id: 2, role: 'admin' }]
      const stub = sinon.stub(store.getMapper('user'), 'updateAll', () => utils.resolve(users))
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }
      const query = Object.assign({}, params, jsdataOpts)

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .put('/user')
        .query(query)
        .send(props)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args, [props, params, jsdataOpts])
          assert.deepEqual(response.body, users)
          done()
        })
    })

    it('should handle request with an array of resources', function (done) {
      const users = [{ id: 1, role: 'admin' }, { id: 2, role: 'admin' }]
      const stub = sinon.stub(store.getMapper('user'), 'updateMany', () => utils.resolve(users))
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .put('/user')
        .query(jsdataOpts)
        .send(users)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args, [users, jsdataOpts])
          assert.deepEqual(response.body, users)
          done()
        })
    })
  })

  describe('PUT /:resource/:id', function () {
    it('should handle request', function (done) {
      const props = { role: 'admin' }
      const user = { id: 1, role: 'admin' }
      const stub = sinon.stub(store.getMapper('user'), 'update', (id) => utils.resolve(user))
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .put('/user/1')
        .query(jsdataOpts)
        .send(props)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args, ['1', props, jsdataOpts])
          assert.deepEqual(response.body, user)
          done()
        })
    })
  })

  describe('DELETE /:resource', function () {
    it('should handle request', function (done) {
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }
      const params = {
        role: 'dev'
      }
      const stub = sinon.stub(store.getMapper('user'), 'destroyAll', () => utils.resolve())
      const query = Object.assign({}, params, jsdataOpts)

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .delete('/user')
        .query(query)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args, [params, jsdataOpts])
          done()
        })
    })
  })

  describe('DELETE /:resource/:id', function () {
    it('should handle request', function (done) {
      const stub = sinon.stub(store.getMapper('user'), 'destroy', () => utils.resolve())
      const jsdataOpts = {
        with: ['posts', 'posts.comments']
      }

      app.use('/', queryParser)
      JSDataExpress.mount(app, store)

      request(app)
        .delete('/user/1')
        .query(jsdataOpts)
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(stub.calledOnce, true)
          assert.deepEqual(stub.firstCall.args, ['1', jsdataOpts])
          done()
        })
    })
  })

  it('should mount a Router to each mapper within a container', function (done) {
    store.defineMapper('todo')
    const userStub = sinon.stub(store.getMapper('user'), 'findAll', function () {
      return utils.resolve({})
    })
    const todoStub = sinon.stub(store.getMapper('todo'), 'findAll', function () {
      return utils.resolve({})
    })
    JSDataExpress.mount(app, store)

    request(app)
      .get('/user')
      .end((err, response) => {
        if (err) {
          return done(err)
        }
        assert.equal(userStub.calledOnce, true)

        request(app)
        .get('/todo')
        .end((err, response) => {
          if (err) {
            return done(err)
          }
          assert.equal(todoStub.calledOnce, true)
          done()
        })
      })
  })
})
