
$(".dropdownPatients li a").click(function () {
    console.log("dropdown");
    let selText = $(this).text();
    let selId = $(this).attr('id_val');
    console.log(selId + " - selId");
    $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    $('#selectedPatient').attr('id_val', selId);

    //send ajax for allergies

    let dat = { Patient_ID: selId};
    let url ='/doctor/allergy_Patients';
    let successMsg = "success of "+url;
    console.log("for ajax - " + dat);
        $.ajax({
            type: 'GET',
            headers: {Authorization: sessionStorage.getItem("token")},
            url: url,
            success: function (response) {
                //get allergies string, allergies num
                console.log("successful ajax - " + url);
                $("#allergiesTd").
            }
        });
});