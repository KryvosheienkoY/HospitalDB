const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt= require('jsonwebtoken');
const process = require('dotenv').config({ path: '.env' });
var mysql = require('mysql');
let Secret='50b4368372758102491d90d066f2368b400d64637291c8a9ffec2fa2a0da5d224420d17b47ce8cff8dac5cdd0f7a47079e4dceb698e4397278f091cb9d6c560b'
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

// let user={name:"name"};
// const token = jwt.sign(user,Secret);
// console.log(token);
console.log(getAllDepartments());
app.post('/login', function (req, res)
{
    //Check login

    let user={name: req.body.username};
    const token = jwt.sign(user, Secret);
    console.log(token);
});
app.get('/departments', function (req, res) {
    const dep = req.body.depart;
        con.query("SELECT * FROM `department`", function (err, result) {
            response.json({"doctors": result});
            console.log("response");
        });

});
app.get('/doctors', function (req, res) {
    const dep = req.department;
    if (dep == "all") {
        con.query("SELECT * FROM `doctor`", function (err, result) {
            res.json({"doctors": result});
            console.log("response");
        });
    }
    else {

    }
});
app.get('/doctorsOfDepartment/(:id)', function (req, res) {
    var sql = "Select * FROM `doctor` WHERE Department_ID =?)";
    con.query(sql, req.params.id, function (err, result) {
        res.json({"doctors": result});
    });


});
function getAllDepartments()
{
  //  var json= new JSON();
    var j;
    con.query("SELECT * FROM `department`", function (err, result) {
        //  response.json({"doctors": result});
        console.log(result);
        j.json=result;
    });
    return j.json;
}

