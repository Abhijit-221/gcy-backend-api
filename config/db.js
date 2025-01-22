const mongoose = require('mongoose');

//connection
const dbconnection = mongoose.connect('mongodb://localhost:27017/gcy-db',{
    autoIndex: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });
    
module.exports = dbconnection;