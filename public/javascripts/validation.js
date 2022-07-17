 

$(document).ready(function(){
    $("#userSignup").validate({
        rules:
        {
            username:{
                required:true,
                minlength:4,
                maxlength:20
            },
            email:{
                required:true,
                email:true
            },
            password:{
                required:true,
                minlength:5
            },
            ph_number:{
                required:true,
                minlength:10,
                maxlength:10,
                number:true
            },
            cpassword:{
                required:true,
                equalTo:'#password'
            }

        }
    })
})

$(document).ready(function(){
    $("#sellerSignup").validate({
        rules:
        {
            username:{
                required:true,
                minlength:4,
                maxlength:20
            },
            email:{
                required:true,
                email:true
            },
            password:{
                required:true,
                minlength:5
            },
            ph_number:{
                required:true,
                minlength:10,
                maxlength:10,
                number:true
            },
            cpassword:{
                required:true,
                equalTo:'#password'
            }

        }
    })
})

$(document).ready(function(){
    $("#submitReviews").validate({
        rules:
        {
            star:{
                required:true
            }

        }
    })
})