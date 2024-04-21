console.log(2)

const express = require("express");
const app = express()
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const exp = require("constants");
const fs = require('fs');

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

async function readData() {
    // Read the local JSON file
    const login_jsonData = fs.readFileSync('login.json', 'utf-8');
    const user_jsonData = fs.readFileSync('students.json', 'utf-8');

    // Parse the JSON data and insert it
    const jsonparseddata = JSON.parse(login_jsonData);
    const jsonparseddata2 = JSON.parse(user_jsonData);
    var q = {}
    var documents = await login_db.collection("users").findOne(q)
    console.log(documents)
    if(documents == null){
        try {
            login_db.collection("users").insertMany(jsonparseddata)
            console.log("login data entered goodly")
        }
        catch {
            console.log("login couldn't enter data")
        }
    }
    else {
        console.log("Login db has og data")
    }
    var documents = await users_db.collection("users").findOne(q)
    console.log(documents)
    if(documents == null){
        try {
            users_db.collection("users").insertMany(jsonparseddata2)
            console.log("user data entered goodly")
        }
        catch {
            console.log("user data couldn't enter ")
        }
    }
    else {
        console.log("user db has og data")
    }
}

readData()

app.post("/login" , async (req,res)=> {
    var usernam = req.body.username
    var passwor = req.body.password
    var query = {username:usernam , password:passwor}
    var d = await login_db.collection("users").findOne(query)
    console.log(d)
    if(d != null) {
        return res.redirect("home.html")
    }
    else {
        console.log("Incorrect Username and Password")
        return res.redirect("login.html")
    }
})

app.post("/signup" , (req,res)=> {
    var roll = req.body.roll
    var name = req.body.name
    var year = req.body.year
    var age = req.body.age
    age = Number(age)
    var gender = req.body.gender
    var interests = req.body.interests
    var hobbies = req.body.hobbies
    var email = req.body.email
    var photo = req.body.photo
    var username = req.body.username
    var password = req.body.password
    var secret_question = req.body.secret_question
    var secret_answer = req.body.secret_answer
    if(roll == "" || name == "" || year == "" || age == "" || gender == null || interests == null || hobbies == null || email == "" || username == "" || password == "" || secret_answer == "" || secret_question == "") {
        console.log("Enter all details to proceed")
        return res.redirect('signup.html')
    }
    else {
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
        console.log("User Data inserted successfully")
    })
    login_db.collection("users").insertOne(login_data , (err,collection)=> {
        if (err) throw err
        console.log("Login Data inserted successfully")
    })
    return res.redirect('login.html')
    }

})

app.get("/show_question" , async (req,res)=> {
    usernam = req.query.username
    console.log(usernam)
    var doc = await login_db.collection("users").findOne({username:usernam})
    if(doc == null) {
        console.log("User doesn't exist")
        return res.redirect("signup.html")
    }
    else {
        return res.json(doc)
    }
})

app.post("/login_with_question", async (req,res)=> {
    sa = req.body.secret_answer
    
    console.log(sa)
    var doc = await login_db.collection("users").findOne({secret_answer:sa})
    if(doc == null) {
        console.log("Wrong Answer")
        return res.redirect("signup.html")
    }
    else {
        res.redirect("home.html")
    }

})
