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
        Diagnosys_Name: tdInfo[1], Diagnosys_StartDate: tdInfo[2], Diagnosys_EndDate: tdInfo[3],
        Presc_Instruction: tdInfo[4], Medicine_ID: med_id,Doctor_ID: ""
    };

    console.log("for ajax - ");
    console.log(data);
    let url = "/doctor/add/appointment";
    let successMsg = "success of " + url;
    sendAjax(url, successMsg, {appointment: data});

    $.ajax({
        type: 'GET',
        headers: {Authorization: sessionStorage.getItem("token")},
        url: '/doctor/myappointments',
        success: function (response) {
            console.log("/doctor/myappointments");
            $("body").html(response);
        }
    });
}
