const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use('/', express.static(__dirname + '/../public'));
app.listen(8080);
const bodyParser = require('body-parser');
const jwt= require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var mysql = require('mysql');
let Secret='50b4368372758102491d90d066f2368b400d64637291c8a9ffec2fa2a0da5d224420d17b47ce8cff8dac5cdd0f7a47079e4dceb698e4397278f091cb9d6c560b';
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hospital"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");

});
app.get('/', (req, res) => {
    res.render('main_view');
});


function getAllDepartments() {
    return [{ Department_ID:1,  Department_Name:"DD",  Department_PhoneN:"098",  Department_City:"etwet",  Department_Street:"DGGD",  Department_Building:"DSG",  Department_Index:"DGSG"},
        { Department_ID:2,  Department_Name:"DdddD",  Department_PhoneN:"098321",  Department_City:"etddwet",  Department_Street:"DGGD",  Department_Building:"DSG",  Department_Index:"DGSG"}

];

}

app.get('/our_departments', function (req, res) {
    res.render('our_departments_view',{
        departmentsAr: getAllDepartments()});

});

app.get('/doctorsOfDepartment/(:id)', function (req, res) {
    // result - хочу получить всех врачей отделения с айди - id
    let result=[{ Doctor_Surname :1,  Doctor_Firstname:"DD"},
        { Doctor_Surname:2,  Doctor_Firstname:"DdddD"}];

        response.json({"doctors": result});

});

app.post('/register',function (req, res) {
    const user = req.body.username;
    const pass = req.body.pass;
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(pass, salt, function (err, hash) {
            var sql = "INSERT INTO User Values(?,?)";
            con.query(sql, [user, hash], function (err, result) {
                if(err)
                {
                    res.json({"res":"fail"});
                }

                if(res)
                {
                    res.json({"res":"success"})
                }

            });
        });
    });
});
console.log(getAllDepartments());
app.post('/login', function (req, res) {
    let usern = req.body.username;
    var sql = "SELECT * FROM user WHERE Username=?";
    con.query(sql, usern, function (err, result) {

        bcrypt.compare(result, hash, function (err, result) {
            let user = {name: req.body.username};
            const token = jwt.sign(user, Secret);
            res.json({"token": token});
        });

    });
});
app.get('/departments', function (req, res) {
    const dep = req.body.depart;
    con.query("SELECT * FROM `department`", function (err, result) {
        res.json({"doctors": result});
        console.log("response");
    });

});

app.get('/doctorsOfDepartment/(:id)', function (req, res) {
    var sql = "Select * FROM `doctor` WHERE Department_ID =?)";
    con.query(sql, id, function (err, result) {
        res.json({"doctors": result});
    });
});

