
function requestToEditPatientBD(btnid) {
    let id = btnid.replace(/\D/g, "");
    let idTr = "#" + id + "editing";
    console.log('trId - ' + idTr);
    let tdInfo = [];
    console.log($(idTr));
    $(idTr).find('td').each(function () {
        tdInfo.push($(this).html());
    });

    let data = [{Patient_ID: tdInfo[0]}, {Patient_Surname: tdInfo[1]}, {Patient_Firstname: tdInfo[2]},
        {Patient_Patronymic: tdInfo[3]}, {Patient_City: tdInfo[4]}, {Patient_Street: tdInfo[5]},
        {Patient_Building: tdInfo[6]}, {Patient_Apt: tdInfo[7]}, {Patient_PhoneN: tdInfo[8]},
        {Patient_BloodType: tdInfo[9]}, {Patient_Rhesus: tdInfo[10]}, {Patient_Birthdate: tdInfo[11]},
        {Patient_eAddress: tdInfo[12]}, {Patient_Notes: tdInfo[13]},];

    console.log("for ajax - ");
    console.log(data);
    let url ="/admin/edit/patient";
    $.ajax({
        type: 'Post',
        headers: {Authorization: sessionStorage.getItem("token")},
        data: data,
        url: url,
        success: function (response) {
            console.log("success of edit my profile of patient");
        }
    });
}

function rowEdit(but) {  //Inicia la edición de una fila
    let $row = $(but).parents('tr');  //accede a la fila
    let $cols = $row.find('td');  //lee campos
    if (ModoEdicion($row)) return;  //Ya está en edición
    //Pone en modo de edición
    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        let cont = $td.html(); //lee contenido
        let div = '<div style="display: none;">' + cont + '</div>';  //guarda contenido
        let input;
        input = '<input class="form-control input-sm"  value="' + cont + '">';
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
        params.onEdit($row);
        console.log("row accepted - " + but.id);
        requestToEditPatientBD(but.id);
    }
}