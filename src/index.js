const express = require('express');
const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use('/', express.static(__dirname + '/../public'));
app.use('/patient', express.static(__dirname + '/../public'));
app.use('/doctor', express.static(__dirname + '/../public'));
//app.set('views', 'C:/Users/USER/WebstormProjects/HospitalDB/src/views');
app.listen(8080);
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
let mysql = require('mysql');
let tok;
let role;
let Secret = '50b4368372758102491d90d066f2368b400d64637291c8a9ffec2fa2a0da5d224420d17b47ce8cff8dac5cdd0f7a47079e4dceb698e4397278f091cb9d6c560b';
let con = mysql.createConnection({
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

app.get('/admin/patient_table', (req, res) => {
    let sql = "Select * FROM `patient`";
    con.query(sql, function (err, result) {
        substringDate(result);
        res.render('admin_view_patient', {"patients": result});
    });

});

app.get('/admin/doctor_table', (req, res) => {
    let sql = "Select * FROM `doctor`";
    con.query(sql, function (err, result) {
        substringDate(result);
        res.render('admin_view_doctor', {"doctors": result});
    });

});


app.get('/patient', (req, res) => {
    res.render('main_patient_view');
});
app.get('/doctor', (req, res) => {
    res.render('main_doctor_view');
});
app.get("/doctor/my_profile", function (req, res) {
    console.log("doctor/myprofile get");
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        let sql = "SELECT * FROM patient WHERE Patient_ID=?";
        con.query(sql, id, function (err, result) {
            if (err) console.log(err);
            console.log(result[0]);
            substringDate(result);
            let sql1 = "SELECT COUNT(DISTINCT Ticket_Num) AS tot FROM appointment WHERE Doctor_ID=? GROUP BY Doctor_ID";
            con.query(sql1, id, function (er, appointments) {
                let sql2 = "SELECT * FROM workday WHERE Doctor_ID=?";
                con.query(sql2, id, function (e, workdays) {
                    let sql3 = "SELECT Department_Name, department.Department_ID, Doctor_ID, Doctor_Surname,Doctor_Firstname,Doctor_Patronymic, Department_Head, Doctor_PhoneN, Doctor_eAddress, Doctor_Specialization, Scientific_Degree FROM doctor INNER JOIN department ON doctor.Department_ID=department.Department_ID WHERE Doctor_ID=?";
                    con.query(sql3, id, function (error, docres) {
                        console.log("rendering doctor_myprofile_view");
                        console.log(docres);
                        console.log("id - " + id);
                        console.log("appointments - ");
                        console.log(appointments);
                        res.render("doctor_myprofile_view", {
                            doctor: docres[0],
                            appointments: appointments[0].tot,
                            schedule: workdays
                        });
                    });
                });
            });
        });
    }
});


app.get("/doctor/my_appointments", function (req, res) {
    console.log("doctor/myappointments get");
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        console.log("id"+id);
        let sql = "SELECT Medicine_ID, Medicine_Name FROM medicine";
        con.query(sql, id, function (er, medicine) {
            let sql1 = "SELECT Patient_Surname, Patient_Firstname, Patient_Patronymic, appointment.Ticket_Num, Appointment_Date, Diagnosys_Name, Diagnosys_StartDate, Diagnosys_EndDate,Presc_Instruction, Medicine_Name FROM appointment INNER JOIN patient ON patient.Patient_ID=appointment.Patient_ID LEFT OUTER JOIN diagnosting on appointment.Ticket_Num=diagnosting.Ticket_Num LEFT OUTER JOIN diagnosys ON diagnosys.Diagnosys_ID=diagnosting.Diagnosys_ID LEFT OUTER JOIN prescription ON diagnosys.Diagnosys_ID=prescription.Diagnosys_ID LEFT OUTER JOIN prescribed ON prescribed.Prescription_ID=prescription.Prescription_ID LEFT OUTER JOIN medicine ON medicine.Medicine_ID=prescribed.Medicine_ID WHERE Doctor_ID=?";
            con.query(sql1, id, function (er, appointments) {
                let sql2 = "SELECT Patient_ID, Patient_Surname, Patient_Firstname, Patient_Patronymic,Patient_Phone_N FROM patient WHERE Patient_ID IN (SELECT Patient_ID FROM appointment WHERE Doctor_ID=?)";
                con.query(sql2, id, function (e, patients) {

                    console.log("rendering doctor_myprofile_view");
                     console.log(appointments);
                    // console.log("id - "+appointments);
                    res.render("doctor_myappointments_view", {
                        appointments: appointments,
                        medicine:medicine,
                        patients: patients
                    });
                });
            });
        });
    }
});
app.get('/doctor/patients', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 2) {
            res.json({response: "Fail. No rights to delete"});
        }

        let sql = "SELECT Patient_ID, Patient_Surname, Patient_Firstname, Patient_Patronymic, Patient_PhoneN FROM patient";
        con.query(sql, function (e, patients) {

            // res.json({patients : patients});
            res.render('doctor_patient_view',{patients : patients});
        });
    }
});

