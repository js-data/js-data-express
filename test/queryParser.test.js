import {
  JSDataExpress,
  assert,
  sinon
} from './_setup'

describe('queryParser', function () {
  it('should use parseQuery', function (done) {
    const req = {
      query: {
        with: ['baz'],
        where: '{"foo":"bar"}'
      }
    }
    const res = {}
    JSDataExpress.queryParser(req, res, function () {
      assert.deepEqual(req, {
        jsdataOpts: {
          with: ['baz']
        },
        query: {
          where: {
            foo: 'bar'
          }
        }
      })
      done()
    })
  })
})

describe('queryParser', function () {
  it('should parse query.where as JSON', function () {
    const query = {
      where: '{"foo":"bar"}'
    }
    JSDataExpress.parseQuery(query)
    assert.deepEqual(query, {
      where: {
        foo: 'bar'
      }
    })
  })
  it('should parse orderBy')
  it('should parse sort')
  it('should parse limit')
  it('should parse skip')
  it('should parse offset')
})
