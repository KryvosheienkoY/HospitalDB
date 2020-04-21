
function requestToEditDoctorDB(btnid) {
    let id = btnid.replace(/\D/g, "");
    let idTr = "#" + id + "editing";
    console.log('trId - ' + idTr);
    let tdInfo = [];
    console.log($(idTr));
    $(idTr).find('td').each(function () {
        tdInfo.push($(this).html());
    });

    let data = [{Doctor_ID: tdInfo[0]}, {Department_ID: tdInfo[1]}, {Doctor_Surname: tdInfo[2]},
        {Doctor_Firstname: tdInfo[3]}, {Doctor_Patronymic: tdInfo[4]}, {Department_Head: tdInfo[5]},
        {Doctor_PhoneN: tdInfo[6]}, {Doctor_eAddress: tdInfo[7]}, {Doctor_Photo: tdInfo[8]},
        {Doctor_Specialization: tdInfo[9]}, {Scientific_Degree: tdInfo[10]}];

    console.log("for ajax - ");
    console.log(data);
    let url;
    $.ajax({
        type: 'Post',
        data: data,
        url: url,
        success: function (response) {
            console.log("success of edit my profile of Doctor");
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
       // params.onEdit($row);
        console.log("row accepted - " + but.id);
        requestToEditDoctorDB(but.id);
    }
}