app.get('/doctor/allergy_Patients', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 2) {
            res.json({response: "Fail. No rights to delete"});
        }
        let sql1 = "SELECT Count(Distinct Allergy_ID) AS counter FROM patientallergy WHERE Patient_ID=?)";
        con.query(sql1, req.body.Patient_ID, function (e, count) {
            let sql2 = "SELECT Allergy_Name FROM allergy WHERE Allergy_ID IN(SELECT Allergy_ID FROM patientallergy WHERE Patient_ID=?)";
            con.query(sql2, req.body.Patient_ID, function (e, allergies) {
                let str;

                console.log("body - ");
                console.log(req.body);
                console.log("patient id - " +req.body.Patient_ID);
                console.log("patient allergies - ");
                console.log(allergies);
                for (let i=0; i<allergies.length; i++)
                {
                    if(i>0)
                    {
                        str+=", ";
                    }
                    str+=allergies[i].Allergy_Name;
                }
                res.json({ allergies: str, num : count[0].counter});
            });
        });
    }
});

app.post('/doctor/add/appointment', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 2) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            let sql = "INSERT INTO appointment SET ?";
            con.query(sql, {
                Appointment_Date: req.body.appointment.Appointment_Date, Doctor_ID : id, Patient_ID:  req.body.appointment.Patient_ID
            }, function (err, result) {
                let appoint_id = result.insertId;
                let sql1 = "INSERT INTO diagnosys SET ?";
                con.query(sql1, {
                    Diagnosys_Name:  req.body.appointment.Diagnosys_Name, Diagnosys_StartDate: req.body.appointment.Diagnosys_StartDate, Diagnosys_EndDate: req.body.appointment.Diagnosys_EndDate,

                }, function (err, resul) {
                    let diagnosys_id=resul.insertId;
                    let sql2 = "INSERT INTO diagnosed SET ?";
                    con.query(sql2, {
                        Ticket_Num: appoint_id, Diagnosys_ID : diagnosys_id
                    }, function (err, resu) {
                        let sql3 = "INSERT INTO prescription SET ?";
                        con.query(sql3, {
                            Presc_Instruction: req.body.appointment.Presc_Instruction, Diagnosys_ID : diagnosys_id
                        }, function (err, re) {
                            let presc_id=re.insertId;
                            let sql4 = "INSERT INTO prescribed SET ?";
                            con.query(sql4, {
                                Medicine_ID: req.body.appointment.Medicine_ID, Prescription_ID : presc_id
                            }, function (err, r) {

                                res.json({res: "success"});
                            });
                        });

                        res.json({res: "success"});
                    });

                });

            });

        }
    }
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

