function addDoctorToDepartment(department_ID, name, department_Head, phone, email, photo, specialization, scientific_Degree) {
    let containerId = "#department" + department_ID;
    let d = $(`<div></div>`);
    if (department_Head)
        d.append($(`<p><strong>Завідуючий відділом</strong></p>`));
    d.append($(`<div><p><strong>${name}</strong></p><p>${phone}</p><p>${email}</p><p>${photo}</p><p>${specialization}</p><p>${scientific_Degree}</p></div>`));
    $(containerId).append(d);
}

function getDoctorsofDepartment(id) {
    console.log("id of department - " + id);
    id = id.replace(/\D/g, "");
    $(document).ready(function () {
        $.ajax({
            type: 'GET',
            url: '/doctorsOfDepartment/' + id,
            success: function (response) {
                console.log("success of /doctorsOfDepartment/");
                response.doctors.forEach(d => addDoctorToDepartment(d.Department_ID, d.Doctor_Surname + " " + d.Doctor_Firstname + " " +
                    Doctor_Patronymic, d.Department_Head, d.Doctor_PhoneN, d.Doctor_eAddress, d.Doctor_Photo,
                    d.Doctor_Specialization, d.Scientific_Degree));

            }
        });
    });
}