// console.log(2)

const express = require("express");
const app = express()
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")
const exp = require("constants");
const fs = require('fs');
const multer = require('multer');
const path = require('path');

app.use(cookieParser())
app.use(bodyParser.json())
app.use(express.static('public')) // whenever to get html files it'll look at public folder
app.use(bodyParser.urlencoded({
    extended: true
}))

// Set up the server
const port = 3000
app.get("/", (req, res) => {
    res.set({
        "Allow-access-Allow-Origin": "*"
    })
    return res.redirect('login.html')
}).listen(port)
console.log("Listening on port", port)

// connect to database
const connect = mongoose.connect("mongodb://0.0.0.0:27017/");
login_db = mongoose.connection.useDb("LoginData")
users_db = mongoose.connection.useDb("UserData")

// Set up multer to store files in the 'photos' directory
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/Users/prakharjain/Desktop/DatingWebsite cs108 project/public/photos')
    },
    filename: function (req, file, cb) {
        var fileExtensionPatter = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/;
        var extension = file.originalname.match(fileExtensionPatter)[0];
        cb(null, file.fieldname + '-' + Date.now() + extension.toLowerCase());
    },
});

var upload = multer({ storage: storage }).single('photo');


// Checking whether the database is connected or not
connect.then(() => {
    console.log("Database Connected Successfully");
})
    .catch(() => {
        console.log("Database cannot be Connected");
    })

function intersection(array1, array2) {
    // Create a Set from the first array
    const set1 = new Set(array1);
    // Create a Set containing elements common to both arrays
    return array2.filter(item => set1.has(item));
}

