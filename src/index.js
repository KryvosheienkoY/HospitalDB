const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use('/', express.static(__dirname + '/../public'));
app.listen(8080);
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var mysql = require('mysql');
var tok;
var role;
let Secret = '50b4368372758102491d90d066f2368b400d64637291c8a9ffec2fa2a0da5d224420d17b47ce8cff8dac5cdd0f7a47079e4dceb698e4397278f091cb9d6c560b';
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "hospital"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");

});

app.get('/', (req, res) => {
    res.render('main_unlogged_view');
});

app.get('/patient/my_profile', (req, res) => {
    res.render('patient_myprofile_view');
});


app.get('/our_departments', function (req, res) {
    con.query("SELECT * FROM `department`", function (err, result) {
        res.render('our_departments_unlogged_view', {
            departmentsAr: result
        });
    });
});

app.post('/register',function (req, res) {
    console.log("try to reg");
    console.log("req.body");
    console.log(req.body);
    const user = req.body.usernameR;
    const pass = req.body.passR;
    var sql = "SELECT * FROM user WHERE Username=?";
    con.query(sql, user, function (err, result) {
        if(res.length>0)
        {
            res.render('login_result_failed_view', {
                "result": "Failed. User exists"
            });
            return;
        }

    });
    con.query('INSERT INTO patient SET ?',
        {Patient_Surname: req.body.surnameR, Patient_Firstname: req.body.nameR,Patient_Patronymic: req.body.patronymicR,
            Patient_City: req.body.cityR,Patient_Street: req.body.streetR, Patient_Building: req.body.buildingR,
            Patient_Apt: req.body.appartmentsR, Patient_Index: req.body.zipR,
            Patient_PhoneN: req.body.phoneR, Patient_BloodType: req.body.bloodtypeR,
            Patient_Rhesus: req.body.rhesusR, Patient_eAddress: req.body.emailR,Patient_Birthdate: req.body.birthR, Patient_Notes: req.body.notesR}, function(err, result){
            if(err)
            {
                res.json({"result":"Failed. User exists"+err});
            }
            else
            {
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(pass, salt, function (err, hash) {
                        con.query('INSERT INTO user SET ?', {Username: user, Password: hash,Patient_ID: res.insertId}, function(err, result){
                            if(err)
                            {
                                console.log(err);
                            }
                            else
                            {
                                role=3;
                                let user = {id: res.insertID};
                                const token = jwt.sign(user, Secret);
                                res.render('login_result_patient_view', {
                                    "result": "success",
                                    "token": token
                                });
                            }

                        });
                    });
                });
            }
        });
});

app.post('/login', function (req, res) {
    let usern = req.body.username;
    var sql = "SELECT * FROM user WHERE Username=?";
    con.query(sql, usern, function (err, result) {

        bcrypt.compare(result, hash, function (err, result) {
            let user = {id: result.Patient_ID};
            const token = jwt.sign(user, Secret);
            res.json({"token": token});
        });

    });
});



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

app.get('/doctorsOfDepartment/(:id)', function (req, res) {
    var sql = "Select * FROM `doctor` WHERE Department_ID =?";
    let idParam = req.params.id;
    con.query(sql, idParam, function (err, result) {
        res.json({"doctors": result});
    });
});

app.get('/delete/(:table)/(:id)', function (req, res) {
    var sql = "Select * FROM ? WHERE Department_ID =?";
    con.query(sql, [req.param.table, req.param.id], function (err, result) {
        res.json({"doctors": result});
    });
});

app.get('/patient/my_profile', function (req, res) {
    con.query("SELECT * FROM `patient`", function (err, result) {
        res.render('patient_myprofile_view', {
            p: result
        });
    });
});

// app.get("/patient/my_profile",function (req,res) {
//     var tok = jwt.decode(req.body.token,Secret);
//     var sql = "SELECT * FROM patient WHERE Patient_ID=?";
//     con.query(sql, tok.id, function (err, result) {
//         var sql = "SELECT * FROM analysis WHERE Patient_ID=?";
//         con.query(sql, tok.id, function (err, resul) {
//             res.json({"patient":result,"analysis":resul});
//         });
//     });
// });