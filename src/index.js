const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', './src/views');
// app.set('views', 'C:/Users/USER/WebstormProjects/HospitalDB/src/views');
app.use('/', express.static(__dirname + '/../public'));
app.use('/patient', express.static(__dirname + '/../public'));
// app.use('/patient/my_profile', express.static(__dirname + '/../public'));
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

app.get('/admin', (req, res) => {
    res.render('admin');
});

app.get('/admin/patient_table', (req, res) => {
    var sql = "Select * FROM `patient`";
    con.query(sql, function (err, result) {
        substringDate(result);
        res.render('admin_view_patient',{"patients": result});
    });

});


app.get('/patient', (req, res) => {
    res.render('main_patient_view');
});


app.get('/our_departments', function (req, res) {
    con.query("SELECT * FROM `department`", function (err, result) {
        res.render('our_departments_unlogged_view', {
            departmentsAr: result
        });
    });
});


app.get('/patient/our_departments', function (req, res) {
    con.query("SELECT * FROM `department`", function (err, result) {
        res.render('our_departments_patient_view', {
            departmentsAr: result
        });
    });
});


app.post('/register', function (req, res) {
    console.log("try to reg");
    console.log("req.body");
    console.log(req.body);
    const user = req.body.usernameR;
    const pass = req.body.passR;
    var sql = "SELECT * FROM user WHERE Username=?";
    con.query(sql, user, function (err, result) {
        if (res.length > 0) {
            res.render('login_result_failed_view', {
                "result": "Failed. User exists"
            });
            return;
        }

    });
    con.query('INSERT INTO patient SET ?',
        {
            Patient_Surname: req.body.surnameR,
            Patient_Firstname: req.body.nameR,
            Patient_Patronymic: req.body.patronymicR,
            Patient_City: req.body.cityR,
            Patient_Street: req.body.streetR,
            Patient_Building: req.body.buildingR,
            Patient_Apt: req.body.appartmentsR,
            Patient_Index: req.body.zipR,
            Patient_PhoneN: req.body.phoneR,
            Patient_BloodType: req.body.bloodtypeR,
            Patient_Rhesus: req.body.rhesusR,
            Patient_eAddress: req.body.emailR,
            Patient_Birthdate: req.body.birthR,
            Patient_Notes: req.body.notesR
        }, function (err, resu) {
            if (err) {
                res.json({"result": "Failed. User exists" + err});
            }
            else {
                console.log(resu);
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(pass, salt, function (err, hash) {
                        con.query('INSERT INTO user SET ?', {
                            Username: user,
                            Password: hash,
                            Patient_ID: resu.insertId
                        }, function (err, resul) {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                role = 3;
                                let user = {id: resu.insertID};
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
    let usern = req.body.usernameL;
    var sql = "SELECT * FROM user WHERE Username=?";
    con.query(sql, req.body.usernameL, function (err, result) {
        if (err || result.length < 1) {
            console.log("User not found");
            res.render('login_result_failed_view', {
                "result": "Failed. User doesn`t exist"
            });
        }
        else {
            bcrypt.compare(req.body.passL, result[0].Password, function (erro, resul) {
                console.log("Password check");
                if (erro) {
                    console.log("Password doesnt match");
                    res.render('login_result_failed_view', {
                        "result": "Failed. Password doesn`t match"
                    });
                }
                console.log("Password matches");
                if (result[0].Patient_ID == null && result[0].Doctor_ID == null) {
                    let user = {role: 1, id: -1};
                    const token = jwt.sign(user, Secret, jwt.HS256);
                    res.render('admin', {
                        "token": token
                    });
                } else if (result[0].Patient_ID == null) {
                    let user = {role: 2, id: result[0].Doctor_ID};
                    const token = jwt.sign(user, Secret);
                    //    TODO render doctor view
                } else {
                    console.log("Patient login");
                    const token = jwt.sign({role: 3, id: result[0].Patient_ID}, Secret);

                    // console.log("token  "+role+",  "+id);
                    res.render('login_result_patient_view', {
                        "result": "success",
                        "token": token
                    });
                }
            });
        }

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

function substringDate(result) {
    for(let i=0; i<result.length;++i){
        result[i].Patient_Birthdate = ("" + result[i].Patient_Birthdate).substring(0, 15);
        result[i].Diagnosys_StartDate = ("" + result[i].Diagnosys_StartDate).substring(0, 15);
        result[i].Diagnosys_EndDate = ("" + result[i].Diagnosys_EndDate).substring(0, 15);
    }
}

app.get("/patient/my_profile", function (req, res) {
    if (req.headers && req.headers.authorization) {
        var auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        let sql = "SELECT * FROM patient WHERE Patient_ID=?";
        con.query(sql, id, function (err, result) {
            if (err) console.log(err);
            console.log(result[0]);
            substringDate(result);
            var sql = "SELECT * FROM analysis WHERE Patient_ID=?";
            con.query(sql, id, function (er, resul) {
                var sql = "SELECT Allergy_Name FROM allergy INNER JOIN patientallergy ON allergy.Allergy_ID=patientallergy.Allergy_ID WHERE Patient_ID=?";
                con.query(sql, id, function (e, resu) {
                    var sql = "SELECT Allergy_Name FROM allergy WHERE Allergy_ID NOT IN (SELECT Allergy_ID FROM patientallergy WHERE Patient_ID= ?)";

                    con.query(sql, id, function (error, re) {
                        if (er) console.log(er);
                        let aller = [];
                        for (let x = 0; x < resu.length; x++) {
                            aller.push({allergy: resu[x].Allergy_Name, exists: true});
                        }
                        for (let x = 0; x < re.length; x++) {
                            aller.push({allergy: re[x].Allergy_Name, exists: false});
                        }
                        res.render("patient_myprofile_view", {
                            "p": result[0],
                            "analysis": resul,
                            "allergies": aller
                        });
                    });
                });
            });
        });
    }
});

app.post('/patient/allergies', function (req, res) {
    if (req.headers && req.headers.authorization) {
        var auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        var allergies = req.body.allergies;
        console.log(allergies);
        let sql = "SELECT Allergy_Name, patientallergy.Allergy_ID FROM allergy INNER JOIN patientallergy ON allergy.Allergy_ID=patientallergy.Allergy_ID WHERE patientallergy.Patient_ID=?";
        con.query(sql, id, function (err, result) {
            //result   -   дані про алергії пацієнта
            let newAllergies = [];
            console.log("rezultat  " + result[0].Allergy_ID);
            for (let x = 0; x < allergies.length; x++) {
                console.log(allergies[x]);
                if (!result.find(({Allergy_Name}) => Allergy_Name === allergies[x]))
                    newAllergies.push(allergies[x]);
            }
            console.log("new allergies  " + newAllergies);
            let removedAll = [];
            for (let x = 0; x < result.length; x++) {
                if (!allergies.find(el => result[x].Allergy_Name === el))
                    removedAll.push(result[x].Allergy_ID);
            }
            console.log("removed allergies" + removedAll);
            var sql = "Delete FROM patientallergy WHERE Patient_ID=? AND Allergy_ID=?";
            for (let i = 0; i < removedAll.length; i++) {
                con.query(sql, [id, removedAll[i]], function (er, resul) {
                    if (er) {
                        console.log(er);
                    }
                });
            }
            var sql = "SELECT Allergy_ID,Allergy_Name FROM allergy";
            let newIDs = [];
            con.query(sql, function (er, resu) {
                for (let x = 0; x < newAllergies.length; x++) {
                    var sq = "INSERT INTO patientallergy VALUES (?,?)";
                    let v = resu.find(({Allergy_Name}) => Allergy_Name === newAllergies[x]).Allergy_ID;
                    console.log(v);
                    con.query(sq, [id, v], function (er, resul) {
                        if (er) {
                            console.log(er);
                        }
                    });
                }
            });
        });
    }
});

app.get("/patient/my_appointments", function (req, res) {
    if (req.headers && req.headers.authorization) {
        var auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        let sql = "SELECT Doctor_Surname, Department_Name, appointment.Ticket_Num, Appointment_Date, Diagnosys_Name, " +
            "Diagnosys_StartDate, Diagnosys_EndDate,Presc_Instruction, Medicine_Name FROM appointment " +
            "INNER JOIN doctor ON doctor.Doctor_ID=appointment.Doctor_ID " +
            "INNER JOIN department on department.Department_ID=doctor.Department_ID " +
            "LEFT OUTER JOIN diagnosting on appointment.Ticket_Num=diagnosting.Ticket_Num " +
            "LEFT OUTER JOIN diagnosys ON diagnosys.Diagnosys_ID=diagnosting.Diagnosys_ID " +
            "LEFT OUTER JOIN prescription ON diagnosys.Diagnosys_ID=prescription.Diagnosys_ID " +
            "LEFT OUTER JOIN prescribed ON prescribed.Prescription_ID=prescription.Prescription_ID " +
            "LEFT OUTER JOIN medicine ON medicine.Medicine_ID=prescribed.Medicine_ID WHERE Patient_ID=?";
        con.query(sql, id, function (err, result) {
            if (err) console.log(err);
            console.log(result);
            substringDate(result);
            res.render("patient_myappointments_view", {
                "appointments": result
            });
        });
    }
});

app.post("/patient/edit", function (req, res) {
    if (req.headers && req.headers.authorization) {
        var auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        let sql = "UPDATE patient SET ? WHERE Patient_ID=?";
        let field ="{"+req.body.editedField+":"+req.body.newValue+"}";
        con.query(sql, [field, id], function (err, result) {
            if (err) console.log(err);
            console.log(result[0]);
            substringDate(result);

        });
    }
});

app.post('/admin/add/patient', function (req, res) {
    if (req.headers && req.headers.authorization) {
        var auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if(role!=1)
        {
            res.json({response:"Fail. No rights to delete"});
        }
        else {
            var sql = "INSERT INTO patient SET ?";
            con.query(sql, req.body.patient, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/delete/patient', function (req, res) {
    if (req.headers && req.headers.authorization) {
        var auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if(role!=1)
        {
            res.json({response:"Fail. No rights to delete"});
        }
        else {
            var sql = "DELETE FROM patient WHERE Patient_ID=?";
            con.query(sql, req.body.id, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/edit/patient', function (req, res) {
    console.log("let`s edit ");
    if (req.headers && req.headers.authorization) {
        var auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if(role!=1)
        {
            res.json({response:"Fail. No rights to delete"});
        }
        else {
            var sql = "UPDATE patient SET ? WHERE Patient_ID=?";
            con.query(sql, [req.body.patient,req.body.patient.id], function (err, result) {
                console.log("updated");
                res.json({res: "success"});
            });
        }
    }
});