async function readData() {
    // Read the local JSON file
    const login_jsonData = fs.readFileSync('login.json', 'utf-8');
    const user_jsonData = fs.readFileSync('students2.json', 'utf-8');

    // Parse the JSON data and insert it
    const jsonparseddata = JSON.parse(login_jsonData);
    const jsonparseddata2 = JSON.parse(user_jsonData);
    var q = {}
    var documents = await login_db.collection("users").findOne(q)
    // console.log(documents)
    if (documents == null) {
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
    // console.log(documents)
    if (documents == null) {
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

app.post("/login", async (req, res) => {
    var usernam = req.body.username
    var passwor = req.body.password
    var query = { username: usernam, password: passwor }
    var d = await login_db.collection("users").findOne(query)
    // console.log(d)
    if (d != null) {
        res.clearCookie("username")
        res.cookie("username", usernam)
        return res.redirect("home.html")
    }
    else {
        console.log("Incorrect Username and Password")
        return res.redirect("login.html")
    }
})

app.post("/signup", upload, async (req, res) => {
    var roll = req.body.roll
    var name = req.body.name
    var year = req.body.year
    var age = req.body.age
    age = Number(age)
    var gender = req.body.gender
    var interests = req.body.interests
    var hobbies = req.body.hobbies
    if (typeof (interests) == "string") {
        interests = [req.body.interests]
    }
    if (typeof (hobbies) == "string") {
        hobbies = [req.body.hobbies]
    }
    var email = req.body.email
    if (req.file == undefined) {
        photo = "images/no_profile_image.jpg"
    }
    else {
        var photo = "photos/" + req.file.filename
    }
    var username = req.body.username
    var password = req.body.password
    var secret_question = req.body.secret_question
    var secret_answer = req.body.secret_answer
    var user = await users_db.collection("users").findOne({ username: username })
    if (user != null) {
        console.log("Username already exists")
        return res.redirect('signup.html')
    }
    else {
        if (roll == "" || name == "" || year == "" || age == "" || gender == null || interests == null || hobbies == null || email == "" || username == "" || password == "" || secret_answer == "" || secret_question == "") {
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
                "Photo": photo,
                "myLikes": []
            }
            var login_data = (
                {
                    "username": username,
                    "password": password,
                    "secret_question": secret_question,
                    "secret_answer": secret_answer
                }
            )
            users_db.collection("users").insertOne(student_data, (err, collection) => {
                if (err) throw err
                console.log("User Data inserted successfully")
            })
            login_db.collection("users").insertOne(login_data, (err, collection) => {
                if (err) throw err
                console.log("Login Data inserted successfully")
            })
            return res.redirect('login.html')
        }
    }
})

app.get("/show_question", async (req, res) => {
    usernam = req.query.username
    console.log(usernam)
    var doc = await login_db.collection("users").findOne({ username: usernam })
    if (doc == null) {
        console.log("User doesn't exist")
        return res.redirect("signup.html")
    }
    else {
        return res.json(doc)
    }
})

app.post("/login_with_question", async (req, res) => {
    sa = req.body.secret_answer

    console.log(sa)
    var doc = await login_db.collection("users").findOne({ secret_answer: sa })
    if (doc == null) {
        console.log("Wrong Answer")
        return res.redirect("signup.html")
    }
    else {
        var usernam = doc.username
        res.clearCookie("username")
        res.cookie("username", usernam)
        res.redirect("home.html")
    }

})

app.get('/get-cookie', (req, res) => {
    // Retrieve the value of the 'username' cookie
    const usernam = req.cookies.username;
    res.send(usernam);
})

app.get('/find_match', async (req, res) => {
    usernam = req.query.username
    // console.log(usernam)
    var user = await users_db.collection("users").findOne({ username: usernam })
    var allData = await users_db.collection("users").find({}).toArray()
    // console.log(user)
    var match_usernam = "blabla"
    var interest_hobby_match = 0
    allData.forEach(doc => {
        // console.log(doc)
        if ((((intersection(user.Hobbies, doc.Hobbies).length) + ((intersection(user.Interests, doc.Interests).length))) >= interest_hobby_match) && (user.Gender != doc.Gender) && (user.username != doc.username)) {
            // console.log(doc)
            interest_hobby_match = ((intersection(user.Hobbies, doc.Hobbies).length) + ((intersection(user.Interests, doc.Interests).length)))
            match_usernam = doc.username
            // console.log(match_usernam)
        }
    });
    // console.log(match_usernam)
    var match_user = await users_db.collection("users").findOne({ username: match_usernam })
    // console.log(match_user)
    return res.json(match_user)


})

app.post('/find_match_without_login', async (req, res) => {
    var allData = await users_db.collection("users").find({}).toArray()
    var match_name = ""
    var interest_hobby_match = 0
    var gender = req.body.gender
    var interests = req.body.interests
    var hobbies = req.body.hobbies
    if (typeof (interests) == "string") {
        interests = [req.body.interests]
    }
    if (typeof (hobbies) == "string") {
        hobbies = [req.body.hobbies]
    }
    console.log(interests)
    allData.forEach(doc => {
        // console.log(doc)
        if ((((intersection(hobbies, doc.Hobbies).length) + ((intersection(interests, doc.Interests).length))) >= interest_hobby_match) && (gender != doc.Gender)) {
            // console.log(doc)
            interest_hobby_match = ((intersection(hobbies, doc.Hobbies).length) + ((intersection(interests, doc.Interests).length)))
            match_name = doc.Name
            console.log(match_name)
        }
    });
    console.log(match_name)
    // var match_user = await users_db.collection("users").findOne({username:match_usernam})
    // console.log(match_user)
    return res.redirect("find_match.html?matchname=" + match_name)


})

app.get('/get_user_data', async (req, res) => {
    usernam = req.query.username
    var user = await users_db.collection("users").findOne({ username: usernam })
    return res.json(user)
})

app.get('/get_user_data_by_name', async (req, res) => {
    usernam = req.query.username
    var user = await users_db.collection("users").findOne({ Name: usernam })
    return res.json(user)
})

app.get('/get_users', async (req, res) => {
    var allData = await users_db.collection("users").find({}).toArray()
    // console.log(allData)
    return res.json(allData)
})

app.post('/like_user', async (req, res) => {
    var likedUsername = req.body.username
    var currentUserName = req.body.currentUserName
    console.log(likedUsername)
    console.log(currentUserName)
    var user = await users_db.collection("users").findOne({ username: likedUsername })
    var newLikedList = user.myLikes
    newLikedList.push(currentUserName)
    var res2 = await users_db.collection("users").updateOne({ username: likedUsername }, { $set: { myLikes: newLikedList } })
    return res.redirect(req.originalUrl)
})

app.post('/unlike_user', async (req, res) => {
    var likedUsername = req.body.username
    var currentUserName = req.body.currentUserName
    console.log(likedUsername)
    console.log(currentUserName)
    var user = await users_db.collection("users").findOne({ username: likedUsername })
    var newLikedList = user.myLikes
    const index = newLikedList.indexOf(currentUserName);
    if (index > -1) {
        newLikedList.splice(index, 1);
    }
    var res2 = await users_db.collection("users").updateOne({ username: likedUsername }, { $set: { myLikes: newLikedList } })
    return res.redirect(req.originalUrl)
})
