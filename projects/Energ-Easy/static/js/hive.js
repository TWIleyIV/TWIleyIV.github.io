function pullRegionData() {
    $.ajax({ 
        dataType: "json",
        url: "../regiondata/",
        success: function(data) {
            console.log("success")
        },
        error: function(xhr, ajaxOptions, thrownError) {
            console.log(xhr.status);
            console.log(xhr.responseText);
            console.log(thrownError);
        }
    });
}
