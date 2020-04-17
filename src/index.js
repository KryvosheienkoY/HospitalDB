const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use('/', express.static(__dirname + '/../public'));
app.listen(8080);

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

