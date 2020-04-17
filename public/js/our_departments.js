function addDoctorToDepartment(department_ID, name, department_Head, phone, email, photo, specialization, scientific_Degree) {
    let containerDoctorId = "#containerDoctor" + department_ID;
    console.log("photo-");
    console.log(photo);

    let bytes = new Uint8Array(photo.data.length / 2);
    for (var i = 0; i < photo.data.length; i += 2) {
        bytes[i / 2] = parseInt(photo.data.join('').substring(i, i + 2), /* base = */ 16);
    }
// Make a Blob from the bytes
    let blob = new Blob([bytes], {type: 'image/bmp'});

// Use createObjectURL to make a URL for the blob
    let image = new Image();
    image.src = URL.createObjectURL(blob);
    $(containerDoctorId).append(image);
    if (department_Head)
        $(containerDoctorId).append($(`<p><strong>Завідуючий відділом</strong></p>`));
    $(containerDoctorId).append($(`<p><strong>${name}</strong></p><p>${phone}</p><p>${email}</p>
                                                             <p>${specialization}</p><p>${scientific_Degree}</p>`));

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
                let containerDoctorId = "#containerDoctor" +  response.doctors[0].Department_ID;
                if ($(containerDoctorId).is(':empty')) {
                    response.doctors.forEach(d => addDoctorToDepartment(d.Department_ID, d.Doctor_Surname + " " + d.Doctor_Firstname + " " +
                        d.Doctor_Patronymic, d.Department_Head, d.Doctor_PhoneN, d.Doctor_eAddress, d.Doctor_Photo,
                        d.Doctor_Specialization, d.Scientific_Degree));
                }
                else {
                    $(containerDoctorId).empty();
                }

            }
        });
    });
}