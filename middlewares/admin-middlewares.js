const express = require('express');
const res = require('express/lib/response');
const { Db } = require('mongodb');
const { response } = require('../app');
const adminHelpers = require('../helpers/admin-helpers');
const router = express.Router();
const sellerHelpers = require('../helpers/seller-helpers')


module.exports = {
    session: (req, res, next) => {
        if (req.session.admin) {
            next()
        } else {
            res.redirect('/admin/login')
        }
    },
    home: function (req, res, next) {
        // if (req.session.admin) {
        res.redirect('/admin/dashboard')
        // }
        // res.redirect('admin/login')


    },
    login: (req, res) => {
        if (req.session.admin) {
            res.redirect('/admin/dashboard')
        } else {
            res.render('admin/login', { admin: req.session.admin, loginErr: req.session.loginErr, login: true })
            req.session.loginErr = false
        }
    },
    postLogin: (req, res) => {
        adminHelpers.doLogin(req.body).then((response) => {
            // console.log(response);
            if (response) {
                req.session.admin = true
                res.redirect('/admin/dashboard')
            } else {
                req.session.loginErr = true
                res.redirect('/admin/login')
            }
        })
    },
    dashboard: async (req, res) => {
        // if (req.session.admin) {
        let admin = await adminHelpers.adminDetails()
        let revenue=await adminHelpers.totalRevenue()
        let response=await adminHelpers.redeemRequests()
        res.render('admin/dashboard', { admin, admin: true ,revenue,count:response.count})
        // } else {
        // res.redirect('/admin/login')


    },
    viewUsers: (req, res) => {
        // if (req.session.admin) {
        adminHelpers.viewUsers().then((users) => {
            res.render('admin/users', { admin: req.session.admin, users })
        })
        // }else
        // res.redirect('/admin/login')


    },
    logout: (req, res) => {
        req.session.admin = false
        res.redirect('/admin/login')
    },
    viewSellers: (req, res) => {

        adminHelpers.viewSellers().then((sellers) => {
            res.render('admin/sellers', { admin: req.session.admin, sellers })
        })

    },
    deleteUser: (req, res) => {
        adminHelpers.deleteUser(req.query.id).then((response) => {
            req.session.user = false
            res.redirect('/admin/users')
        })
    },
    deleteSeller: (req, res) => {
        adminHelpers.deleteSeller(req.query.id).then((response) => {
            req.session.seller = false
            res.redirect('/admin/sellers')
        })
    },
    blockUser: (req, res) => {
        adminHelpers.blockUser(req.query.id).then((response) => {
            req.session.user = false
            res.redirect('/admin/users')
        })
    },
    unblockUser: (req, res) => {
        adminHelpers.unBlockUser(req.query.id).then((response) => {
            res.redirect('/admin/users')
        })
    },
    blockSeller: (req, res) => {
        adminHelpers.blockSeller(req.query.id).then((response) => {
            res.redirect('/admin/sellers')
        })
    },
    unblockSeller: (req, res) => {
        adminHelpers.unblockSeller(req.query.id).then((response) => {
            res.redirect('/admin/sellers')
        })
    },
    sellerDetails: (req, res) => {
        //   console.log(req.params.id);
        sellerHelpers.products(req.params.id).then((sellerDetails) => {
            // console.log(sellerDetails);
            res.render('admin/sellerDetails', { admin: true, sellerDetails })
        })
    },
    viewSellerProductDetails: (req, res) => {
        sellerHelpers.viewProduct(req.params.id).then((product) => {
            res.render('sellers/viewProduct', { admin: true, product })
        })
    },
    requests: (req, res) => {
        adminHelpers.viewRequests().then((requests) => {
            console.log(requests);
            res.render('admin/requests', { admin: true, requests })

        })
    },
    acceptSeller: (req, res) => {
        //    console.log(req.query.id);
        adminHelpers.acceptSeller(req.query.id).then(() => {
            res.redirect('/admin/seller/requests')
        })
    },
    rejectSeller: (req, res) => {
        //    console.log(req.query.id);
        adminHelpers.rejectSeller(req.query.id).then(() => {
            res.redirect('/admin/seller/requests')
        })
    },
    rejectedList: (req, res) => {
        adminHelpers.rejectedList().then((list) => {
            res.render('admin/rejectedSellersList', { admin: true, list })
        })
    },
    redeemRequests: async (req, res) => {
        let response = await adminHelpers.redeemRequests()
        res.render('admin/redeemRequests', { admin: true, redeemRequests:response.redeemRequests ,count:response.count })

    },
    sellerPayment: (req, res) => {
        adminHelpers.sellerPayment(req.query.id, req.query.amount, req.query.requestId).then(() => {
            res.redirect('/admin/redeemRequests')
        })
    }


}