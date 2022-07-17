const mongoClient = require('mongodb').MongoClient
require("dotenv").config();

const state = {
    db: null
}

module.exports.connect = function (done) {
    const url = 'mongodb://localhost:27017'
    const dbname = 'ecommerce'

    // const url = 'mongodb+srv://adarshvsurendran:8848160624@cluster0.yfvkh.mongodb.net/fashionFactory-ecommerce?retryWrites=true&w=majority'
    
    // const url = process.env.DATABASE
    // const dbname = 'fashionFactory-ecommerce'
    mongoClient.connect(url, (err, data) => {
        if (err) return done(err) 
        state.db=data.db(dbname)
         done()


    })
}

module.exports.get =function(){
    return state.db
}