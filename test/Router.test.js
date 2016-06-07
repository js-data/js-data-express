import {JSDataExpress, queryParser} from './_setup'
import {Container, utils} from 'js-data'

import express from 'express'
import request from 'supertest'
import sinon from 'sinon'
import {assert} from 'chai'

describe('Router', function () {
  it('should be a function', function () {
    assert.equal(typeof JSDataExpress.Router, 'function')
  })

  it('should handle GET /:resource', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')
    const users = [{ id: 'abc' }, { id: '123' }]
    const stub = sinon.stub(UserMapper, 'findAll', function () {
      return utils.resolve(users)
    })

    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }
    const params = { abc: '123' }
    const query = Object.assign({}, params, jsdataOpts)

    app.use('/', queryParser)
    JSDataExpress.mount(app, store)

    request(app)
      .get('/user')
      .query(query)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.deepEqual(stub.firstCall.args[0], params)
        assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
        assert.deepEqual(response.body, users)
        done()
      })
  })

  it('should handle GET /:resource/:id', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }

    const stub = sinon.stub(UserMapper, 'find', function (id) {
      return utils.resolve({ id })
    })

    app.use('/', queryParser)
    JSDataExpress.mount(app, store)

    request(app)
      .get('/user/abcd')
      .query(jsdataOpts)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.equal(stub.firstCall.args[0], 'abcd')
        assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
        assert.deepEqual(response.body, { id: 'abcd' })
        done()
      })
  })

  it('should handle POST /:resource with a single resource', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }

    const user = { id: 'abcd' }
    const stub = sinon.stub(UserMapper, 'create', function (user) {
      return utils.resolve(user)
    })

    app.use('/', queryParser)
    JSDataExpress.mount(app, store)

    request(app)
      .post('/user')
      .query(jsdataOpts)
      .send(user)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.deepEqual(stub.firstCall.args[0], user)
        assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
        assert.deepEqual(response.body, user)
        done()
      })
  })

  it('should handle POST /:resource with an array of resources', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }

    const users = [{ id: 'abcd' }, {id: '1234'}]
    const stub = sinon.stub(UserMapper, 'createMany', function (users) {
      return utils.resolve(users)
    })

    app.use('/', queryParser)
    JSDataExpress.mount(app, store)

    request(app)
      .post('/user')
      .query(jsdataOpts)
      .send(users)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.deepEqual(stub.firstCall.args[0], users)
        assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
        assert.deepEqual(response.body, users)
        done()
      })
  })

  it('should handle PUT /:resource with a single resource', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }
    const params = { abc: '123' }
    const query = Object.assign({}, params, jsdataOpts)

    const user = { id: 'abcd' }
    const stub = sinon.stub(UserMapper, 'updateAll', function (user) {
      return utils.resolve(user)
    })

    app.use('/', queryParser)

    JSDataExpress.mount(app, store)

    request(app)
      .put('/user')
      .query(query)
      .send(user)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.deepEqual(stub.firstCall.args[0], user)
        assert.deepEqual(stub.firstCall.args[1], params)
        assert.deepEqual(stub.firstCall.args[2], jsdataOpts)
        assert.deepEqual(response.body, user)
        done()
      })
  })

  it('should handle PUT /:resource with an array of resources', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    app.use('/', queryParser)
    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }

    const users = [{ id: 'abc' }, { id: '123' }]
    const stub = sinon.stub(UserMapper, 'updateMany', function (users) {
      return utils.resolve(users)
    })

    JSDataExpress.mount(app, store)

    request(app)
      .put('/user')
      .query(jsdataOpts)
      .send(users)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.deepEqual(stub.firstCall.args[0], users)
        assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
        assert.deepEqual(response.body, users)
        done()
      })
  })

  it('should handle PUT /:resource/:id', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    app.use('/', queryParser)
    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }

    const user = { id: 'abcd' }
    const stub = sinon.stub(UserMapper, 'update', function (id) {
      return utils.resolve(user)
    })

    JSDataExpress.mount(app, store)

    request(app)
      .put('/user/abcd')
      .query(jsdataOpts)
      .send(user)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.deepEqual(stub.firstCall.args[0], 'abcd')
        assert.deepEqual(stub.firstCall.args[1], user)
        assert.deepEqual(stub.firstCall.args[2], jsdataOpts)
        assert.deepEqual(response.body, user)
        done()
      })
  })

  it('should handle DELETE /:resource', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    app.use('/', queryParser)
    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }
    const params = {
      abc: '123'
    }
    const query = Object.assign({}, params, jsdataOpts)

    const user = { id: 'abcd' }
    const stub = sinon.stub(UserMapper, 'destroyAll', function (id) {
      return utils.resolve(user)
    })

    JSDataExpress.mount(app, store)

    request(app)
      .delete('/user')
      .query(query)
      .send(user)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.deepEqual(stub.firstCall.args[0], params)
        assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
        assert.deepEqual(response.body, user)
        done()
      })
  })

  it('should handle DELETE /:resource/:id', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')

    app.use('/', queryParser)
    const jsdataOpts = {
      with: {
        foo: 'bar'
      }
    }

    const user = { id: 'abcd' }
    const stub = sinon.stub(UserMapper, 'destroy', function (id) {
      return utils.resolve(user)
    })

    JSDataExpress.mount(app, store)

    request(app)
      .delete('/user/abcd')
      .query(jsdataOpts)
      .send(user)
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(stub.calledOnce, true)
        assert.deepEqual(stub.firstCall.args[0], 'abcd')
        assert.deepEqual(stub.firstCall.args[1], jsdataOpts)
        assert.deepEqual(response.body, user)
        done()
      })
  })

  it('should mount a Router to each mapper within a container', function (done) {
    const app = express()
    const store = new Container()
    const UserMapper = store.defineMapper('user')
    const TodoMapper = store.defineMapper('todo')
    const userStub = sinon.stub(UserMapper, 'findAll', function () {
      return utils.resolve({})
    })
    const todoStub = sinon.stub(TodoMapper, 'findAll', function () {
      return utils.resolve({})
    })
    JSDataExpress.mount(app, store)

    request(app)
      .get('/user')
      .end(function (err, response) {
        if (err) {
          return done(err)
        }
        assert.equal(userStub.calledOnce, true)

        request(app)
        .get('/todo')
        .end(function (err, response) {
          if (err) {
            return done(err)
          }
          assert.equal(todoStub.calledOnce, true)
          done()
        })
      })
  })
})
