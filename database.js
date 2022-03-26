const mongoose = require('mongoose');
const mongoURI = "mongodb+srv://neilrehani101:lordjesus25@memosify-cluster.3wpmq.mongodb.net/memosify";

const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("Connected to MongoDB successfully")
    })
}

module.exports = connectToMongo;