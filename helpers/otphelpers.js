// var db = require('../config/connection')
const { reject } = require('bcrypt/promises');
// const config = require('../config/api');
const accountSID=process.env.TWILIO_ACCOUNT_SID
const serviceID=process.env.TWILIO_SERVICE_ID
const authToken=process.env.TWILIO_AUTH_TOKEN
const client = require('twilio')(accountSID, authToken)



module.exports = {
    // verifyotp: 
    // (ph_number,otp) => {
    //     return new Promise(async(resolve, reject) => {
    //         // await client.verify.services(config.serviceID)
    //         await client.verify.services('VA4116d14beefbf8083b8bde066fdd00ec')
    //             .verificationChecks
    //             // .create({ to: `+91${ph_number}`, code: otp })
    //             .create({ to:  '+919544827575', code: otp })
    //             .then((verification_check) => resolve(verification_check));
    //     }).catch(()=>{
    //         reject()
    //     })
    // }
    // verifyotp:(otp,phone_number)=>{
    //     return new Promise(async(resolve,reject)=>{
    //         // console.log(phone_number);
    //        await client.verify
    //        .services("VA4116d14beefbf8083b8bde066fdd00ec")
    //        .verificationChecks.create({
    //            to:`+91${phone_number}`,
    //            code:otp,
    //        }).then((verification_check)=>{
    //            resolve(verification_check)
    //        })
    //     })
    // }

}