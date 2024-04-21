console.log(2)

const express = require("express");
const app = express()
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exp = require("constants");

app.use(bodyParser.json())
app.use(express.static('public')) // whenever to get html files it'll look at public folder
app.use(bodyParser.urlencoded({
    extended:true
}))

const port = 3000
app.get("/" , (req,res)=> {
    res.set({
        "Allow-access-Allow-Origin":"*"
    })
    return res.redirect('login.html')
}).listen(port)
console.log("Listening on port" , port)

// connect to database
const connect = mongoose.connect("mongodb://0.0.0.0:27017/");
login_db = mongoose.connection.useDb("LoginData")
users_db = mongoose.connection.useDb("UserData")



// Checking whether the database is connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
.catch(() => {
    console.log("Database cannot be Connected");
})

app.post("/login" , (req,res)=> {
    var username = req.body.username
    var password = req.body.password
    return res.redirect("home.html")
})

app.post("/signup" , (req,res)=> {
    var roll = req.body.roll
    var name = req.body.name
    var year = req.body.year
    var age = req.body.age
    var gender = req.body.gender
    var interests = req.body.interests
    var hobbies = req.body.hobbies
    var email = req.body.email
    var photo = req.body.photo
    var username = req.body.username
    var password = req.body.password
    var secret_question = req.body.secret_question
    var secret_answer = req.body.secret_answer

    var student_data = {
        "username": username,
        "IITB Roll Number": roll,
        "Name": name,
        "Year of Study": year,
        "Age": age,
        "Gender": gender,
        "Interests": interests,
        "Hobbies": hobbies,
        "Email": email,
        "Photo": photo
    }
    var login_data =(
        {
            "username": username,
            "password": password,
            "secret_question": secret_question,
            "secret_answer": secret_answer
        }
    )
    users_db.collection("users").insertOne(student_data , (err,collection)=> {
        if (err) throw err
        console.log("Data inserted successfully")
    })

    return res.redirect('login.html')
})
// var MongoClient = require('mongodb').MongoClient;
// var url = "mongodb://localhost:27017/mydb";

// MongoClient.connect(url, function(err, db) {
//     if (err) throw err;
//     console.log("Database created!");
//     var dbo = db.db("mydb");
//     var myobj = { name: "Company Inc", address: "Highway 37" };
//     dbo.createCollection("customers", function(err, res) {
//         if (err) throw err;
//         console.log("Collection created!");
//     });
//     dbo.collection("customers").insertOne(myobj, function(err, res) {
//         if (err) throw err;
//         console.log("1 document inserted");
//         db.close();
//       });
// });