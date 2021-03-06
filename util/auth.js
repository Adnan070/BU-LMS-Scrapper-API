const { User } = require('../model/User')

let auth = (req, res, next) => {
  console.log(req.session)
  let token = req.session.w_auth
  console.log(token)

  if (!token)
    return res.status(403).json({ success: false, msg: 'Please login Again!' })
  User.findByToken(token, (err, user) => {
    if (err) throw err
    if (!user)
      return res.json({
        isAuth: false,
        error: true,
      })

    req.token = token
    req.user = user
    next()
  })
}

module.exports = { auth }
