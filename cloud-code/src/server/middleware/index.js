
const ctx = {}
const middleware = []

module.exports = (req, res) => async (fn) => {
  await Promise.all(middleware)
  middleware.push(fn(ctx, req, res))
}