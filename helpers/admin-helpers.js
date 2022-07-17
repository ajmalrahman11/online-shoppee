const db = require('../config/connection')
const bcrypt = require('bcrypt')
const { reject } = require('bcrypt/promises')
const collection = require('../config/collection')
const { ObjectId } = require('mongodb')
const { resolve } = require('express-hbs/lib/resolver')
const { redeemRequest } = require('./seller-helpers')

module.exports = {
    doLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection('main').findOne({ username: adminData.username })
            if (admin) {
                bcrypt.compare(adminData.password, admin.password).then((response) => {
                    // console.log(response);
                    if (response) {
                        if (admin.role == 'admin') {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    } else {
                        resolve(false)
                    }
                })
            } else {
                resolve(false)
            }
        })
    },
    viewUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = db.get().collection(collection.mainCollection).find({ role: 'user' }).toArray()
            resolve(users)
        })
    },
    deleteUser: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.mainCollection).remove({ _id: ObjectId(id) }).then((response) => {
                // console.log(response);
                resolve(response)
            })
        })
    },
    viewSellers: () => {
        return new Promise(async (resolve, reject) => {
            let sellers = db.get().collection(collection.mainCollection).find({ role: 'seller' }).toArray()
            resolve(sellers)
        })
    },
    deleteSeller: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.mainCollection).remove({ _id: ObjectId(id) }).then((response) => {
                // console.log(response);
                resolve(response)
            })
        })
    },
    blockUser: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(id) }, { $set: { isActive: false } }).then((response) => {
                resolve(response)
            })
        })
    },
    unBlockUser: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(id) }, { $set: { isActive: true } }).then((response) => {
                resolve(response)
            })
        })
    },
    blockSeller: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(id) }, { $set: { isActive: false } }).then((response) => {
                resolve(response)
            })
        })
    },
    unblockSeller: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(id) }, { $set: { isActive: true } }).then((response) => {
                resolve(response)
            })
        })
    },
    viewRequests: () => {
        return new Promise(async (resolve, reject) => {
            let requests = await db.get().collection(collection.mainCollection).find({ status: "pending", role: 'seller' }).toArray()
            resolve(requests)
        })
    },
    acceptSeller: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(id) },
                { $set: { status: "approved" } })
            resolve()
        })
    },
    rejectSeller: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(id) },
                { $set: { status: "rejected" } })
            resolve()
        })
    },
    rejectedList: () => {
        return new Promise(async (resolve, reject) => {
            let list = await db.get().collection(collection.mainCollection).find({ status: "rejected", role: 'seller' }).toArray()
            resolve(list)
        })
    },
    redeemRequests: () => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.mainCollection).findOne({ role: 'admin' })
            let redeemRequests = admin.redeemRequests
            console.log(836754273898763428);
            let count=0
            for (let i of redeemRequests) {
                if (!i.paymentStatus) {
                    count++
                }
            }
            console.log(count);
            response={
                redeemRequests:redeemRequests,
                count:count
            }
            resolve(response)
        })
    },
    sellerPayment: (sellerId, amount, requestId) => {
        return new Promise(async (resolve, reject) => {
            let paymentId = new ObjectId()
            let paidOn = new Date()
            await db.get().collection(collection.mainCollection).updateOne(
                { 'redeemRequests.requestId': ObjectId(requestId) },
                { $set: { 'redeemRequests.$.paymentStatus': true, 'redeemRequests.$.paymentId': paymentId, 'redeemRequests.$.paidOn': paidOn } }
            )

            await db.get().collection(collection.mainCollection).updateOne(
                { _id: ObjectId(sellerId), redeemRequest: true },
                {
                    $set: { redeemRequest: false }
                    , $inc: { claimed: Number(amount) }
                }


            )
            resolve()
        })
    },
    adminDetails: () => {
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.mainCollection).findOne({ role: 'admin' })
            resolve(admin)
        })
    },
    totalRevenue: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $unwind: '$orders'
                },
                {
                    $match: { 'orders.status': 'placed' }
                },
                {
                    $unwind: '$orders.products'
                },
                {
                    $match: { 'orders.products.isCancelled': false }
                },
                {
                    $project: { 'orders.products': 1, _id: 0 }
                }
            ]).toArray()
            // console.log(products[0].orders.products);
            // console.log(products);
            let sum = 0, count = 0
            for (let i of products) {
                sum += i.orders.products.price
                count++
            }
            let profit = sum * .1
            let response = {
                netRevenue: sum,
                count: count,
                profit: profit
            }
            console.log(sum);
            resolve(response)
        })
    }
}