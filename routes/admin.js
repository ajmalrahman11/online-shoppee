const express = require('express');
const res = require('express/lib/response');
const { Db } = require('mongodb');
const adminHelpers = require('../helpers/admin-helpers');
const router = express.Router();
const admin=require('../middlewares/admin-middlewares')


/* GET home page. */
router.get('/',admin.session,admin.home );

router.get('/login',admin.login)

router.post('/login',admin.postLogin)

router.get('/dashboard',admin.session,admin.dashboard)

router.get('/users',admin.session,admin.viewUsers)

router.get('/logout',admin.logout)

router.get('/sellers',admin.session ,admin.viewSellers)

router.get('/user/delete',admin.deleteUser)

router.get('/block-user',admin.blockUser)

router.get('/unblock-user',admin.unblockUser)

router.get('/delete-seller',admin.deleteSeller)

router.get('/seller/block',admin.blockSeller)

router.get('/seller/unblock',admin.unblockSeller)

router.get('/seller/Details/view/:id',admin.session,admin.sellerDetails)

router.get('/seller/product/view/:id',admin.session,admin.viewSellerProductDetails)

router.get('/seller/requests',admin.requests)

router.get('/seller/accept',admin.acceptSeller)

router.get('/seller/reject',admin.rejectSeller)

router.get('/sellers/rejected/list',admin.rejectedList)

router.get('/redeemRequests',admin.redeemRequests)

router.get('/seller/payment',admin.sellerPayment)







module.exports = router;
