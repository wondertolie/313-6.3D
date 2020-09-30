const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const validator = require('validator')
const alert = require('alert')
const path = require('path')
const https = require('https')
const { response } = require('express')
const { request } = require('http')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const nodemailer = require("nodemailer");
var Session = require('express-session');
var google = require('googleapis');

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

//connect to web
app.get('/', (req, res)=>{
    res.redirect('/Login.html');
})


app.get('/register', (req, res)=>{
    res.sendFile(path.join(__dirname, "public/regist.html"));
})
/
mongoose.connect("mongodb://localhost:27017/iCrowdTaskDB", {useNewUrlParser: true})


//Schema&check
const listSchema = new mongoose.Schema({
    country:{
        type:String,
        required:true,
        validator(value){
            if(validator.isEmpty(value)){
                throw new Error('Please choose your country!')
            }
        }
    },
    salt:{
        type:String
    },
    firstName:{
        type: String,
        required: true ,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your first name!')
            }
        }
    },
    lastName:{
        type:String, 
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your last name!')
            }
        }
    },
    email:{
        type:String, 
        required: true,
        trim: true,
        validator(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your email address!')
            }
            if(!validator.isEmail(value)){
                throw new Error("Your email address is not valid!")
            }
        }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input your password!')
            }
            if(!validator.isLength(value,{min:8})){
                throw new Error('Your password must be more than 8 characters!')
                alert(Error)
            }
        }
    },
    confirmPassword:{
        type: String,
        required: true,
        validate(value) {
            if(!validator.equals(value, this.password)){
            throw new Error('Your password should be the same as Confirm password!')
            }
        }
    },
    address1:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input address!')
            }
        }
    },
    address2:{
        type: String,
        required:false
    },
    city:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input city!')
            }
        }
    },
    state:{
        type: String,
        required: true,
        validate(value){
            if(validator.isEmpty(value)){
                throw new Error('Please input state!')
            }
        }
    },
    zip:{
        type:String,
        required:false
    },
    phoneNumber:{
        type:String,
        validate(value){
            if((!validator.isEmpty(value))&&(!validator.isMobilePhone(value, ['am-Am', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN', 'be-BY', 'bg-BG', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'de-AT', 'de-CH', 'el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK', 'en-MO', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-UG', 'en-US', 'en-TZ', 'en-ZA', 'en-ZM', 'en-ZW' , 'es-CL', 'es-CO', 'es-CR', 'es-EC', 'es-ES', 'es-MX', 'es-PA', 'es-PY', 'es-UY', 'et-EE', 'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'he-IL', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sl-SI', 'sk-SK', 'sr-RS', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-MO', 'zh-TW']))){
                throw new Error('Your phone number is not valid!')
            }
        }
    }
})

//login get
app.get("/login", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/Login.html"));
})

app.post('/login', (req, res)=>{
    const email = req.body.email
    const password = req.body.password
    User.findOne({email: email}, function(err, doc){
        if(doc){
            const result = bcrypt.compareSync(password, doc.password)
            if(result){
                res.redirect("/logsuccess")
            }
            else{
                alert("Wrong password!")
                // res.send("Wrong password!")
            }
        }
        else{
            alert("Invalid email address!")
            // res.send("Invalid email address!")
        }
    })

})


const User = mongoose.model('User', listSchema)

