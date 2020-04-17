function getDoctorsofDepartment(id) {
    console.log("id of department - "+id);
    id=id.replace(/\D/g, "");
    $(document).ready(function () {
        $.ajax({
            type: 'GET',
            url: '/doctorsOfDepartment/'+id,
            success: function (response) {
                console.log("success of /doctorsOfDepartment/");
                console.log(response);

            }
        });
    });
}