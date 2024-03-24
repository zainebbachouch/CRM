const express = require("express");
const cors = require('cors');
const connection = require("./config/dbConnection");
const app = express();
app.use(cors());



app.listen(3000, () => {
    console.log("server is runnig");
    connection.connect(function (err) {
        if (err) throw err;
        console.log("database connect");
    })
});