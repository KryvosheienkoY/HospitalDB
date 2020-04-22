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
    row.attr('id', '');
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
    let $row = $(but).parents('tr');
    let $cols = $row.find('td');
    let failed = false;
    IterarCamposEdit($cols, function ($td) {
        let cont = $td.find('input').val();
        let i = but.id.replace(/\D/g, "");
        if (!((i === '3' && !phoneRegex.test(cont)) || (i === '4' && !emailRegex.test(cont)))) {
            $td.html(cont);
        }
        else {
            failed = true;
            return;
        }
    });
    if (!failed) {
        FijModoNormal(but.id);
        console.log("row accepted - " + but.id);
        requestToEditMyProfileDoctorDB(but.id);
    }
}


function requestToEditMyProfileDoctorDB(btnid) {
    let id = btnid.replace(/\D/g, "");
    let idTd = "#td" + id;
    console.log('tdId - ' + idTd);
    let newData = $(idTd).html();
    console.log("newdata - " + newData);
    let editedField;
    console.log("id - " + id);
    switch (id) {
        case '1':
            editedField = "Doctor_Surname";
            break;
        case '3':
            editedField = "Doctor_PhoneN";
            break;
        case '4':
            editedField = "Doctor_eAddress";
            break;
        default:
            console.log("error id");
            return;
    }
    let dat = { fieldName: editedField , newValue:  newData};
    let url ='/doctor/edit/';
    let successMsg = "success of "+url;
    console.log("for ajax - " + dat);
    sendAjax(url,successMsg,dat);
}

function rowEdit(but) {  //Inicia la edición de una fila
    let $row = $(but).parents('tr');  //accede a la fila
    let $cols = $row.find('td');  //lee campos
    IterarCamposEdit($cols, function ($td) {  //itera por la columnas
        let cont = $td.html(); //lee contenido
        let div = '<div style="display: none;">' + cont + '</div>';  //guarda contenido
        let input;
        if (but.id === 'bEdit3') {
            input = '<input  type="tel" pattern="[0-9]{10}" class="form-control input-sm"  value="' + cont + '">';
        }
        else if (but.id === 'bEdit4') {
            input = '<input  type="email" class="form-control input-sm"  value="' + cont + '">';
        }
        else {
            input = '<input class="form-control input-sm"  value="' + cont + '">';
        }

        $td.html(div + input);
    });
    FijModoEdit(but.id);
}