const app = require('express')()
const bodyParser = require('body-parser')
const cheerio = require('cheerio')
const mongoose = require('mongoose')
const session = require('express-session')
const schedule = require('node-schedule')

const port = process.env.PORT || 5000
const uri = process.env.MONGO_URI

// Connecting to Database
;(async () => {
  mongoose.set('useCreateIndex', true)
  mongoose.set('useFindAndModify', false)
  await mongoose
    .connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('MongoDB Connected…')
    })
    .catch((err) => console.log(err))
})()

// var corsOptions = {
//   origin: 'http://localhost:19006',
//   optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
// }

// app.options('*', cors())

// Use Middlewares
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(
  session({
    secret: 'Bukc AK',
    resave: false,
    saveUninitialized: false,

    cookie: {
      path: '/',
      httpOnly: true,
      secure: true,
      expires: false,
      // maxAge: 1000 * 60 * 60, // (1000 -> msec * 60 -> sec * 60 -> min * 24 -> hrs * 1 -> days)
    },
  }),
)

app.use('/lms/users', require('./routes/user'))
app.use('/lms/crawler', require('./routes/crawl'))

// schedule.scheduleJob('*/2 * * * *', () => separation());
// app.set('port', process.env.NODE_PORT)
app.listen(port, () => console.log('App is running!'))
