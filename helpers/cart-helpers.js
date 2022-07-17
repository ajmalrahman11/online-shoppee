const db = require('../config/connection')
const bcrypt = require('bcrypt');
const { resolve } = require('express-hbs/lib/resolver');
const { reject } = require('bcrypt/promises');
const collection = require('../config/collection');
const res = require('express/lib/response');
const { ObjectId } = require('mongodb');
const { enabled } = require('../app');

module.exports={
    emptyCart: (userId)=>{
        // console.log(true);
        // console.log(userId);
        return new Promise(async(resolve,reject)=>{
          await  db.get().collection(collection.mainCollection).updateOne(
                { _id: ObjectId(userId) },
                { $unset: { cart: "" } }
            )
            resolve()
        })
        
    }
}