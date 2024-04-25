const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoute = require("./routes/userRoute");
const categorieRoute = require("./routes/categorieRoute");
const productRoute = require("./routes/productRoute");
const cookieParser = require("cookie-parser");
const app = express();
//app.use(cors()); 

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", true);
  next();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://127.0.0.1:3000",
  //origin: "*:*",
 /* credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
  // add this line
  exposeHeaders: ['Set-Cookie'],
  //debug: true,*/

}));

app.use(cookieParser());


app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(`Response sent: ${res.statusCode} ${res.statusMessage}`);
  });
  next();
});

app.use('/api', userRoute);
app.use('/api', categorieRoute);
app.use('/api', productRoute);

app.listen(5000, () => {
  console.log('Server running on https://localhost:5000');

});