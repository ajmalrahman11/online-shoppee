var express = require('express');
const session = require('express-session');
const res = require('express/lib/response');
const router = express.Router();
const sellerhelpers = require('../helpers/seller-helpers')
const seller = require('../middlewares/seller-middlewares')


/* GET home page. */
router.get('/',seller.session, seller.landingPage);

router.get('/signup', seller.signup)

router.post('/signup', seller.postSignup)

router.get('/login', seller.login)

router.post('/login', seller.postLogin)

router.get('/dashboard',seller.session, seller.dashboard)

router.get('/logout', seller.logout)

router.get('/product/add',seller.session,seller.isApproved,seller.addProduct)

router.post('/product/add',seller.session,seller.postAddProduct)

router.get('/upload/image', seller.isApproved, seller.uploadImage)

router.post('/upload/image',seller.session,seller.postUploadImage)

router.get('/product/Description/add' , seller.isApproved,seller.addProductDescription)

router.post('/product/description/add',seller.session,seller.postAddProductDescription)

router.get('/product/added',seller.session, seller.isApproved,seller.productAdded)

router.get('/products', seller.isApproved,seller.session,seller.products)

router.get('/product/view',seller.session, seller.isApproved,seller.viewProduct)

router.get('/product/edit',seller.session, seller.isApproved,seller.editProduct)

router.post('/product/edit/:id',seller.session,seller.postEditProduct)

router.get('/product/enable/:id',seller.session,seller.productEnable)

router.get('/product/disable/:id',seller.session,seller.disableProduct)

router.get('/redeem',seller.session,seller.redeemRequest)

router.get('/orders',seller.session,seller.orders)

router.get('/orders/ship',seller.session,seller.ship)

router.get('/orders/deliver',seller.session,seller.deliverProduct)

router.get('/account',seller.session,seller.account)

router.get('/history/payment',seller.session,seller.paymentHistory)

module.exports = router;
  