function addRow(but) {
    console.log("Add row");
    let $row = $(but).parents('tr');
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
    let data = {
        Appointment_Date: tdInfo[0], Patient_Surname: tdInfo[1],
        Diagnosys_Name: tdInfo[2], Diagnosys_StartDate: tdInfo[3], Diagnosys_EndDate: tdInfo[4],
        Presc_Instruction: tdInfo[5], Medicine_Name: tdInfo[6], Medicine_Type: tdInfo[7],
        Presc_Required: tdInfo[8], Medical_Form: tdInfo[9], Doctor_ID: ""
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