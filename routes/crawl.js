const { main } = require('../crawler/scrap')
const { separation } = require('../crawler/split')
const Crawl = require('../model/Crawl')
const { User } = require('../model/User')
const { auth } = require('../util/auth')
const router = require('express').Router()

router.get('/assignment', auth, async (req, res) => {
  if (process.env.CONNECTION_ERROR != -1) {
    let resData = {
      success: false,
      err: process.env.CONNECTION_ERROR.err,
      msg: process.env.CONNECTION_ERROR.msg,
    }
    res.status(503).json(resData)
  }

  separation(req.user.pages)
    .then((ass) => {
      let data = {}
      console.log(
        'Test: ',
        ass.keys.length === ass.rowData.length && ass.keys.length > 0,
      )
      if (ass.keys.length > 0) {
        for (let i = 0; i < ass.keys.length; i++) {
          console.log('key: ', ass.keys[i], ' value: ', ass.rowData[i])
          data[ass.keys[i]] = ass.rowData[i]
        }
      }
      console.log(data)
      Crawl.findOneAndUpdate(
        { uid: req.user._id },
        { assignments: data },
        (err, doc, response) => {
          if (err) res.status(500).json({ success: false, err })
          if (!doc) {
            doc
            let cr = new Crawl({
              uid: req.user._id,
              assignments: data,
            })
            cr.save((err, doc) => {
              if (err) res.status(500).json({ success: false, err })

              res.json({
                success: true,
                doc,
              })
            })
          } else {
            res.json({
              success: true,
              doc,
            })
          }
        },
      )
    })
    .catch((err) => {
      return res.status(500).json({ success: false, err })
    })
})

router.get('/pages/load', auth, async (req, res) => {
  if (process.env.CONNECTION_ERROR != -1) {
    let resData = {
      success: false,
      err: process.env.CONNECTION_ERROR.err,
      msg: process.env.CONNECTION_ERROR.msg,
    }
    res.status(503).json(resData)
  }

  // let newUser = new User();
  // newUser.slfDec()
  let pages = await main(req.user.enroll, req.user.slfDec(req.user.tokenKey))

  if (pages.values.length === 8 && pages.coursePages.length === 8) {
    User.findByIdAndUpdate(req.user._id, { pages }, (err, doc) => {
      if (err) res.status(500).json({ success: false, err })

      res.json({
        success: true,
      })
    })
  }
})

module.exports = router
