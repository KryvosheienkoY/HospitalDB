function applyAllergies() {
    let checkboxes = $('input');
    let patient_allergies = [];
    console.log('checkbox');
    console.log(checkboxes);
    // loop over them all
    for (let i = 0; i < checkboxes.length; i++) {
        // And stick the checked ones onto an array...
        if (checkboxes[i].checked) {
            console.log("checked -"+checkboxes[i]);
            let id = checkboxes[i].id.replace(/\D/g, "");
            let allergy = $("#allergy" + id).html();
            patient_allergies.push(allergy);
        }
    }
    console.log("patient_allergies");
    console.log(patient_allergies);
    $.ajax({
        type: 'post',
        headers: {Authorization: sessionStorage.getItem("token")},
        data: patient_allergies,
        url: '/patient/allergies',
        success: function (response) {
            console.log("success of /patient/my_profile/");

        }
    });
}