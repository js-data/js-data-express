export function parseQuery (query) {
  if (query.where) {
    try {
      query.where = JSON.parse(query.where)
    } catch (err) {}
  }
  if (query.orderBy || query.sort) {
    const orderBy = query.orderBy || query.sort
    if (orderBy.length) {
      query.orderBy = orderBy.map((clause) => {
        if (typeof clause === 'string') {
          return JSON.parse(clause)
        }
        return clause
      })
      query.sort = undefined
    }
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
