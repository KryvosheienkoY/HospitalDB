// $(document).ready(function () {
//     let contentDiv = $("#content");
//     $.ajax({
//         type: 'GET',
//         url: '/departments',
//         success: function (data) {
//             console.log(data);
//             data.departments.forEach(d => addDepartment(d.Department_ID, d.Department_Name, d.Department_PhoneN, d.Department_City, d.Department_Street, d.Department_Building, d.Department_Index));
//         }
//     });
// });
//
//
// function addDepartment(Department_ID, Department_Name, Department_PhoneN, Department_City, Department_Street, Department_Building, Department_Index) {
//
//     contentDiv.append($(`<div id="department${Department_ID}"> <p>${Department_Name}</p> <p>Телефон: ${Department_PhoneN}</p> <p>Місто: {Department_City}</p></div>';
//     `));
// }
