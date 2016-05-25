import {
  JSDataExpress,
  JSData,
  assert,
  sinon
} from './_setup'

describe('js-data-express', function () {
  it('should have correct exports', function () {
    assert.equal(typeof JSDataExpress.Router, 'function')
    let router

    assert.throws(() => {
      router = new JSDataExpress.Router()
    }, Error, 'You must provide an instance of JSData.Container or JSData.DataStore!')

    const store = new JSData.Container()
    router = new JSDataExpress.Router(store)
    assert.equal(router instanceof JSDataExpress.Router, true)
    assert.equal(store instanceof JSData.Container, true)
    assert.strictEqual(router.store, store)

    assert.equal(JSDataExpress.version, '<%= version %>')
    assert.equal(typeof JSDataExpress.parseQuery, 'function')
    assert.equal(typeof JSDataExpress.queryParser, 'function')
  })
})
