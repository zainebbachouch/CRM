const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const connection = require("./config/dbConnection");
const userRoute = require("./routes/userRoute");
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(
    cors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],

    })

);

app.use('/api', userRoute);

app.listen(5000, () => {
    console.log('Server running on https://localhost:5000');
    connection.connect(function (err) {
        if (err) throw err;
        console.log("database connect");
    })
});