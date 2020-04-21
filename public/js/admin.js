function changeTableDisplay(id) {
    let table = $("#table" + id);
    if (table.attr("display") === "none") {
        table.attr("display", "block");
    }
    else {
        table.attr("display", "none");
    }
}