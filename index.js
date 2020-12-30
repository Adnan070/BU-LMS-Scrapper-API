const app = require("express")();
const bodyParser = require("body-parser");
const cheerio = require("cheerio");
const mongoose = require('mongoose')
const cors = require('cors');
const session = require("express-session");
const schedule = require('node-schedule')


const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI;






// Connecting to Database
(async () => {
  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);
  await mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected…");
  })
  .catch((err) => console.log(err));
})();



// Use Middlewares
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
  session({
    secret: "Bukc AK",
    resave: true,
    saveUninitialized: true,

    cookie: {
      maxAge: 1000 * 60 * 60, // (1000 -> msec * 60 -> sec * 60 -> min * 24 -> hrs * 1 -> days)
    },
  })
);

  
  // Routes 
  // var { main } = require("./scrap");

  app.use('/lms/users', require('./routes/user') )
  app.use('/lms/crawler', require('./routes/crawl'))
  
  // app.get("/scrap", async (req, res) => {
    // main()
    //   .then((data) => {
      //     if (data.length === 8) {
        
        //     } else {
          //     }
          //   })
          //   .catch((err) => {
            //     console.log(err);
            //   });
            // const data = await main();
  // console.log(data);
  // if (data.length) {
    //   let $ = cheerio.load(data[0]);
    //   if ($.length) {
      //     res.status(200).send();
      //   } else {
  //     console.log("err");
  //   }
  // }
  // });

 

  // schedule.scheduleJob('*/2 * * * *', () => separation());
  
  
  app.listen(port, () => console.log("App is running!"));