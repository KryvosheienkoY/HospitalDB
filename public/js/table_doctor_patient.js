$(".dropdownPatientsD li a").click(function () {
    console.log("dropdown");
    let selText = $(this).text();
    let selId = $(this).attr('id_val');
    console.log(selId + " - selId");
    $(this).parents('.btn-group').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
    $('#selectedPatientD').attr('id_val', selId);

    //send ajax for allergies

    let dat = { Patient_ID: selId};
    let url ='/doctor/allergy_Patients';
    let successMsg = "success of "+url;
    console.log("for ajax - ");
    console.log(dat);
        $.ajax({
            type: 'GET',
            headers: {Authorization: sessionStorage.getItem("token")},
            data:dat,
            url: url,
            success: function (response) {
                //get allergies string, allergies num
                console.log("successful ajax - " + url);
                $("#allergiesTd").html(response.allergies);
                $("#allergiesNumTd").html(response.num);
            }
        });
});