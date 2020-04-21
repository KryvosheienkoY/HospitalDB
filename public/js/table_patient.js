function requestToEditPatientBD(btnid) {
    let id = btnid.replace(/\D/g, "");
    let idTr = "#" + id + "editing";
    console.log('trId - ' + idTr);
    let tdInfo = [];
    console.log($(idTr));
    $(idTr).find('td').each(function () {
        tdInfo.push($(this).html());
    });

    let data = {
        Patient_ID: tdInfo[0], Patient_Surname: tdInfo[1], Patient_Firstname: tdInfo[2],
        Patient_Patronymic: tdInfo[3], Patient_City: tdInfo[4], Patient_Street: tdInfo[5],
        Patient_Building: tdInfo[6], Patient_Apt: tdInfo[7], Patient_Index: tdInfo[8],
        Patient_PhoneN: tdInfo[9], Patient_BloodType: tdInfo[10], Patient_Rhesus: tdInfo[11],
        Patient_Birthdate: tdInfo[12], Patient_eAddress: tdInfo[13], Patient_Notes: tdInfo[14]
    };

    console.log("for ajax - ");
    console.log(data);
    let url = "/admin/edit/patient";
    let successMsg = "success of " + url;
    sendAjax(url, successMsg, {patient: data});
}

function rowEdit(but) {  //Inicia la edición de una fila
    let $row = $(but).parents('tr');  //accede a la fila
    let $cols = $row.find('td');  //lee campos

    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        let cont = $td.html(); //lee contenido
        let div = '<div style="display: none;">' + cont + '</div>';  //guarda contenido
        let input;
        input = '<input class="form-control input-sm"  value="' + cont + '" style="padding: 0">';
        $td.html(div + input);  //fija contenido
    });
    FijModoEdit(but.id);
}

function rowAcep(but) {
    let $row = $(but).parents('tr');
    let $cols = $row.find('td');
    if (!ModoEdicion($row)) return;
    let failed = false;
    IterarCamposEdit($cols, function ($td) {
        let cont = $td.find('input').val();
        $td.html(cont);
    });
    if (!failed) {
        FijModoNormal(but.id);
        // params.onEdit($row);
        console.log("row accepted - " + but.id);
        requestToEditPatientBD(but.id);
    }
}

function requestToDeletePatientBD(row) {
    let p = row.find('td');
    console.log(p);
    let patientID = $(p[0]).text();
    let data = {id: patientID};
    console.log("for ajax - ");
    console.log(data);
    let url = "/admin/delete/patient";
    let successMsg = "success of " + url;
    sendAjax(url, successMsg, data);
}

function rowDelete(but) {
    let $row = $(but).parents('tr');
    requestToDeletePatientBD($row);
    // params.onBeforeDelete($row);
    $row.remove();
    // params.onDelete();

}

function rowCancel(but) {
//Rechaza los cambios de la edición
    let $row = $(but).parents('tr');  //accede a la fila
    let $cols = $row.find('td');  //lee campos
    if (!ModoEdicion($row)) return;  //Ya está en edición
    //Está en edición. Hay que finalizar la edición
    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        let cont = $td.find('div').html(); //lee contenido del div
        $td.html(cont);  //fija contenido y Deleteina controles
    });
    FijModoNormal(but.id);
}


function addRow(but) {
    console.log("Add row");
    let $row = $(but).parents('tr');
    let $cols = $row.find('td');
    let failed = false;
    // IterarCamposEdit($cols, function ($td) {
    //     let cont = $td.find('input').val();
    //     $td.html(cont);
    // });dx2 1err34
    if (!failed) {
        requestToAddPatientBD($row);
    }
}

function requestToAddPatientBD($row) {
   let tdInfo=[];
    $($row).find('td').find('input').each(function () {
        tdInfo.push($(this).val());
    });

    console.log("tdinfo");
    console.log(tdInfo);
    let data = { Patient_Surname: tdInfo[0], Patient_Firstname: tdInfo[1],
        Patient_Patronymic: tdInfo[2], Patient_City: tdInfo[3], Patient_Street: tdInfo[4],
        Patient_Building: tdInfo[5], Patient_Apt: tdInfo[6], Patient_Index: tdInfo[7],
        Patient_PhoneN: tdInfo[8], Patient_BloodType: tdInfo[9], Patient_Rhesus: tdInfo[10],
        Patient_Birthdate: tdInfo[11], Patient_eAddress: tdInfo[12], Patient_Notes: tdInfo[13]
    };

    console.log("for ajax - ");
    console.log(data);
    let url = "/admin/add/patient";
    let successMsg = "success of " + url;
    sendAjax(url, successMsg, {patient: data});

    $.ajax({
        type: 'GET',
        headers: {Authorization: sessionStorage.getItem("token")},
        url: '/admin/patient_table',
        success: function (response) {
            console.log("/admin/patient_table");
            $("body").html(response);
        }
    });

}