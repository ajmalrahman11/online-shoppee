// const { response } = require("../../app")

function deleteProduct(cart_id) {
    $.ajax({
        url: '/cart/item/delete/' + cart_id,
        method: 'get',
        success: (response) => {
            if (response) {
                location.reload()
            }
        }
    })
}

function addToCart() {
    // let product_id=document.getElementById('product_id')
    // let size=document.getElementsByName('size')
    // let brandName=document.getElementById('brandName')
    // let title=document.getElementById('title')

    // console.log(product_id)
    let product_id = $("#product_box").val
    let brandName = $("brandName").val
    let title = $("title").val
    // console.log(title)
    $.ajax({
        url: '/cart/add',
        method: 'post',
        data: {
            "id": product_id,
            'size': size,
            'brandName': brandName,
            'title': title
        },
        success: (response) => {
            // console.log('got response')
        }
    })
}

function changeQuantity(id, cartId, size, quantity, count) {
    $.ajax({
        url: '/product/quantity/change',
        data: {
            productId: id,
            cartId: cartId,
            size: size,
            count: count,
        },
        method: 'post',
        success: (response) => {
            if (response) {
                window.location.reload()
                // $( cartId ).load(window.location.href + cartId );

            }
        }
    })
}


function deleteFromWishlist(w_id) {
    $.ajax({
        url: '/wishlist/item/delete/' + w_id,
        method: 'get',
        success: (response) => {
            if (response) {
                location.reload()
            }
        }
    })
}

function addToWishlist(product_id) {
    console.log(product_id)
    $.ajax({
        url: '/wishlist/add/' + product_id,
        method: 'get',
        success: (response) => {
            if (response) {
                window.location.reload()
            }
        }
    })
}



$("#checkoutForm").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/placeOrder',
        method: "post",
        data: $('#checkoutForm').serialize(),
        success: (response) => {
            // alert("Success")
            if (response.codSuccess) {

                location.href = '/orderSuccess'
            } else {
                razorpayPayment(response)
            }
        }
    })

})

function razorpayPayment(order) {
    var options = {
        "key": process.env.RAZORPAY_ID, // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Acme Corp",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            alert(response.razorpay_payment_id);
            alert(response.razorpay_order_id);
            alert(response.razorpay_signature)
            varifyPayment(response, order)
        },
        "prefill": {
            "name": "Gaurav Kumar",
            "email": "gaurav.kumar@example.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.open();
}
function varifyPayment(payment, order) {
    $.ajax({
        url: '/varifyPayment',
        data: {
            payment,
            order
        },
        method: "post",
        success: (response) => {
            console.log("success")
            if (response) {
                location.href = '/orderSuccess'
            } else {
                alert("Payment Failed")
            }
        }
    })
}

$("#submitReviews").submit((e) => {
    // $('#submitReviews').on('click', function(e) {
    // var star = $(".star").val();
    // console.log(star)
    // if ($(star).val() == '') {
        // e.preventDefa     ult()
        // alert("Not a valid character")
    // }

    // let subject=$('#subject').val();
    // let review=$('#review').val();
    // let productId=$('#productId').val();
    // alert(productId)
    $.ajax({
        url: '/review',
        method: "post",
        data: $('#submitReviews').serialize(),
        // data : {
        //     subject:subject,
        //     review:review,
        //     productId:productId
        // },
        success: (response) => {

            if (response) {

                alert("Review Added Successfully")

                // location.href='/productDetails'+productId
                window.location.reload()
            } else {
            }
        }
    })

})

// $('#brands').on('change',() => {
//     // e.preventDefault()
//     $.ajax({
//         url: '/products/filter',
//         method: "post",
//         data: $('#brandFilter').serialize(),
//         success: (isResult) => {
//             if (isResult) {
//                 // window.location.reload()
//                 // $('#products').load('/products/filter');
//                 $('#products').load(location.href + " #products");
//             }
//         }
//     })
// })



$('input[name=brandName]').change(function() {
  
    $.ajax({
        url: '/products/filter',  
        method: "post",
        data: $('#brandFilter').serialize(),
        success: (isResult) => {
            if (isResult) {
                // window.location.reload()
                // $('#products').load('/products/filter');
                $('#products').load(location.href + " #products");
            }
        }
    })

  });



$('#sortMenu').on('change', function () {
    // alert( this.value );
    $.ajax({
        url: '/products/filter',  
        method: "post",
        data: $('#brandFilter').serialize(),
        success: (isResult) => {
            if (isResult) {
                // window.location.reload()
                // $('#products').load('/products/filter');
                $('#products').load(location.href + " #products");
            }
        }
    })
});


$('input[name=price]').change(function() {
    $.ajax({
        url: '/products/filter',  
        method: "post",
        data: $('#brandFilter').serialize(),
        success: (isResult) => {
            if (isResult) {
                // window.location.reload()
                // $('#products').load('/products/filter');
                $('#products').load(location.href + " #products");
            }
        }
    })
 })

// Search 

$('input[name=SbrandName]').change(function() {
  
    $.ajax({
        url: '/search/result/',  
        method: "post",
        data: $('#searchForm').serialize(),
        success: (isResult) => {
            if (isResult) {
                // window.location.reload()
                // $('#products').load('/products/filter');
                $('#products').load(location.href + " #products");
            }
        }
    })

  });



$('#SsortMenu').on('change', function () {
    // alert( this.value );
    $.ajax({
        url: '/search/result/',  
        method: "post",
        data: $('#searchForm').serialize(),
        success: (isResult) => {
            if (isResult) {
                // window.location.reload()
                // $('#products').load('/products/filter');
                $('#products').load(location.href + " #products");
            }
        }
    })
});


$('input[name=Sprice]').change(function() {
    $.ajax({
        url: '/search/result/',  
        method: "post",
        data: $('#searchForm').serialize(),
        success: (isResult) => {
            if (isResult) {
                // alert("jsakdjs")
                // window.location.reload()
                // $('#products').load('/products/filter');
                $('#products').load(location.href + " #products");
            }
        }
    })
 })

//  -----search----

// cancel Order
function cancelOrder(productId,orderId,cartId,size,quantity){
    // alert("ksksk")
    $.ajax({
        url:'/orders/cancel',
        method:'get',
        data:{
            productId,
            orderId,
            cartId,
            size,
            quantity
        },
        success:()=>{

        }
    })
}
 
