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


app.get('/our_departments', function (req, res) {
    res.render('our_departments_view');
    // const dep = req.department;
    // if (dep == "all") {
    //     con.query("SELECT * FROM doctor", function (err, result) {
    //         response.json({"doctors": result});
    //         console.log("response");
    //     });
    // }
    // else {
    //     var sql = "Select * FROM doctor WHERE Department_ID IN (SELECT Department_ID from department WHERE Department_Name=?)";
    //     con.query(sql, [dep], function (err, result) {
    //         response.json({"doctors": result});
    //         console.log("response");
    //     });
    // }
});

