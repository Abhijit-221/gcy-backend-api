const mongoose = require('mongoose');

//connection
const dbconnection = mongoose.connect(process.env.DB_URL,{
    autoIndex: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
    
module.exports = dbconnection;