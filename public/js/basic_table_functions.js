
"use strict";
//Global variables
let params = null;  		//Parameters
let colsEdi = null;
let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
let phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
$.fn.SetEditable = function (cols,options) {
    let defaults = {
        columnsEd: cols,         //Index to editable columns. If null all td editables. Ex.: "1,2,3,4,5"
        $addButton: null,        //Jquery object of "Add" button
        onEdit: function () {
            console.log("edited")
        },   //Called after edition
        onBeforeDelete: function () {
        }, //Called before deletion
        onDelete: function () {
        }, //Called after deletion
        onAdd: function () {
        }     //Called when added a new row
    };
    params = $.extend(defaults, options);

    let $tabedi = this;   //Read reference to the current table, to resolve "this" here.
    //Process "addButton" parameter
    if (params.$addButton != null) {
        //Se proporcionó parámetro
        params.$addButton.click(function () {
            rowAddNew($tabedi.attr("id"));
        });
    }
    //Process "columnsEd" parameter
    if (params.columnsEd != null) {
        //Extract felds
        colsEdi = params.columnsEd.split(',');
    }
};

function IterarCamposEdit($cols, tarea) {
//Itera por los campos editables de una fila
    let n = 0;
    $cols.each(function () {
        n++;
        if ($(this).attr('name') == 'buttons') return;  //excluye columna de botones
        if (!EsEditable(n - 1)) return;   //noe s campo editable
        tarea($(this));
    });

    function EsEditable(idx) {
        //Indica si la columna pasada está configurada para ser editable
        if (colsEdi == null) {  //no se definió
            return true;  //todas son editable
        } else {  //hay filtro de campos
//alert('verificando: ' + idx);
            for (let i = 0; i < colsEdi.length; i++) {
                if (idx == colsEdi[i]) return true;
            }
            return false;  //no se encontró
        }
    }
}

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
    let idd= row.attr('id')+"editing".replace(/\D/g, "");
    row.attr('id', idd);  //quita marca
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
    let idd= row.attr('id')+"editing";
    row.attr('id', idd);
}

function ModoEdicion($row) {
    if ($row.attr('id').replace(/[0-9]/g, '') == 'editing') {
        return true;
    } else {
        return false;
    }
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

function rowDelete(but) {  //Deleteina la fila actual
    let $row = $(but).parents('tr');  //accede a la fila
    params.onBeforeDelete($row);
    $row.remove();
    params.onDelete();
}

function rowAddNew(tabId) {  //Agrega fila a la tabla indicada.
    let $tab_en_edic = $("#" + tabId);  //Table to edit
    let $filas = $tab_en_edic.find('tbody tr');
    if ($filas.length == 0) {
        //No hay filas de datos. Hay que crearlas completas
        let $row = $tab_en_edic.find('thead tr');  //encabezado
        let $cols = $row.find('th');  //lee campos
        //construye html
        let htmlDat = '';
        $cols.each(function () {
            if ($(this).attr('name') == 'buttons') {
                //Es columna de botones
                htmlDat = htmlDat + colEdicHtml;  //agrega botones
            } else {
                htmlDat = htmlDat + '<td></td>';
            }
        });
        $tab_en_edic.find('tbody').append('<tr>' + htmlDat + '</tr>');
    } else {
        //Hay otras filas, podemos clonar la última fila, para copiar los botones
        let $ultFila = $tab_en_edic.find('tr:last');
        $ultFila.clone().appendTo($ultFila.parent());
        $ultFila = $tab_en_edic.find('tr:last');
        let $cols = $ultFila.find('td');  //lee campos
        $cols.each(function () {
            if ($(this).attr('name') == 'buttons') {
                //Es columna de botones
            } else {
                $(this).html('');  //limpia contenido
            }
        });
    }
    params.onAdd();
}

function TableToCSV(tabId, separator) {  //Convierte tabla a CSV
    let datFil = '';
    let tmp = '';
    let $tab_en_edic = $("#" + tabId);  //Table source
    $tab_en_edic.find('tbody tr').each(function () {
        //Termina la edición si es que existe
        if (ModoEdicion($(this))) {
            $(this).find('#bAcep').click();  //acepta edición
        }
        let $cols = $(this).find('td');  //lee campos
        datFil = '';
        $cols.each(function () {
            if ($(this).attr('name') == 'buttons') {
                //Es columna de botones
            } else {
                datFil = datFil + $(this).html() + separator;
            }
        });
        if (datFil != '') {
            datFil = datFil.substr(0, datFil.length - separator.length);
        }
        tmp = tmp + datFil + '\n';
    });
    return tmp;
}


