var express = require('express');
var router = express.Router();
const user = require('../middlewares/user_middlewares');



/* GET users listing. */
// router.get('/favicon.ico',(req,res)=>{
//     res.send("helloooooooooooooo")
// })

router.get('/', user.home);

router.get('/login', user.login)

router.get('/loginRequired',user.loginRequired)

router.post('/login', user.postLogin)

router.get('/signup', user.signup)

router.post('/signup', user.postSignup)

router.get('/verification',user.session, user.verification)

router.post('/verification',user.session, user.postVerification)      

router.get('/logout', user.logout)

router.get('/cart',user.session,user.cart)

router.post('/cart/add/:id',user.session,user.addToCart)

router.get('/product/details/:id' ,user.productDetails)

router.get('/cart/item/delete/:id',user.session, user.deleteFromCart)

router.get('/wishlist',user.session,user.wishlist)

router.post('/product/quantity/change',user.session,user.changeQuantity)

router.get('/wishlist/add/:id',user.session,user.addToWishlist)

router.get('/wishlist/item/delete/:id',user.session,user.deleteFromWishlist)

router.get('/searchGender/:gender',user.searchGender)

router.get('/products',user.showProducts)

router.get('/searchcategory/:category',user.searchCategory)

router.get('/checkout',user.session,user.checkout)
  
router.post('/placeOrder',user.session,user.placeOrder)

router.post('/varifyPayment',user.session,user.varifyPayment)

router.get('/orderSuccess',user.session,user.orderSuccess) 
  
router.get('/orders/view',user.session,user.getAllOrders)
  
router.get('/orders/details:id',user.session,user.orderDetails)

router.get('/account',user.session,user.userAccount)

router.post('/review',user.session,user.review)

router.post('/search/result/',user.searchResult)

router.post('/products/filter',user.filterProducts)

router.get('/products/sort:value',user.sortProducts)

router.get('/orders/cancel',user.session,user.cancelOrder)

router.get('/search',user.showSearchProducts)

module.exports = router;