app.post('/register', (req, res)=>{

    const body = req.body;
    const userInfo = {country, firstName, lastName, email, password, confirmPassword, address1, address2, city, state, zip, phoneNumber} = body;
   
    body.salt = bcrypt.genSaltSync(saltRounds)
    body.password = bcrypt.hashSync(body.password, body.salt)
    body.confirmPassword = body.password

    const user = new User(userInfo)

    //Determine whether the mailbox has been registered
    User.findOne({email:email},function(error,ress){
        if(ress){
            alert("The email address has already been registered!")
        }else{
            user.save(function(error){
                if(error){
                    if(validator.isEmpty(firstName)){
                        alert('Please input your first name.')
                    }
                    else if(validator.isEmpty(lastName)){
                        alert("Please input your last name.")
                    }
                    else if(validator.isEmpty(email)){
                        alert('Please input your email address.')
                    }
                    else if(!validator.isEmail(email)){
                        alert("Your e-mail address is not valid!")
                    }
                    else if(validator.isEmpty(password)){
                        alert('Please input your password.')
                    }
                    else if(!validator.isLength(password,{min:8})){
                        alert('Your password must be at least 8 characters!')
                    }
                    else if(!validator.equals(confirmPassword, password)){
                        alert('Your password should be the same as Confirm password!')
                    }
                    else if(validator.isEmpty(address1)){
                        alert('Please input your address.')
                    }
                    else if(validator.isEmpty(city)){
                        alert('Please input your city.')
                    }
                    else if(validator.isEmpty(state)){
                        alert('Please input your state.')
                    }
                    else if((!validator.isMobilePhone(phoneNumber, ['am-Am', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 'ar-KW', 'ar-SA', 'ar-SY', 'ar-TN', 'be-BY', 'bg-BG', 'bn-BD', 'cs-CZ', 'da-DK', 'de-DE', 'de-AT', 'de-CH', 'el-GR', 'en-AU', 'en-CA', 'en-GB', 'en-GG', 'en-GH', 'en-HK', 'en-MO', 'en-IE', 'en-IN', 'en-KE', 'en-MT', 'en-MU', 'en-NG', 'en-NZ', 'en-PK', 'en-RW', 'en-SG', 'en-SL', 'en-UG', 'en-US', 'en-TZ', 'en-ZA', 'en-ZM', 'en-ZW' , 'es-CL', 'es-CO', 'es-CR', 'es-EC', 'es-ES', 'es-MX', 'es-PA', 'es-PY', 'es-UY', 'et-EE', 'fa-IR', 'fi-FI', 'fj-FJ', 'fo-FO', 'fr-BE', 'fr-FR', 'fr-GF', 'fr-GP', 'fr-MQ', 'fr-RE', 'he-IL', 'hu-HU', 'id-ID', 'it-IT', 'ja-JP', 'kk-KZ', 'kl-GL', 'ko-KR', 'lt-LT', 'ms-MY', 'nb-NO', 'ne-NP', 'nl-BE', 'nl-NL', 'nn-NO', 'pl-PL', 'pt-BR', 'pt-PT', 'ro-RO', 'ru-RU', 'sl-SI', 'sk-SK', 'sr-RS', 'sv-SE', 'th-TH', 'tr-TR', 'uk-UA', 'vi-VN', 'zh-CN', 'zh-HK', 'zh-MO', 'zh-TW']))){
                        alert('Your phone number is not valid!')
                    }else{
                        console.log("Error.")
                    }                
                }else{
                    res.redirect("/success")
                }
            })
        }
    })

})

app.get("/success", (req, res) => {
    res.sendFile(path.join(__dirname, "public/success.html"));
  })

app.get("/logsuccess", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/logsuccess.html"));
})

//app.listen(3000, function(request, response){
//   console.log('Server is running on port 3000')
//})


app.get("/sendmail", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/sendmail.html"));
})


app.post("/sendmail", (req, res)=>{
    const email = req.body.email;
  console.log("Success send reset mail!!!");
  res.redirect("/success");
  const transporter = nodemailer.createTransport({
    service: "qq",
    port: 465, // SMTP 端口
    secureConnection: true,
    host: "smtp",
    auth: {
      user: "844767819@qq.com",
      pass: "cyoxelilokwnbcba", //授权码,通过QQ获取
    },
  });
  const mailOptions = {
    from: "844767819@qq.com", // 发送者
    to: email, // 接受者,可以同时发送多个,以逗号隔开
    subject: "reset password email", // 标题
    text: "Reset password link: http://127.0.0.1:3000/changeP",
    html: "<b>Reset password link: http://127.0.0.1:3000/changeP 我是傻逼</b>",
  };

  const result = {
    httpCode: 200,
    message: "send success!",
  };
  try {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        result.httpCode = 500;
        result.message = err;
        callback(result);
        return;
      }
      callback(result);
    });
  } catch (err) {
    result.httpCode = 500;
    result.message = err;
    callback(result);
  }
})

app.get("/changeP", (req, res)=>{
    res.sendFile(path.join(__dirname, "public/changeP.html"));
})


app.post("/changeP", (req, res)=>{
    
    const Emails = req.body.email;

  var MongoClient = require("mongodb").MongoClient;
  var url = "mongodb://localhost:27017";
///////iCrowdTaskDB\\
  MongoClient.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) throw err;
      console.log("e 1");
      var dbo = db.db("iCrowdTaskDB");
      console.log("e 2");
      dbo
        .collection("users")
        .find({ "email": req.body.email })
        .toArray(function (err0,result) {
          if (err0) throw err0;
          console.log("e 3!");
          if (result[0]["email"] == req.body.email) {

            console.log("e 4");
            dbo.collection("users").updateOne(
              { "email": req.body.email },
              {
                $set: {
                  "password": req.body.newpassword,
                  "Con_password": req.body.newpassword,
                },
              },
              function (err, res2) {
                if (err) throw err;
                console.log("update success");
                res.redirect("/success");
              }
            );

            
          }
          else{
            console.log("Didn't find the email..."+result[0]["email"]+"!");
          }
        });
    }
  );

})





let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
//app.listen(Process.env.PORT||3000)
app.listen(port, function (request, response) {
  console.log("Runnning on port 3000");
});
