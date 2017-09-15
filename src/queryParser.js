export function parseQuery (query) {
  if (query.where) {
    try {
      query.where = JSON.parse(query.where)
    } catch (err) {}
  }
  if (query.orderBy || query.sort) {
    let orderBy = query.orderBy || query.sort
    if (orderBy && typeof orderBy === 'string' && orderBy[0] === '[') {
      try {
        orderBy = JSON.parse(orderBy)
      } catch (err) {
        console.error('orderBy querystring parameter is not a well-formatted array!')
        throw err
      }
    }
    if (Array.isArray(orderBy)) {
      query.orderBy = orderBy.map((clause) => {
        if (typeof clause === 'string' && clause.indexOf('{') >= 0) {
          return JSON.parse(clause)
        }
        return clause
      })
    }
    query.sort = undefined
  }
}

export function queryParser (req, res, next) {
  req.jsdataOpts || (req.jsdataOpts = {})
  if (req.query.with) {
    req.jsdataOpts.with = req.query.with
    delete req.query.with
  }
  try {
    parseQuery(req.query)
    next()
  } catch (err) {
    next(err)
  }
}
