function addRow(but) {
    console.log("Add row");
    let $row = $(but).parents('tr');
    console.log("$row");
    console.log($row);
    let failed = false;
    if (!failed) {
        requestToAddAppointmentDB($row);
    }
}

function requestToAddAppointmentDB($row) {
    let tdInfo = [];
    $($row).find('td').find('input').each(function () {
        tdInfo.push($(this).val());
    });

    console.log("tdinfo");
    console.log(tdInfo);
    let med_id =$('#selectedMedicine').attr('id_val');
    let pat_id =$('#selectedPatient').attr('id_val');
    let data = {
        Appointment_Date: tdInfo[0], Patient_ID: pat_id,
        Diagnosys_Name: "", Diagnosys_StartDate: "", Diagnosys_EndDate: "",
        Presc_Instruction: "", Medicine_ID: "",Doctor_ID: ""
    };

    console.log("for ajax - ");
    console.log(data);
    let url = "/doctor/add/appointment";
    let successMsg = "success of " + url;
    sendAjax(url, successMsg, {appointment: data});

    $.ajax({
        type: 'GET',
        headers: {Authorization: sessionStorage.getItem("token")},
        url: '/doctor/my_appointments',
        success: function (response) {
            console.log("/doctor/my_appointments");
            $("body").html(response);
        }
    });
}
