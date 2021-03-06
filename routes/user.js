const router = require('express').Router()
const { User } = require('../model/User')
const { auth } = require('../util/auth')

const async = require('async')
const Crawl = require('../model/Crawl')
const { main } = require('../crawler/scrap')

//=================================
//             User
//=================================

router.get('/auth', auth, (req, res) => {
  //   if (process.env.CONNECTION_ERROR != -1) {
  //     let resData = {
  //       success: false,
  //       err: process.env.CONNECTION_ERROR.err,
  //       msg: process.env.CONNECTION_ERROR.msg,
  //     }
  //     res.status(503).json(resData)
  //   }

  res.status(200).json({
    _id: req.user._id,
    // name: req.user.name,
    enroll: req.user.enroll,
    isAuth: true,
  })
})

router.post('/register', async (req, res) => {
  //   if (process.env.CONNECTION_ERROR != -1) {
  //     let resData = {
  //       success: false,
  //       err: process.env.CONNECTION_ERROR.err,
  //       msg: process.env.CONNECTION_ERROR.msg,
  //     }
  //     res.status(503).json(resData)
  //   }

  let body = {
    enroll: req.body.enroll,
    password: req.body.password,
  }
  const user = new User(body)
  User.findOne({ enroll: req.body.enroll }, (err, _user) => {
    if (_user) {
      return res
        .status(200)
        .json({ success: false, msg: 'User Already Exist! ' })
    }
    main(body.enroll, body.password)
      .then((pg) => {
        if (!pg)
          return res.status(403).json({
            success: false,
            msg: 'Invalid credentials provided!',
          })
        body['pages'] = pg

        user.save((err, doc) => {
          if (err) {
            console.log(err)
            return res.json({
              success: false,
              err,
            })
          }
          return res.status(200).json({
            success: true,
          })
        })
      })
      .catch((err) => {
        return res.status(500).json({
          success: false,
          err,
          msg: 'Some Server Error Please try Again Later!',
        })
      })
  })
})

router.post('/login', (req, res) => {
  //   if (process.env.CONNECTION_ERROR != -1) {
  //     let resData = {
  //       success: false,
  //       err: process.env.CONNECTION_ERROR.err,
  //       msg: process.env.CONNECTION_ERROR.msg,
  //     }
  //     res.status(503).json(resData)
  //   }

  User.findOne({ enroll: req.body.enroll }, (err, user) => {
    if (!user)
      return res.status(401).json({
        loginSuccess: false,
        message: 'Auth failed, Enroll not found. Please Register First!',
      })

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.status(401).json({
          loginSuccess: false,
          message: 'Wrong Password',
        })
      console.log('Password Correct')
      user.generateToken((err, user) => {
        if (err)
          return res.status(500).json({
            loginSuccess: false,
            err,
            msg:
              'Servers are not working as expected. The request is probably valid but needs to be requested again later.',
          })
        console.log('Token Genrated')
        req.session.w_auth = user.token
        console.log(req.session.w_auth)
        console.log('Session ID', req.session)
        res.status(200).json({
          loginSuccess: true,
          userId: user._id,
          enroll: user.enroll,
        })
      })
    })
  })
})

router.get('/logout', auth, (req, res) => {
  //   if (process.env.CONNECTION_ERROR != -1) {
  //     let resData = {
  //       success: false,
  //       err: process.env.CONNECTION_ERROR.err,
  //       msg: process.env.CONNECTION_ERROR.msg,
  //     }
  //     res.status(503).json(resData)
  //   }

  User.findOneAndUpdate(
    { _id: req.user._id },
    { token: '', tokenExp: '' },
    (err, doc) => {
      if (err) return res.json({ success: false, err })
      return res.status(200).send({
        success: true,
      })
    },
  )
})

module.exports = router
