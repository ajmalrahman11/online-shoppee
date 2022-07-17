const { reject } = require('bcrypt/promises');
const express = require('express');
const session = require('express-session');
const res = require('express/lib/response');
const { render, response } = require('../app');
const router = express.Router();
const sellerhelpers = require('../helpers/seller-helpers')
const seller = require('../middlewares/seller-middlewares')

// var mv = require('mv');
let productDetails


module.exports = {
    session: (req, res, next) => {
        if (req.session.seller) {
            next()
        } else {
            res.redirect('/sellers/login')
        }
    },
    isApproved: (req, res, next) => {
        if (req.session.seller.status == "pending") {
            res.render('sellers/messages/underVerification', { seller: true })
        } else {
            console.log(req.session.seller);
            next()    
        }
    },
    landingPage: function (req, res, next) {
        //   res.render('index', { title: 'Express' });
        res.redirect('/sellers/login')
    },
    signup: (req, res) => {
        res.render('sellers/signup', { sellerExists: req.session.sellerExists, login: true })
        req.session.sellerExists = false
    },
    postSignup: (req, res) => {
        // console.log(req.body);
        sellerhelpers.doSignup(req.body).then((response) => {
            // console.log(response);
            res.redirect('/sellers/login')
        }).catch(() => {
            req.session.sellerExists = true
            res.redirect('/sellers/signup')
        })
    },
    login: (req, res) => {
        if (req.session.seller) {
            res.redirect('/sellers/dashboard')
        } else {
            res.render('sellers/login', { loginErr: req.session.loginErr, blocked: req.session.isSellerBlocked, login: true })
            req.session.loginErr = false
        }
    },
    postLogin: (req, res) => {
        sellerhelpers.doLogin(req.body).then((response) => {
            // console.log(response);
            if (response) {
                if (response.isActive) {
                    req.session.seller = response
                    req.session.sellerid = response._id
                    req.session.isSellerBlocked = false
                    res.redirect('/sellers/dashboard')
                } else {
                    req.session.isSellerBlocked = true
                    res.redirect('/sellers/login')
                }

            } else {
                req.session.loginErr = true
                res.redirect('/sellers/login')
            }
        })
    },
    dashboard: async (req, res) => {
        let revenue = await sellerhelpers.revenue(req.session.seller._id)
        let seller = await sellerhelpers.sellerDetails(req.session.seller._id)
        revenue.balance = seller.totalEarnings - seller.claimed
        let response=await sellerhelpers.DateValues(req.session.seller._id)
        // console.log(response);
        res.render('sellers/dashboard', { seller:req.session.seller, revenue, seller ,response})
    },
    logout: (req, res) => {
        req.session.seller = null
        res.redirect('/sellers/login')
    },
    addProduct: (req, res) => {

        res.render('sellers/addProduct', { seller:req.session.seller })
    },
    postAddProduct: (req, res) => {
        // console.log(req.body);
        sellerhelpers.productObject(req.body).then((product) => {

            req.session.productId = product._id
            productDetails = product
            console.log(true);
            // res.send("ok")
            res.redirect('/sellers/upload/image')
        })
    },
    uploadImage: (req, res) => {
        // console.log(productDetails);

        res.render('sellers/uploadImage', { seller:req.session.seller })
    },
    postUploadImage: (req, res) => {
        // console.log(req.files);
        let id = req.session.productId
        // console.log(id+"id");
        // console.log(req.files.image1);
        if (req.files) {
            if (req.files.image1)
                upload(req.files.image1, 1)

            if (req.files.image2)
                upload(req.files.image2, 2)

            if (req.files.image3)
                upload(req.files.image3, 3)

            if (req.files.image4)
                upload(req.files.image4, 4)

            if (req.files.image5)
                upload(req.files.image5, 5)

            if (req.files.image6)
                upload(req.files.image6, 6)

        }
        function upload(image, n, callback) {
            image.mv('./public/product-images/' + id + '(' + n + ').jpg')
            if (callback) {
                callback()
            }
        }
        res.redirect('/sellers/product/Description/add')
    },
    addProductDescription: (req, res) => {
        res.render('sellers/addProductDescription', { seller:req.session.seller })
    },

    products: (req, res) => {
        sellerhelpers.products(req.session.sellerid).then((seller) => {
            // console.log(seller);
            res.render('sellers/products', { seller:req.session.seller, products: seller.products })
        })

    },

    postAddProductDescription: (req, res) => {
        let string = req.body.tags
        let tags = string.split(',')
        console.log(req.body);
        productDetails.description = req.body.description
        productDetails.tags = tags
        productDetails.keywords = tags
        // +productDetails.brandName+productDetails.title
        productDetails.tags.push(productDetails.title)
        productDetails.tags.push(productDetails.brandName)
        // console.log(productDetails);
        sellerhelpers.addProducts(productDetails, req.session.sellerid).then(() => {
            res.redirect('/sellers/product/added')
        })
    },
    viewProduct: (req, res) => {
        sellerhelpers.viewProduct(req.query.id).then((product) => {
            // console.log(product);

            res.render('sellers/viewProduct', { seller:req.session.seller, product })

        })
    },
    editProduct: (req, res) => {
        sellerhelpers.viewProduct(req.query.id).then((product) => {
            res.render('sellers/editProduct', { seller:req.session.seller, product })

        })
    },
    productAdded: (req, res) => {
        res.render('sellers/productAdded', { seller: true })
    },
    postEditProduct: (req, res) => {

        let id = req.session.sellerid

        sellerhelpers.productObject(req.body).then((product) => {


            sellerhelpers.updateProduct(req.body, req.params.id).then(() => {
                // res.redirect('/sellers/products')
                sellerhelpers.updateImage(req.files, req.params.id).then((response) => {
                    // console.log(response);
                    res.render('sellers/messages/product-edited', { seller:req.session.seller })
                    // res.send("edited")
                })

            })
        })
    },
    productEnable: (req, res) => {
        // console.log(req.params.id);
        sellerhelpers.productEnable(req.params.id).then(() => {
            res.redirect('/sellers/products')
        })
    },
    disableProduct: (req, res) => {
        sellerhelpers.disableProduct(req.params.id).then(() => {
            res.redirect('/sellers/products')
        })
    },
    redeemRequest: (req, res) => {
        const { sellerId, balance } = req.query
        sellerName = req.session.seller.username
        sellerhelpers.redeemRequest(sellerId, balance, sellerName).then(() => {
            res.redirect('/sellers/dashboard')
        })

    },
    orders: async (req, res) => {
        let orders = await sellerhelpers.orders(req.session.seller._id)
        res.render('sellers/orders', { orders, seller:req.session.seller })
    },
    ship: async (req, res) => {
        // console.log(req.query.id);  
        await sellerhelpers.shipProduct(req.query.id)
        res.redirect('/sellers/orders')
    },
    deliverProduct: async (req, res) => {
        await sellerhelpers.deliverProduct(req.query.id)
        res.redirect('/sellers/orders')
    },
    account: async (req, res) => {
        let seller = await sellerhelpers.sellerDetails(req.session.seller._id)
        res.render('sellers/profile', { seller })
    },
    paymentHistory: async (req, res) => {
        let history = await sellerhelpers.paymentHistory(req.session.seller._id)
        res.render('sellers/paymentHistory',{history:history[0],seller:req.session.seller})
    }
}         