app.get('/doctor/our_departments', function (req, res) {
    con.query("SELECT * FROM `department`", function (err, result) {
        res.render('our_departments_doctor_view', {
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
    let sql = "SELECT * FROM user WHERE Username=?";
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
    let sql = "SELECT * FROM user WHERE Username=?";
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
                console.log("FKS" + result[0].Patient_ID + "   " + result[0].Doctor_ID);
                if (result[0].Patient_ID == null && result[0].Doctor_ID == null) {
                    let user = {role: 1, id: -1};
                    const token = jwt.sign(user, Secret, jwt.HS256);
                    res.render('admin', {
                        "token": token
                    });
                } else if (result[0].Patient_ID == null) {
                    let user = {role: 2, id: result[0].Doctor_ID};
                    const token = jwt.sign(user, Secret);
                    res.render('login_result_doctor_view', {
                        "result": "success",
                        "token": token
                    });
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
    let sql = "Select * FROM `doctor` WHERE Department_ID =?";
    let idParam = req.params.id;
    con.query(sql, idParam, function (err, result) {
        res.json({"doctors": result});
    });
});

app.get('/delete/(:table)/(:id)', function (req, res) {
    let sql = "Select * FROM ? WHERE Department_ID =?";
    con.query(sql, [req.param.table, req.param.id], function (err, result) {
        res.json({"doctors": result});
    });
});

function substringDate(result) {
    for (let i = 0; i < result.length; ++i) {
        result[i].Patient_Birthdate = ("" + result[i].Patient_Birthdate).substring(0, 15);
        result[i].Diagnosys_StartDate = ("" + result[i].Diagnosys_StartDate).substring(0, 15);
        result[i].Diagnosys_EndDate = ("" + result[i].Diagnosys_EndDate).substring(0, 15);
        result[i].Workday_StartTime = ("" + result[i].Diagnosys_EndDate).substring(0, 15);
        result[i].Workday_EndTime = ("" + result[i].Diagnosys_EndDate).substring(0, 15);
        result[i].Appointment_Date = ("" + result[i].Appointment_Date).substring(0, 15);
    }
}

app.get("/patient/my_profile", function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        let sql = "SELECT * FROM patient WHERE Patient_ID=?";
        con.query(sql, id, function (err, result) {
            if (err) console.log(err);
            console.log(result[0]);
            substringDate(result);
            let sql = "SELECT * FROM analysis WHERE Patient_ID=?";
            con.query(sql, id, function (er, resul) {
                let sql = "SELECT Allergy_Name FROM allergy INNER JOIN patientallergy ON allergy.Allergy_ID=patientallergy.Allergy_ID WHERE Patient_ID=?";
                con.query(sql, id, function (e, resu) {
                    let sql = "SELECT Allergy_Name FROM allergy WHERE Allergy_ID NOT IN (SELECT Allergy_ID FROM patientallergy WHERE Patient_ID= ?)";

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
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        let allergies = req.body.allergies;
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
            let sql = "Delete FROM patientallergy WHERE Patient_ID=? AND Allergy_ID=?";
            for (let i = 0; i < removedAll.length; i++) {
                con.query(sql, [id, removedAll[i]], function (er, resul) {
                    if (er) {
                        console.log(er);
                    }
                });
            }
            sql = "SELECT Allergy_ID,Allergy_Name FROM allergy";
            let newIDs = [];
            con.query(sql, function (er, resu) {
                for (let x = 0; x < newAllergies.length; x++) {
                    let sq = "INSERT INTO patientallergy VALUES (?,?)";
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
        let auth = req.headers.authorization;
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
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        console.log(req.body);
        let sql = "UPDATE patient SET ? WHERE Patient_ID=?";

        let field = "{ \"" + req.body.fieldName + "\":\"" + req.body.newValue + "\"}";
        console.log(field);
        let x = JSON.parse(field);
        con.query(sql, [x, id], function (err, result) {
            if (err) console.log(err);
        });
    }
});

app.post('/admin/add/patient', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            let sql = "INSERT INTO patient SET ?";
            con.query(sql, req.body.patient, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/delete/patient', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {

            let sql = "DELETE FROM patient WHERE Patient_ID=?";
            con.query(sql, req.body.id, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/edit/patient', function (req, res) {
    console.log("let`s edit ");
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        console.log(role);
        if (role != 1) {
            console.log("not correct role");
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            console.log("editing");
            console.log(req.body.patient);
            let sql = "UPDATE patient SET ? WHERE Patient_ID=?";
            con.query(sql, [req.body.patient, req.body.patient.Patient_ID], function (err, result) {
                console.log("updated");
                res.json({res: "success"});
            });
        }
    }
    else {
        console.log("not authorised");
    }
});

app.post('/admin/add/doctor', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            let sql = "INSERT INTO doctor SET ?";
            con.query(sql, req.body.doctor, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/delete/doctor', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {

            let sql = "DELETE FROM doctor WHERE Doctor_ID=?";
            con.query(sql, req.body.id, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/edit/doctor', function (req, res) {
    console.log("let`s edit ");
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        console.log(role);
        if (role != 1) {
            console.log("not correct role");
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            console.log("editing");
            console.log(req.body.doctor);
            let sql = "UPDATE doctor SET ? WHERE Doctor_ID=?";
            con.query(sql, [req.body.doctor, req.body.doctor.Doctor_ID], function (err, result) {
                console.log("updated");
                res.json({res: "success"});
            });
        }
    }
    else {
        console.log("not authorised");
    }
});

app.post('/admin/add/department', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            let sql = "INSERT INTO department SET ?";
            con.query(sql, req.body.department, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/delete/department', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {

            let sql = "DELETE FROM department WHERE Department_ID=?";
            con.query(sql, req.body.id, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/edit/department', function (req, res) {
    console.log("let`s edit ");
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        console.log(role);
        if (role != 1) {
            console.log("not correct role");
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            console.log("editing");
            console.log(req.body.patient);
            let sql = "UPDATE department SET ? WHERE Department_ID=?";
            con.query(sql, [req.body.department, req.body.department.Department_ID], function (err, result) {
                console.log("updated");
                res.json({res: "success"});
            });
        }
    }
    else {
        console.log("not authorised");
    }
});

app.post('/admin/add/appointment', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            let sql = "INSERT INTO appointment SET ?";
            con.query(sql, req.body.appointment, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/delete/appointment', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {

            let sql = "DELETE FROM appointment WHERE Ticket_Num=?";
            con.query(sql, req.body.id, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/edit/appointment', function (req, res) {
    console.log("let`s edit ");
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        console.log(role);
        if (role != 1) {
            console.log("not correct role");
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            console.log("editing");
            console.log(req.body.patient);
            let sql = "UPDATE appointment SET ? WHERE Ticket_Num=?";
            con.query(sql, [req.body.appointment, req.body.appointment.Ticket_Num], function (err, result) {
                console.log("updated");
                res.json({res: "success"});
            });
        }
    }
    else {
        console.log("not authorised");
    }
});

app.post('/admin/add/allergy', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            let sql = "INSERT INTO allergy SET ?";
            con.query(sql, req.body.allergy, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/delete/allergy', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {

            let sql = "DELETE FROM allergy WHERE Allergy_ID=?";
            con.query(sql, req.body.id, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/edit/allergy', function (req, res) {
    console.log("let`s edit ");
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        console.log(role);
        if (role != 1) {
            console.log("not correct role");
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            console.log("editing");
            console.log(req.body.patient);
            let sql = "UPDATE allergy SET ? WHERE Allergy_ID=?";
            con.query(sql, [req.body.allergy, req.body.allergy.Allergy_ID], function (err, result) {
                console.log("updated");
                res.json({res: "success"});
            });
        }
    }
    else {
        console.log("not authorised");
    }
});

app.post('/admin/add/diagnosys', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            let sql = "INSERT INTO diagnosys SET ?";
            con.query(sql, req.body.diagnosys, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/delete/diagnosys', function (req, res) {
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        if (role != 1) {
            res.json({response: "Fail. No rights to delete"});
        }
        else {

            let sql = "DELETE FROM diagnosys WHERE Diagnosys_ID=?";
            con.query(sql, req.body.id, function (err, result) {
                res.json({res: "success"});
            });
        }
    }
});
app.post('/admin/edit/diagnosys', function (req, res) {
    console.log("let`s edit ");
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization;
        let {role, id} = jwt.verify(auth, Secret);
        console.log(role);
        if (role != 1) {
            console.log("not correct role");
            res.json({response: "Fail. No rights to delete"});
        }
        else {
            console.log("editing");
            console.log(req.body.patient);
            let sql = "UPDATE diagnosys SET ? WHERE Diagnosys_ID=?";
            con.query(sql, [req.body.diagnosys, req.body.diagnosys.Diagnosys_ID], function (err, result) {
                console.log("updated");
                res.json({res: "success"});
            });
        }
    }
    else {
        console.log("not authorised");
    }
});

