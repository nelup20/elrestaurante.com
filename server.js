var express = require("express"),
    path = require("path"),
    app = express(),
    bodyParser = require("body-parser"),
    nodemailer = require("nodemailer"),
    paypal = require("paypal-rest-sdk"); 

app.set("view engine", "html");
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': '',
    'client_secret': ''
  });

app.get("/", function(req, res){
    res.sendFile("/index.html");
});

app.get("/shop", function(req, res){
    res.sendFile(path.join(__dirname, 'public/shop.html'));
});

app.post("/buy", function(req, res){

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/shop",
            "cancel_url": "http://localhost:3000/"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Souvenir",
                    "sku": "001",
                    "price": req.body.price,
                    "currency": "USD",
                    "quantity": req.body.quantity
                }]
            },
            "amount": {
                "currency": "USD",
                "total": req.body.price * req.body.quantity
            },
            "description": "Enjoy El Restaurante's Souvenir!."
        }]
    };
    
    
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for( var i = 0; i < payment.links.length; i++){
                if(payment.links[i].rel === "approval_url"){
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
});

app.get("/recipes", function(req, res){
    res.sendFile(path.join(__dirname, "public/recipes.html"));
});

app.post("/recipes", function(req, res){
    res.redirect("back")
    var sendEmail = req.body.email;
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "nplatonovbusiness@gmail.com",
            pass: "" // Put password here
        }
    });
    var mailOptions = {
        from: "nplatonovbusiness@gmail.com",
        to: sendEmail,
        subject: "El Restaurante Recipe Book !",
        html: "<h2>Please enjoy our attached recipe book ! :)</h2>",
        attachments: [
            {
                filename: "ElRestauranteBook.pdf",
                path: "./attachments/ElRestauranteBook.pdf"
            }
        ]
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            console.log("Something went wrong");
        } else {
            console.log("Message sent: " + info.response);
            console.log("Everything worked fine!");
        }
    });

});

app.get("/news", function(req, res){
    res.sendFile(path.join(__dirname, "public/news.html"));
});

app.get("/about", function(req, res){
    res.sendFile(path.join(__dirname, "public/about.html"));
});

app.get("/contact", function(req, res){
    res.sendFile(path.join(__dirname, "public/contact.html"));
});

app.listen(process.env.PORT || 3000, function(){
    console.log("SERVER STARTED ON PORT 3000")
});