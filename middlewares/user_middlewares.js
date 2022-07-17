const express = require('express');
const { redirect } = require('express/lib/response');
const cli = require('nodemon/lib/cli');
var router = express.Router();
const userhelpers = require('../helpers/user-helpers')
// require('dotenv').config();
// const fast2sms = require('fast-two-sms')
// const config = require('../config/api');
const { response } = require('../app');
const otphelpers = require('../helpers/otphelpers');
const sellerHelpers = require('../helpers/seller-helpers');
// const client = require('twilio')(config.accountSID, config.authToken)
const accountSID=process.env.TWILIO_ACCOUNT_SID
const serviceID=process.env.TWILIO_SERVICE_ID
const authToken=process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSID, authToken)
let filterResult, cartDetails, orderid, gender, SearchResult, searchKeyword


const Razorpay = require('razorpay');
const { use } = require('../routes/users');

var instance = new Razorpay({
  key_id:   process.env.RAZORPAY_ID,
  key_secret:  process.env.RAZORPAY_KEY,
});



module.exports = {
  session: (req, res, next) => {
    if (req.session.user) {
      next()
    } else {
      res.redirect('/loginRequired')
    }
  },
  home: function (req, res, next) {
    userhelpers.getAllProducts().then((products) => {
      // console.log(true);
      // console.log(products);
      for (let i in products) {
        if (products[i].products.discount) {
          products[i].products.discountPrice = products[i].products.price - (products[i].products.discount * products[i].products.price / 100)
        } else {
          products[i].products.discountPrice = products[i].products.price
          products[i].products.discount = null
        }
      }
      res.render('index', { user: req.session.user, products })
    })
  },

  login: (req, res) => {

    if (req.session.user) {
      res.redirect('/')
    } else {
      // console.log(req.session.loginErr);
      // var user = req.session.user
      res.render('users/login', { user: req.session.user, loginErr: req.session.loginErr, blocked: req.session.blocked })
      req.session.loginErr = false
    }
  },
  postLogin: (req, res) => {
    // console.log(test1);


    // console.log(req.body);

    // for (let i in req.body){

    // }
    // console.log(true);
    // console.log(iterator);


    userhelpers.doLogin(req.body).then((response) => {
      // console.log(response);
      // console.log(response);
      if (response) {
        if (response.isActive) {
          req.session.user = response
          req.session.blocked = false
          res.redirect('/')
        } else {
          req.session.blocked = true
          res.redirect('/login')
        }
        // console.log("true"+response);

      } else {
        // console.log("false"+response);
        req.session.loginErr = true
        res.redirect('/login')
      }

    })
  },

  loginRequired:(req,res)=>{
    res.render('users/messages/loginRequired',{})
  },
  signup: (req, res) => {

    res.render('users/signup', { userExists: req.session.userExists })
    req.session.userExists = false
  },
  postSignup: async (req, res) => {
    console.log(req.body);
    req.session.userData=req.body
    req.session.ph_number = req.body.ph_number
    console.log(req.session.ph_number);
    // await client.verify.services(serviceID)
    //   .verifications
    //   .create({ to:`+91${req.session.ph_number}` , channel: 'sms' })
    //   .then(verification => console.log(verification.sid));
    // let verified=false
    let verified=true
    userhelpers.doSignup(req.body,verified).then((response) => {
      //  console.log(response);
      // res.redirect('/verification')
      res.redirect('/login')
      // res.redirect('/login')
    }).catch(() => {
      req.session.userExists = true
      res.redirect('/signup')
    })
  },
  verification: (req, res) => {


    res.render('users/varification', { user: req.session.user })
  },
  postVerification: async (req, res) => {
    console.log(req.body);
    let otp = req.body.otp
    await client.verify.services(serviceID)
      .verificationChecks
      .create({ to: `+91${req.session.ph_number}`, code: otp })
      .then((verificationChecks) => {
        console.log(verificationChecks.status)
        if (verificationChecks.status == 'approved') {
          let verified=true
          userhelpers.doSignup(req.body,verified)
          res.redirect('/login')
        } else {
          res.redirect('/signup')
        }
      });
  },
  logout: (req, res) => {
    req.session.user = null
    res.redirect('/login')
  },
  cart: (req, res) => {
    // console.log(true);
    // console.log(req.session.user._id);

    userhelpers.viewUser(req.session.user._id).then((userDetails) => {
      // console.log(userDetails);
      userhelpers.getTotal(req.session.user._id).then((cart) => {
        // console.log(cart);
        // console.log(total,count);
        cartDetails = cart
        res.render('users/cart', { cart: userDetails.cart, user: req.session.user, cart })
      })
    })
  },
  addToCart: (req, res) => {
    // console.log(req.session.user._id);
    // console.log(8765434567898765);
    // console.log(req.params.id);
    req.body.count = 1
    userhelpers.addToCart(req.body, req.session.user._id, req.params.id).then((response) => {
      res.redirect('/product/details/' + req.body.id)

    })
  },
  productDetails: (req, res) => {
    // console.log(req.params.id);
    sellerHelpers.viewProduct(req.params.id).then((product) => {
      if (req.session.useer) {
        userhelpers.isAcustomer(req.params.id, req.session.user._id).then((isAcustomer) => {
          console.log(isAcustomer);
          res.render('users/productDetails', { user: req.session.user, product, user: req.session.user, isAcustomer })
        })
      } else {
        res.render('users/productDetails', { user: req.session.user, product, user: req.session.user })
      }
      // console.log(product);

    })
  },
  deleteFromCart: (req, res) => {

    // console.log(req.params.id);
    userhelpers.deleteFromCart(req.params.id).then(() => {
      // res.redirect('/cart')
      res.json({ status: true })
    })

  },
  changeQuantity: (req, res) => {
    // console.log(req.body);
    userhelpers.changeQuantity(req.body, req.session.user._id).then((response) => {
      // console.log(response);
      res.json({ status: true })
    })
  },
  wishlist: (req, res) => {
    userhelpers.viewUser(req.session.user._id).then((userDetails) => {
      res.render('users/wishlist', { wishlist: userDetails.wishlist, user: req.session.user })
    })
  },
  addToWishlist: (req, res) => {
    userhelpers.addToWishlist(req.params.id, req.session.user._id).then((response) => {
      // res.redirect('/')
      res.json({ status: true })

    })
  },
  deleteFromWishlist: (req, res) => {
    userhelpers.deleteFromWishlist(req.params.id).then(() => {
      res.json({ status: true })
    })
  },

  searchGender: (req, res) => {
    //  console.log(req.params.gender);
    userhelpers.searchGender(req.params.gender).then((result) => {
      filterResult = result
      gender = req.params.gender
      res.redirect('/products')
    })
  },
  showProducts: (req, res) => {
    // console.log(true);  
    // console.log(req.body);
    userhelpers.getAllBrands(gender).then((response) => {
      // console.log(response);
      // console.log(filterResult);
      for (let i in filterResult) {
        if (filterResult[i].products.discount) {
          filterResult[i].products.discountPrice = filterResult[i].products.price - (filterResult[i].products.discount * filterResult[i].products.price / 100)
        } else {
          filterResult[i].products.discountPrice = filterResult[i].products.price
          filterResult[i].products.discount = null
        }
      }


      res.render('users/show', { products: filterResult, user: req.session.user, response })

    })

  },
  searchCategory: (req, res) => {
    // console.log(req.params.category);
    userhelpers.searchCategory(req.params.category).then((result) => {
      filterResult = result
      res.redirect('/products')
    })
  },
  checkout: (req, res) => {
    // console.log(cartDetails);
    res.render('users/checkout', { cartDetails, user: req.session.user })
  },
  placeOrder: (req, res) => {
    // console.log(req.session.user._id);
    // console.log("called")
    // req.body.paymentMethod="cashOnDelivery"
    userhelpers.placeOrder(req.body, req.session.user, cartDetails).then((orderId) => {
      orderid = orderId
      // console.log(orderId);
      if (req.body['paymentMethod'] === 'cashOnDelivery') {
        res.json({ codSuccess: true })
      } else {
        // console.log(true);
        // console.log(cartDetails);
        // console.log(orderId);
        userhelpers.generateRazorpay(orderId, cartDetails).then((response) => {
          res.json(response)
        })
      }
    })

    // res.send("success")
  },
  varifyPayment: (req, res) => {
    //  console.log(req.body);
    userhelpers.varifyPayment(req.body).then(() => {
      userhelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
        res.json({ status: true })
      })
    }).catch((err) => {
      res.json({ status: false, errMsg })
    })

  },
  orderSuccess: (req, res) => {
    userhelpers.getOrderDetails(orderid).then((orderDetails) => {
      // console.log(true);
      // console.log(orderDetails);
      res.render('users/messages/order-success', { user: req.session.user, orderDetails: orderDetails.orders })
    })
  },
  getAllOrders: (req, res) => {
    userhelpers.getAllOrders(req.session.user._id).then((orders) => {
      // console.log(orders[0].orders);
      res.render('users/viewOrders', { orders })
    })
  },
  orderDetails: (req, res) => {
    // console.log(req.params.id);
    userhelpers.getOrderDetails(req.params.id).then((order) => {
      // console.log(order);
      if (order.orders.status == 'cancelled') {
        var isCancelled = true
      }
      for (let i of order.orders.products) {
        // console.log(i);
        i.orderId = order.orders._id
      }
      // console.log(order.orders.products);
      res.render('users/orderDetails', { orderDetails: order.orders, isCancelled, user: req.session.user })
    })
  },
  userAccount: (req, res) => {

    res.render('users/userProfile', { user: req.session.user })
  },
  review: (req, res) => {
    req.body.userId = req.session.user._id
    req.body.userName = req.session.user.username
    console.log(req.body);
    userhelpers.addProductReview(req.body).then(() => {
      res.json({ status: true })
    })

  },
  showSearchProducts: (req, res) => {
    userhelpers.getAllBrands(gender).then((response) => {
      for (let i in SearchResult) {
        if (SearchResult[i].products.discount) {
          SearchResult[i].products.discountPrice = SearchResult[i].products.price - (SearchResult[i].products.discount * SearchResult[i].products.price / 100)
        } else {
          SearchResult[i].products.discountPrice = SearchResult[i].products.price
          SearchResult[i].products.discount = null
        }
      }
      res.render('users/searchResult', { products: SearchResult, user: req.session.user, response })
    })
  },
  searchResult: (req, res) => {
    // console.log(false);
    // console.log(req.body);
    if (req.body.search) {
      searchKeyword = req.body.search
      userhelpers.search(searchKeyword).then((result) => {
        SearchResult = result
        res.redirect('/search')
      })
    } else {
      // console.log(874837877343834);
      // console.log(req.body);
      let a = req.body
      let price = parseInt(a.Sprice)
      let filter = []
      for (let i of a.SbrandName) {
        filter.push({ 'products.brandName': i })
      }
      // console.log(searchKeyword);
      userhelpers.filterProducts(filter, gender, price, searchKeyword).then((response) => {
        // console.log(response);
        SearchResult = response

        // console.log(filterResult);
        if (req.body.sort == "Sort") {
          res.json({ status: true })
        }
        if (req.body.sort == 'rating') {
          SearchResult.sort((a, b) => {
            return b.products.rating - a.products.rating
          })
          res.json({ status: true })
        }
        if (req.body.sort == 'lh') {
          SearchResult.sort((a, b) => {
            return a.products.price - b.products.price
          })
          res.json({ status: true })
        }
        if (req.body.sort == 'hl') {
          SearchResult.sort((a, b) => {
            return b.products.price - a.products.price
          })
          res.json({ status: true })
        }
      })
    }


  },


  filterProducts: (req, res) => {

    // console.log(req.body.sort);

    let a = req.body
    let price = parseInt(a.price)
    let filter = []
    for (let i of a.brandName) {
      filter.push({ 'products.brandName': i })
    }
    userhelpers.filterProducts(filter, gender, price).then((response) => {
      // console.log(response);
      filterResult = response

      // console.log(filterResult);
      if (req.body.sort == "Sort") {
        res.json({ status: true })
      }
      if (req.body.sort == 'rating') {
        filterResult.sort((a, b) => {
          return b.products.rating - a.products.rating
        })
        res.json({ status: true })
      }
      if (req.body.sort == 'lh') {
        filterResult.sort((a, b) => {
          return a.products.price - b.products.price
        })
        res.json({ status: true })
      }
      if (req.body.sort == 'hl') {
        filterResult.sort((a, b) => {
          return b.products.price - a.products.price
        })
        res.json({ status: true })
      }
    })



  },
  sortProducts: (req, res) => {
    // console.log(req.params.value);
    if (req.params.value == 'rating') {
      filterResult.sort((a, b) => {
        return b.products.rating - a.products.rating
      })
      res.json({ status: true })
    }
    if (req.params.value == 'lh') {
      filterResult.sort((a, b) => {
        return a.products.price - b.products.price
      })
      res.json({ status: true })
    }
    if (req.params.value == 'hl') {
      filterResult.sort((a, b) => {
        return b.products.price - a.products.price
      })
      res.json({ status: true })
    }
  },
  cancelOrder: (req, res) => {
    //  console.log(req.query);
    //  let {productId,orderId,cartId,size,quantity}=req.query
    userhelpers.cancelOrder(req.query).then(() => {
      // res.redirect('/orders/details' + req.params.id)
    })
  }

}   