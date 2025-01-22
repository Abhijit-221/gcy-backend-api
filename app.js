const express = require('express');
const app = express();
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const setupRoutes = require('./routes/index');

const PORT = process.env.PORT||8080;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
require('./config/passportCustomer');
setupRoutes(app);
// console.log('port :',process.env.PORT);
app.get('/',(req,res)=>{
    return res.status(200).json({
        status:200,
        message:'Welcome to the server',
    })
})


app.get('*', function (req, res) {
    res.sendFile(__dirname+'/public/error.html');
})
app.listen(PORT,()=>{
    console.log('server is running on port',PORT);
})