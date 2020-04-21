function FijModoNormal(id) {
    let i = id.replace(/\D/g, "");
    let ba = '#bAcep' + i;
    let bc = '#bCanc' + i;
    let be = '#bEdit' + i;
    let bd = '#bDelete' + i;
    $(ba).hide();
    $(bc).hide();
    $(be).show();
    $(bd).show();

    let row = $('#' + id).closest('tr');
    row.attr('id', '');  //quita marca
}

function FijModoEdit(id) {
    let i = id.replace(/\D/g, "");
    let ba = '#bAcep' + i;
    let bc = '#bCanc' + i;
    let be = '#bEdit' + i;
    let bd = '#bDelete' + i;
    $(ba).show();
    $(bc).show();
    $(be).hide();
    $(bd).hide();
    let row = $('#' + id).closest('tr');
    row.attr('id', 'editing');
}


function rowAcep(but) {
//Acepta los cambios de la edición
    let $row = $(but).parents('tr');  //accede a la fila
    let $cols = $row.find('td');  //lee campos
    //f (!ModoEdicion($row)) return;  //Ya está en edición
    //Está en edición. Hay que finalizar la edición
    let failed = false;
    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        let cont = $td.find('input').val();
        let i = but.id.replace(/\D/g, "");
        if (!((i === '7' && !phoneRegex.test(cont)) || (i === '8' && !emailRegex.test(cont)))) {
            $td.html(cont);
        }
        else {
            failed = true;
            return;
        }
        //lee contenido del input
        //fija contenido y Deleteina controles
    });
    if (!failed) {
        FijModoNormal(but.id);
        // doctorsonEdit($row);
        console.log("row accepted - " + but.id);
        requestToEditMyProfilePatientDB(but.id);
    }
}


function requestToEditMyProfilePatientDB(btnid) {
    let id = btnid.replace(/\D/g, "");
    let idTd = "#td" + id;
    console.log('tdId - ' + idTd);
    let newData = $(idTd).html();
    console.log("newdata - " + newData);
    let editedField;
    console.log("id - " + id);
    switch (id) {
        case '1':
            editedField = "Patient_Surname";
            break;
        case '2':
            editedField = "Patient_Street";
            break;
        case '3':
            editedField = "Patient_City";
            break;
        case '4':
            editedField = "Patient_Building";
            break;
        case '5':
            editedField = "Patient_Apt";
            break;
        case '6':
            editedField = "Patient_Index";
            break;
        case '7':
            editedField = "Patient_PhoneN";
            break;
        case '8':
            editedField = "Patient_eAddress";
            break;
        default:
            console.log("error id");
            return;

    }
    let dat = "{fieldName:" + editedField + ", newValue: " + newData + "}";
    let url ='/patient/edit/';
    let successMsg = "success of "+url;
    console.log("for ajax - " + dat);
    sendAjax(url,successMsg,dat);
}

function rowEdit(but) {  //Inicia la edición de una fila
    let $row = $(but).parents('tr');  //accede a la fila
    let $cols = $row.find('td');  //lee campos
   // if (ModoEdicion($row)) return;  //Ya está en edición
    //Pone en modo de edición
    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        let cont = $td.html(); //lee contenido
        let div = '<div style="display: none;">' + cont + '</div>';  //guarda contenido
        let input;
        if (but.id === 'bEdit7') {
            input = '<input  type="tel" pattern="[0-9]{10}" class="form-control input-sm"  value="' + cont + '">';
        }
        else if (but.id === 'bEdit8') {
            input = '<input  type="email" class="form-control input-sm"  value="' + cont + '">';
        }
        else {
            input = '<input class="form-control input-sm"  value="' + cont + '">';
        }

        $td.html(div + input);  //fija contenido
    });
    FijModoEdit(but.id);
}