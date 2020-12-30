const app = require('express')()
const bodyParser = require('body-parser')
const cheerio = require('cheerio')
const mongoose = require('mongoose')
const cors = require('cors')
const session = require('express-session')
const schedule = require('node-schedule')

const port = server.listen(process.env.PORT || 3000)
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

// Use Middlewares
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(
  session({
    secret: 'Bukc AK',
    resave: true,
    saveUninitialized: true,

    cookie: {
      maxAge: 1000 * 60 * 60, // (1000 -> msec * 60 -> sec * 60 -> min * 24 -> hrs * 1 -> days)
    },
  }),
)

app.use('/lms/users', require('./routes/user'))
app.use('/lms/crawler', require('./routes/crawl'))

// schedule.scheduleJob('*/2 * * * *', () => separation());
// app.set('port', process.env.NODE_PORT)
app.listen(port, () => console.log('App is running!'))
