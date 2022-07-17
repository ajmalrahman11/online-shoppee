// const { get } = require('express/lib/response');
const db = require('../config/connection')
const bcrypt = require('bcrypt');
const { resolve } = require('express-hbs/lib/resolver');
const { reject } = require('bcrypt/promises');
const session = require('express-session');
const collection = require('../config/collection');
const { ObjectId } = require('mongodb');
const sellerHelpers = require('./seller-helpers')
const cartHelpers = require('./cart-helpers')

const Razorpay = require('razorpay');
const { products } = require('./seller-helpers');
const res = require('express/lib/response');

var instance = new Razorpay({
    key_id: process.env.RAZORPAY_ID,
    key_secret:  process.env.RAZORPAY_KEY,
});

let sum


// const { ObjectId } = require('mongodb');

module.exports = {
    doSignup: async (userData, verified) => {
        return new Promise(async (resolve, reject) => {
            if (!verified) {
                let check = await db.get().collection(collection.mainCollection).findOne({ username: userData.username })
                if (check) {
                    reject()
                } else {
                    resolve
                }
            } else {
                delete userData.cpassword
                userData.isActive = true
                userData.password = await bcrypt.hash(userData.password, 10)
                // console.log(userData.password);
                userData.role = "user"

                db.get().collection('main').insertOne(userData).then((data) => {
                    resolve(data)
                    // console.log(data);
                })
            }




        })



    },
    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection('main').findOne({ username: userData.username })
            //  console.log(user);
            // let status ={}
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    //  console.log(status);
                    // resolve(status)

                    if (status) {
                        if (user.role == 'user') {
                            resolve(user)
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
    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.mainCollection).aggregate([
                { $unwind: '$products' },
                {$match:{'products.isActive':true}},
                { $project: { products: 1, _id: 0 } }
            ]).toArray()
            // console.log(products);
            resolve(products)
        })
    },
    getAllBrands: (gender) => {
        // console.log(gender);
        return new Promise(async (resolve, reject) => {
            if (gender) {
                let brands = await db.get().collection(collection.mainCollection).aggregate([
                    { $unwind: '$products' },
                    { $match: { "products.gender": gender } },
                    { $group: { _id: { brandName: '$products.brandName' } } }
                ]).toArray()
                resolve(brands)
            } else {
                let brands = await db.get().collection(collection.mainCollection).aggregate([
                    { $unwind: '$products' },
                    // { $match: { "products.gender": gender } },
                    { $group: { _id: { brandName: '$products.brandName' } } }
                ]).toArray()
                resolve(brands)
            }
        })
    },
    addToCart: (product, userId, sellerId) => {
        return new Promise(async (resolve, reject) => {
            // console.log(userId);
            // console.log(product.id);

            let check = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $match: { _id: ObjectId(userId) }
                },
                {
                    $unwind: "$cart"
                },
                {
                    $project: { cart: 1, _id: 0 }
                },
                {
                    $match: { $and: [{ 'cart.productId': ObjectId(product.id) }, { 'cart.size': product.size }] }
                },
                {
                    $count: "count"
                }
            ]).toArray()
            // console.log(check[0]);
            if (check[0]) {
                let cart = await db.get().collection(collection.mainCollection).aggregate([
                    {
                        $match: { _id: ObjectId(userId) }
                    },
                    {
                        $unwind: "$cart"
                    },

                    {
                        $match: { $and: [{ 'cart.productId': ObjectId(product.id) }, { 'cart.size': product.size }] }
                    },
                    {
                        $project: { cart: 1, _id: 0 }
                    }

                ]).toArray()
                let cart_id = cart[0].cart.cart_id
                // console.log(cart_id);

                await db.get().collection(collection.mainCollection).updateOne({
                    "cart.cart_id": cart_id
                },
                    { $inc: { "cart.$.quantity": product.count } }
                ).then(() => {
                    resolve()
                })
            } else {
                await sellerHelpers.viewProduct(product.id).then(async (response) => {
                    let productDetails = response.products
                    let cart_id = new ObjectId()
                    await db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(userId) },
                        {
                            $push: {
                                cart: {
                                    cart_id: ObjectId(cart_id),
                                    productId: ObjectId(product.id),
                                    sellerId: ObjectId(sellerId),
                                    brandName: productDetails.brandName,
                                    title: productDetails.title,
                                    size: product.size,
                                    price: productDetails.price,
                                    quantity: 1
                                }
                            }
                        }
                    ).then((response) => {
                        resolve(response)
                    })
                })
            }




        })
    },
    viewUser: (id) => {
        return new Promise((resolve, reject) => {
            let userDetails = db.get().collection(collection.mainCollection).findOne({ _id: ObjectId(id) })
            resolve(userDetails)
        })
    },
    deleteFromCart: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.mainCollection).updateOne({ "cart.cart_id": ObjectId(id) },
                { $pull: { cart: { cart_id: ObjectId(id) } } }
            ).then((response) => {
                resolve()
            })
        })
    },
    changeQuantity: (product, userId) => {
        // console.log(product);
        // console.log(userId);
        return new Promise(async (resolve, reject) => {


            let user = await db.get().collection(collection.mainCollection).findOne({ "cart.cart_id": ObjectId(product.cartId) })
            // console.log(true);
            // console.log(user);
            await db.get().collection(collection.mainCollection).updateOne({
                _id: ObjectId(userId),
                "cart.cart_id": ObjectId(product.cartId)
            },
                { $inc: { "cart.$.quantity": product.count * 1 } }
            ).then((response) => {
                // console.log(response);
                resolve(response)
            })
        })
    },
    getTotal: (userId) => {
        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $match: { _id: ObjectId(userId) }
                }

            ]).toArray()
            //  console.log(total[0].cart);
            if (total[0].cart) {
                let cart = total[0].cart
                //  console.log(cart[0].price);
                let sum = 0, mult = 1, count = 0
                for (let i in cart) {
                    sum = sum + (cart[i].price * cart[i].quantity)
                    count += 1
                }
                // console.log(count);
                cart.sum = sum
                cart.count = count

                resolve(cart)
            } else {
                resolve(null)
            }

        })
    },
    addToWishlist: (product_id, user_id) => {
        return new Promise(async (resolve, reject) => {

            let check = await db.get().collection(collection.mainCollection).findOne({ _id: ObjectId(user_id), 'wishlist.productId': ObjectId(product_id) })
            //    console.log(check);
            if (check) {
                resolve()
            } else {
                await sellerHelpers.viewProduct(product_id).then(async (response) => {
                    // console.log(response.products);
                    let productDetails = response.products
                    let w_id = new ObjectId()
                    await db.get().collection(collection.mainCollection).updateOne({
                        _id: ObjectId(user_id)
                    },
                        {
                            $push: {
                                wishlist: {
                                    w_id: ObjectId(w_id),
                                    productId: productDetails._id,
                                    brandName: productDetails.brandName,
                                    title: productDetails.title,
                                    price: productDetails.price,
                                    discount: productDetails.discount
                                }
                            }
                        }
                    ).then((response) => {
                        resolve()
                    })
                })
            }
        })
    },
    deleteFromWishlist: (id) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.mainCollection).updateOne({ "wishlist.w_id": ObjectId(id) },
                { $pull: { wishlist: { w_id: ObjectId(id) } } }
            ).then((response) => {
                resolve()
            })
        })
    },
    searchGender: (gender) => {
        // console.log(gender);

        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.mainCollection)
                // .find({ 'products.gender': gender }, { 'products.$': 1, _id: 0 }).toArray()
                .aggregate([
                    {
                        $unwind: '$products'
                    },
                    {
                        $match: { 'products.gender': gender, 'products.isActive': true }
                    },
                    {
                        $project: { _id: 0, products: 1 }
                    }


                ]).toArray()
            // console.log(result);
            resolve(result)
        })
    },
    searchCategory: (category) => {
        // console.log(category);
        return new Promise(async (resolve, reject) => {
            let result = await db.get().collection(collection.mainCollection)
                // .find({ 'products.gender': gender }, { 'products.$': 1, _id: 0 }).toArray()
                .aggregate([

                    {
                        $match: { 'products.category': category }
                    },

                    {
                        $unwind: '$products'
                    },

                    {
                        $project: { _id: 0, products: 1 }
                    },
                    {
                        $match: { 'products.category': category }
                    },

                ]).toArray()
            // console.log(result);
            resolve(result)
        })
    },
    placeOrder: (order, user, cart) => {
        return new Promise(async (resolve, reject) => {
            // console.log(true);
            // console.log(cart);
            for (let i of cart) {
                i.isCancelled = false
            }
            let _id = new ObjectId()
            let orders = {}
            orders = order
            orders._id = _id
            orders.products = cart
            orders.date = new Date()

            // console.log(cart);

            orders.sum = cart.sum


            if (order.paymentMethod == 'cashOnDelivery') {

                orders.status = 'placed'

                await db.get().collection(collection.mainCollection).updateOne(
                    { _id: ObjectId(user._id) },
                    { $push: { orders: orders } }
                )
                cartHelpers.emptyCart(user._id).then(() => {
                    sellerHelpers.updateProductQuantity(cart).then(() => {
                        resolve(orders._id)
                    })
                })
                // console.log(true);
                // console.log(cart); 




            } else {
                orders.status = 'pending'
                await db.get().collection(collection.mainCollection).updateOne({ _id: ObjectId(user._id) },
                    // {'orders._id':ObjectId(_id)}
                    {
                        $push: { orders: orders }
                    }
                )
                // console.log(true);
                // console.log(user._id);
                cartHelpers.emptyCart(user._id).then(() => {
                    sellerHelpers.updateProductQuantity(cart).then(() => {
                        resolve(orders._id)
                    })
                })
            }
        })
    },
    generateRazorpay: (orderId, cartDetails) => {
        return new Promise((resolve, reject) => {
            var options = {
                amount: cartDetails.sum * 100,
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                // console.log(order);
                if (err) {
                    console.log(err);
                } else {
                    resolve(order)
                }
            })
        })
    },
    varifyPayment: (details) => {
        return new Promise(async (resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'oXPAXOEkWbzGlDN9U8epLbCv')
            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            //  console.log(details);
            if (hmac == details['payment[razorpay_signature]']) {
                // await db.get().collection(collection.mainCollection).updateOne
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => {
        // reached
        // console.log(true);
        // console.log(orderId);
        return new Promise((resolve, reject) => {
            db.get().collection(collection.mainCollection).updateOne(
                { 'orders._id': ObjectId(orderId) },
                {
                    $set: {
                        'orders.$.status': "placed"
                    }
                }
            ).then(() => {
                resolve()
            })
        })
    },
    getOrderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderDetails = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $match: { 'orders._id': ObjectId(orderId) }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $match: { 'orders._id': ObjectId(orderId) }
                },
                {
                    $project: { orders: 1, _id: 0 }
                }
            ]).toArray()
            // console.log(orderDetails);
            resolve(orderDetails[0])
        })
    },
    getAllOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $match: { _id: ObjectId(userId) }
                },
                {
                    $unwind: "$orders"
                },
                {
                    $unwind: "$orders.products"
                },
                {
                    $project: { orders: 1, _id: 0 }
                }
            ]).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    addProductReview: (details) => {
        console.log(details);
        details.date = new Date()
        return new Promise(async (resolve, reject) => {
            // let check=await db.get().collection(collection.mainCollection).aggregate([
            //     {
            //         $match:{_id:ObjectId(details.userId)}
            //     },
            //     {
            //         $unwind:'$orders'
            //     },
            //     {
            //         $unwind:'$orders.products'
            //     },
            //     {
            //         $project:{_id:0,'orders.products':1}
            //     },
            //     {
            //         $match: {'orders.products.productId': ObjectId(details.productId)}
            //     },


            // ]).toArray()

            // if(check.length !=0){
            await db.get().collection(collection.mainCollection).updateOne(
                { 'products._id': ObjectId(details.productId) },
                {
                    $push: {
                        'products.$.reviews': details
                    }
                }
            )
            let reviews = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $match: { 'products._id': ObjectId(details.productId) }
                },
                {
                    $unwind: "$products"
                },
                {
                    $match: { 'products._id': ObjectId(details.productId) }
                },
                {
                    $project: { 'products.reviews': 1, _id: 0 }
                }
            ]).toArray()
            // console.log(reviews[0].products.reviews);
            let review = reviews[0].products.reviews, avg = 0, sum = 0, count = 0
            // console.log(review[0].star);
            // console.log(parseInt(review[0].star));

            for (let i = 0; i < review.length; i++) {
                if (review[i].star) {
                    sum = sum + parseInt(review[i].star)
                    count += 1
                }
            }
            let a = sum / count
            // Math.round(avg*100)/100
            avg = a.toFixed(1)

            // console.log(sum, count, avg);
            await db.get().collection(collection.mainCollection).updateOne(
                { 'products._id': ObjectId(details.productId) },
                { $set: { 'products.$.rating': avg } }
            )

            resolve(true)
            // }else{
            //     resolve(false)
            // }


        })
    },
    search: (text) => {
        console.log(text);
        console.log(true);
        return new Promise(async (resolve, reject) => {
            // let result = await db.get().collection(collection.mainCollection).find({ 'products.brandName':{$regex:text}},{'products.brandName':1} ).toArray()

            // let x = { role: "seller", title: "" }
            // console.log(x);
            // let result = await db.get().collection(collection.mainCollection).find(x).toArray()
            // console.log(result);

            let result = await db.get().collection(collection.mainCollection).aggregate([


                {
                    $project: {
                        _id: 0,
                        products: {
                            $filter: {
                                input: '$products',
                                as: 'products',
                                cond: {
                                    $or: [
                                        {
                                            $regexMatch: {
                                                input: '$$products.brandName',
                                                regex: text,
                                                options: 'i'
                                            }
                                        },
                                        {
                                            $regexMatch: {
                                                input: '$$products.title',
                                                regex: text,
                                                options: 'i'
                                            }
                                        },
                                        {
                                            $regexMatch: {
                                                input: '$$products.category',
                                                regex: text,
                                                options: 'i'
                                            }
                                        }

                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $unwind: "$products"
                }
            ]).toArray()

            // let result = await db.get().collection(collection.mainCollection).aggregate([
            //     {
            //         $unwind: '$products'
            //     },
            //     {
            //         $unwind: '$products.keywords'
            //     },
            // {
            //     // $project: {   
            //         // result: {  
            //             $regexFindAll: {
            //                 input: '$role',
            //                 regex: 'se',

            //             } 
            //         }
            // }
            // }
            //     { $addFields: { returnObject: { $regexFindAll: { input: "$products.keywords", regex: text  } } } },
            //     {$project:{products:1,_id:0}}



            // ]).toArray()
            // console.log(result);
            resolve(result)
        })
    },
    filterProducts: (filter, gender, price, search) => {
        return new Promise(async (resolve, reject) => {
            // console.log(filter,gender,price,search);

            if (!search) {

                if (filter.length > 1) {
                    let result = await db.get().collection(collection.mainCollection).aggregate([
                        {
                            $unwind: '$products'
                        },
                        {
                            $match: { $or: filter }
                        },
                        {
                            $match: { 'products.gender': gender }
                        },
                        {
                            $match: { 'products.price': { $lt: price } }
                        }
                    ]).toArray()
                    // console.log(3984989489348934893489394394398493);
                    // console.log(result);
                    resolve(result)
                } else {
                    let result = await db.get().collection(collection.mainCollection)
                        // .find({ 'products.gender': gender }, { 'products.$': 1, _id: 0 }).toArray()
                        .aggregate([

                            {
                                $match: { 'products.gender': gender, 'products.isActive': true }
                            },

                            {
                                $unwind: '$products'
                            },

                            {
                                $project: { _id: 0, products: 1 }
                            },
                            {
                                $match: { 'products.price': { $lt: price } }
                            }


                        ]).toArray()
                    // console.log(result);
                    resolve(result)
                }
            } else {
                if (filter.length > 1) {
                    let result = await db.get().collection(collection.mainCollection).aggregate([
                        {
                            $project: {
                                _id: 0,
                                products: {
                                    $filter: {
                                        input: '$products',
                                        as: 'products',
                                        cond: {
                                            $or: [
                                                {
                                                    $regexMatch: {
                                                        input: '$$products.brandName',
                                                        regex: search,
                                                        options: 'i'
                                                    }
                                                },
                                                {
                                                    $regexMatch: {
                                                        input: '$$products.title',
                                                        regex: search,
                                                        options: 'i'
                                                    }
                                                },
                                                {
                                                    $regexMatch: {
                                                        input: '$$products.category',
                                                        regex: search,
                                                        options: 'i'
                                                    }
                                                }

                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        {
                            $unwind: '$products'
                        },
                        {
                            $match: { $or: filter }
                        },
                        // {
                        //     $match: { 'products.gender': gender }
                        // },
                        {
                            $match: { 'products.price': { $lt: price } }
                        }
                    ]).toArray()
                    // console.log(3984989489348934893489394394398493);
                    // console.log(result);
                    resolve(result)
                } else {
                    let result = await db.get().collection(collection.mainCollection)
                        // .find({ 'products.gender': gender }, { 'products.$': 1, _id: 0 }).toArray()
                        .aggregate([
                            {
                                $project: {
                                    _id: 0,
                                    products: {
                                        $filter: {
                                            input: '$products',
                                            as: 'products',
                                            cond: {
                                                $or: [
                                                    {
                                                        $regexMatch: {
                                                            input: '$$products.brandName',
                                                            regex: search,
                                                            options: 'i'
                                                        }
                                                    },
                                                    {
                                                        $regexMatch: {
                                                            input: '$$products.title',
                                                            regex: search,
                                                            options: 'i'
                                                        }
                                                    },
                                                    {
                                                        $regexMatch: {
                                                            input: '$$products.category',
                                                            regex: search,
                                                            options: 'i'
                                                        }
                                                    }

                                                ]
                                            }
                                        }
                                    }
                                }
                            },

                            {
                                $match: { 'products.isActive': true }
                            },

                            {
                                $unwind: '$products'
                            },

                            // {
                            //     $project: { _id: 0, products: 1 }
                            // },
                            {
                                $match: { 'products.price': { $lt: price } }
                            }


                        ]).toArray()
                    // console.log(result);
                    resolve(result)
                }
                // console.log(987365345678/98765789);
            }
        })
    },
    cancelOrder: (data) => {
        return new Promise(async (resolve, reject) => {
            let { productId, orderId, cartId, size, quantity } = data
            // console.log(true);
            // console.log(productId);
            await db.get().collection(collection.mainCollection).updateOne(
                { 'orders.products.cart_id': ObjectId(cartId) },
                {
                    $set: { 'orders.$.products.$[i].isCancelled': true }
                },
                {
                    arrayFilters: [{
                        'i.cart_id': ObjectId(cartId)
                    }]
                }
            )
            resolve()
        })
    },
    isAcustomer: (productId, userId) => {
        return new Promise(async (resolve, reject) => {
            let check = await db.get().collection(collection.mainCollection).aggregate([
                {
                    $match: { _id: ObjectId(userId) }
                },
                {
                    $unwind: '$orders'
                },
                {
                    $unwind: '$orders.products'
                },
                {
                    $project: { _id: 0, 'orders.products': 1 }
                },
                {
                    $match: { 'orders.products.productId': ObjectId(productId) }
                },


            ]).toArray()
            // console.log(check.length);
            if (check.length > 0) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    }
}