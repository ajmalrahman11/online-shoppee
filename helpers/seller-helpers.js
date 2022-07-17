const db = require('../config/connection')
const bcrypt = require('bcrypt');
const { resolve } = require('express-hbs/lib/resolver');
const { reject } = require('bcrypt/promises');
const collection = require('../config/collection');
const res = require('express/lib/response');
const { ObjectId } = require('mongodb');
const { enabled } = require('../app');


module.exports = {
    doSignup: (sellerData) => {
        delete sellerData.cpassword
        sellerData.isActive = true
        sellerData.claimed = 0
        sellerData.totalEarnings = 0
        sellerData.status = 'pending'
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection(collection.mainCollection).findOne({ username: sellerData.username })
            if (check) {
                reject()
            } else {
                sellerData.password = await bcrypt.hash(sellerData.password, 10)

                sellerData.role = 'seller'
                db.get().collection('main').insertOne(sellerData).then((data) => {
                    resolve(data)
                })
            }
        })
    },
    doLogin: (sellerData) => {
        return new Promise(async (resolve, reject) => {
            let seller = await db.get().collection('main').findOne({ username: sellerData.username })
            // console.log(seller);

            if (seller) {
                bcrypt.compare(sellerData.password, seller.password).then((response) => {
                    if (seller.role == 'seller') {
                        resolve(seller)
                    } else {
                        resolve(false)
                    }
                })
            } else {
                resolve(false)
            }

        })
    },
    addProducts: (product, sellerid) => {
        return new Promise(async (resolve, reject) => {
            // console.log(product);

            // console.log(product);
            // console.log(sellerid);
            product.isActive = true

            await db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(sellerid) }, {
                $push: {
                    'products': product
                }
            }, { upsert: true }).then((response) => {
                // console.log(response);
            })
            resolve()
        })
    },
    productObject: (product) => {
        return new Promise((resolve, reject) => {
            product.quantity = {}
            product._id = new ObjectId()
            product.date = new Date()
            product.price = parseInt(product.price)
            product.discount = parseInt(product.discount)
            // product.keywords=product.brandName+product.title+product.tags
            // product.description=''
            // product.keywords=[]
            // console.log(product);
            // let Quantity=product.quantity
            if (product.gender == "men" || product.gender == "women" || product.gender == "menWomen") {
                product.quantity.xs = parseInt(product.xs)
                product.quantity.s = parseInt(product.s)
                product.quantity.m = parseInt(product.m)
                product.quantity.l = parseInt(product.l)
                product.quantity.xl = parseInt(product.xl)
                product.quantity.xxl = parseInt(product.xxl)

            } else {
                product.quantity.xs = parseInt(product.kxs)
                product.quantity.s = parseInt(product.ks)
                product.quantity.m = parseInt(product.km)
                product.quantity.l = parseInt(product.kl)
                product.quantity.xl = parseInt(product.kxl)
                product.quantity.xxl = parseInt(product.kxxl)

            }
            delete product.xs
            delete product.s
            delete product.m
            delete product.l
            delete product.xl
            delete product.xxl
            delete product.kxs
            delete product.ks
            delete product.km
            delete product.kl
            delete product.kxl
            delete product.kxxl
            // console.log(product);
            resolve(product)
        })
    },
    imageUpload: (id) => {
        return new Promise(async (resolve, reject) => {
            let seller = await db.get().collection(collection.mainCollection).findOne({ _id: ObjectId(id) })
            // console.log(seller);
            // console.log(seller.products._id);
            resolve(seller.products._id)
        })
    },
    products: (sellerId) => {
        return new Promise((resolve, reject) => {
            let seller = db.get().collection(collection.mainCollection).findOne({ _id: ObjectId(sellerId) })
            //    console.log(products);
            resolve(seller)
        })
    },
    viewProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.mainCollection).aggregate([
                { $unwind: '$products' },
                { $match: { 'products._id': ObjectId(id) } },
                // { $project: { _id: 0, products: 1 } }
            ]).toArray()
            //    console.log(true);
            //    console.log(product[0]);
            //    console.log(true);
            resolve(product[0])
        })
    },
    updateProduct: (product, id) => {
        return new Promise(async (resolve, reject) => {
            console.log(true);
            // console.log(product._id);
            // console.log(product);
            await db.get().collection(collection.mainCollection).updateOne({ "products._id": ObjectId(id) },
                {
                    $set: {
                        'products.$.title': product.title,
                        'products.$.brandName': product.brandName,
                        'products.$.price': product.price,
                        'products.$.discount': product.discount,
                        'products.$.gender': product.gender,
                        'products.$.category': product.category,
                        'products.$.quantity.xs': product.quantity.xs,
                        'products.$.quantity.s': product.quantity.s,
                        'products.$.quantity.m': product.quantity.m,
                        'products.$.quantity.l': product.quantity.l,
                        'products.$.quantity.xl': product.quantity.xl,
                        'products.$.quantity.xxl': product.quantity.xxl,

                    }
                }).then((response) => {
                    // console.log(true);
                    // console.log(response);
                    resolve(response)
                })
        })
    },
    updateImage: (files, id) => {
        return new Promise((resolve, reject) => {
            // if (files.image1.name)
            if (files) {
                if (files.image1) {
                    upload(files.image1, 1)
                }

                if (files.image2) {
                    upload(files.image2, 2)
                }

                if (files.image3) {
                    upload(files.image3, 3)
                }

                if (files.image4) {
                    upload(files.image4, 4)
                }

                if (files.image5) {
                    upload(files.image5, 5)
                }

                if (files.image6) {
                    upload(files.image6, 6)
                }

            }
            //     (err, done) => {
            //     if (!err) {
            //         // res.send("success")
            //         // res.redirect('/sellers/product/description/add')

            //         // res.send("successful")
            //         resolve()
            //     } else {

            //         console.log("error" + err);
            //     }
            // }

            function upload(image, n) {
                image.mv('./public/product-images/' + id + '(' + n + ').jpg')
                // if (callback) {

                //     callback()
                // }
            }
            resolve()
        })
    },
    productEnable: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.mainCollection).updateOne({ "products._id": ObjectId(id) },
                {
                    $set: {
                        'products.$.isActive': true
                    }
                }, { upsert: true })
            resolve()
        })

    },
    disableProduct: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.mainCollection).updateOne({ "products._id": ObjectId(id) },
                {
                    $set: {
                        'products.$.isActive': false
                    }
                }, { upsert: true })
            resolve()
        })
    },
    updateProductQuantity: (cart) => {
        return new Promise(async (resolve, reject) => {
            // get quantity
            // let quantity=await db.get().collection(collection.mainCollection).aggregate([
            //     {
            //         $match : {_id:ObjectId(userId)}
            //     }
            // ])
            let q
            for (let i = 0; i < cart.count; i++) {
                q = -(cart[i].quantity)
                // console.log(cart[i].productId);
                if (cart[i].size == "xs") {
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId) }, { $inc: { 'products.$.quantity.xs': q } })
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId), 'products.quantity.xs': { $lte: 0 } }, { $set: { 'products.$.quantity.xs': null } })

                } else if (cart[i].size == "s") {
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId) }, { $inc: { 'products.$.quantity.s': q } })
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId), 'products.quantity.xs': { $lte: 0 } }, { $set: { 'products.$.quantity.xs': null } })

                } else if (cart[i].size == "m") {
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId) }, { $inc: { 'products.$.quantity.m': q } })
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId), 'products.quantity.xs': { $lte: 0 } }, { $set: { 'products.$.quantity.xs': null } })

                } else if (cart[i].size == "l") {
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId) }, { $inc: { 'products.$.quantity.l': q } })
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId), 'products.quantity.xs': { $lte: 0 } }, { $set: { 'products.$.quantity.xs': null } })

                } else if (cart[i].size == "xl") {
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId) }, { $inc: { 'products.$.quantity.xl': q } })
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId), 'products.quantity.xs': { $lte: 0 } }, { $set: { 'products.$.quantity.xs': null } })

                } else if (cart[i].size == "xxl") {
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId) }, { $inc: { 'products.$.quantity.xxl': q } })
                    await db.get().collection(collection.mainCollection).updateOne({ 'products._id': ObjectId(cart[i].productId), 'products.quantity.xs': { $lte: 0 } }, { $set: { 'products.$.quantity.xs': null } })

                }
            }
            resolve()
            // console.log(true);
            // console.log(cart.count);
        })
    },
    revenue: (sellerId) => {
        return new Promise(async (resolve, reject) => {
            // console.log(76351278);
            let result = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $unwind: '$orders'
                },
                {
                    $unwind: '$orders.products'
                },
                {
                    $match: { 'orders.products.isCancelled': false, 'orders.products.isDelivered': true }
                },
                {
                    $match: { 'orders.products.sellerId': ObjectId(sellerId), 'orders.status': 'placed' }
                },
                {
                    $project: { 'orders.products': 1, _id: 0 }
                }
            ]).toArray()
            // console.log(result[0].orders);
            // let revenue=
            let response = {}
            let netRevenue = 0, totalQuantity = 0
            for (let i of result) {
                netRevenue += i.orders.products.price
                totalQuantity += i.orders.products.quantity
            }
            netRevenue = netRevenue * 0.9
            response.netRevenue = netRevenue
            response.totalQuantity = totalQuantity

            // console.log(response);
            await db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(sellerId) }, { $set: { totalEarnings: netRevenue } })

            resolve(response)
        })
    },
    redeemRequest: (sellerId, balance, sellerName) => {
        return new Promise(async (resolve, reject) => {
            let redeem = {
                requestId: new ObjectId(),
                requestTime: new Date(),
                sellerId: ObjectId(sellerId),
                amount: Number(balance),
                sellerName: sellerName,
                paymentStatus: false

            }
            await db.get().collection(collection.mainCollection).updateOne(
                { role: "admin" },
                { $push: { redeemRequests: redeem } }
            )
            await db.get().collection(collection.mainCollection).updateOne(
                { _id: ObjectId(sellerId) },
                { $set: { redeemRequest: true } }
            )
            resolve()
        })
    },
    sellerDetails: (sellerId) => {
        return new Promise(async (resolve, reject) => {
            let sellerDetails = await db.get().collection(collection.mainCollection).findOne({ _id: ObjectId(sellerId) })
            resolve(sellerDetails)
        })
    },
    orders: (sellerId) => {
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $unwind: '$orders'
                },
                {
                    $unwind: '$orders.products'
                },
                {
                    $match: { 'orders.products.isCancelled': false }
                },
                {
                    $match: { 'orders.products.sellerId': ObjectId(sellerId), 'orders.status': 'placed' }
                },
                {
                    // $project: { 'orders.products': 1, _id: 0 }
                    $project: { orders: '$orders', _id: 0 }
                }
            ]).toArray()
            // console.log(result);
            resolve(result)
        })
    },
    shipProduct: (OrderId) => {
        return new Promise(async (resolve, reject) => {
            // await db.get().collection(collection.mainCollection).updateOne(
            //     {'orders.products.cart_id':ObjectId(OrderId)},
            //     {$set:{'orders.products.deliveryStatus':'shipped'}}
            // )

            db.get().collection(collection.mainCollection).updateOne(
                { 'orders.products.cart_id': ObjectId(OrderId) },
                {
                    $set: { 'orders.$.products.$[i].isShipped': true },
                },
                {
                    arrayFilters: [{
                        'i.cart_id': ObjectId(OrderId)
                    }]
                }
            ).then((e) => {
                console.log(e);
            })
            resolve()
        })
    },
    deliverProduct: (OrderId) => {
        return new Promise(async (resolve, reject) => {
            // await db.get().collection(collection.mainCollection).updateOne(
            //     {'orders.products.cart_id':ObjectId(OrderId)},
            //     {$set:{'orders.products.deliveryStatus':'shipped'}}
            // )

            await db.get().collection(collection.mainCollection).updateOne(
                { 'orders.products.cart_id': ObjectId(OrderId) },
                {
                    $set: { 'orders.$.products.$[i].isDelivered': true }
                },
                {
                    arrayFilters: [{
                        'i.cart_id': ObjectId(OrderId)
                    }]
                }
            )
            resolve()
        })
    },
    sellerDetails: (sellerId) => {
        return new Promise((resolve, reject) => {
            let seller = db.get().collection(collection.mainCollection).findOne({ _id: ObjectId(sellerId) })
            //    console.log(products);
            resolve(seller)
        })
    },
    paymentHistory: (sellerId) => {
        return new Promise(async (resolve, reject) => {
            let history = await db.get().collection(collection.mainCollection).find({ 'redeemRequests.sellerId': ObjectId(sellerId), 'redeemRequests.paymentStatus': true }).toArray()
            // console.log(history[0].redeemRequests);
            // if(history[0].redeemRequests){
            resolve(history)
            // }else{
            // resolve(null)
            // }

        })
    },
    DateValues: (sellerId) => {
        return new Promise(async (resolve, reject) => {
            let values = await db.get().collection(collection.mainCollection)
                .findOne({ role: "admin", 'redeemRequests.sellerId': ObjectId(sellerId) }, {})

            let today = new Date()
            let d = today.getDate()
            // console.log(today,a);
            let days = [  d - 6, d - 5, d - 4, d - 3, d - 2, d - 1, d]
            let data = values.redeemRequests
            for (let i in data) {
                if (data[i].paidOn) {
                    data[i].paidOn = data[i].paidOn.getDate()
                }
            }
            // console.log(data);
            let count = 0, y = [], p = 0, price = []
            for (let i in days) {
                count = 0
                p = 0
                for (let j in data) {
                    if (days[i] == data[j].paidOn) {
                        count++
                        p += data[j].amount
                    }

                }
                y.push(count)
                price.push(p)
            }
            console.log(days, y, price);
            let response = {
                days,
                price
            }
            resolve(response)
        })
    }

}



