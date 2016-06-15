function getListing(){
    saleListing = [];
    leaseListing = [];

    $.get('../static/csv/sale.txt', addSales);

    $.get('../static/csv/lease.txt', addLeases);
}

function addSales(data){
    var lines = data.split('\n');
        var s = [];
        for(var i = 2; i < lines.length; i++){
            var sales = lines[i].split('\t');
            s[i] = newSale(sales);

            var myLatlng = new google.maps.LatLng(s[i].lat, s[i].long);
            var marker = new google.maps.Marker({
                icon: "http://maps.google.com/mapfiles/ms/icons/ltblue-dot.png",
                position: myLatlng,
                title: "text " + s[i].long
            });
            google.maps.event.addListener(marker, 'click', (function(marker, i) {
                return function() {
                    var myLatlng = new google.maps.LatLng(s[i].lat, s[i].long);
                    infoWindow.setContent(saleText(s[i]));
                    var anchor = new google.maps.MVCObject();
                    anchor.set("position",myLatlng);
                    infoWindow.open(gmap,anchor);
                }
            })(marker, i));

            saleListing.push(marker);
        }
}

function addLeases(data){
    var lines = data.split('\n');
    var v = [];
    for(var i = 2; i < lines.length; i++){
        var leases = lines[i].split('\t');
        v[i] = newLease(leases);

        var myLatlng = new google.maps.LatLng(v[i].lat, v[i].long);
        var marker = new google.maps.Marker({
            icon: "http://maps.google.com/mapfiles/ms/icons/purple-dot.png",
            position: myLatlng,
            title: "text " + v[i].long
        });
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
            return function() {
                var myLatlng = new google.maps.LatLng(v[i].lat, v[i].long);
                infoWindow.setContent(leaseText(v[i]));
                var anchor = new google.maps.MVCObject();
                anchor.set("position",myLatlng);
                infoWindow.open(gmap,anchor);
            }
        })(marker, i));

        leaseListing.push(marker);
    }
}

function newSale(sales){
    return {
        address: sales[0],
        lat: sales[1],
        long: sales[2],
        type: sales[3],
        propertyType: sales[4],
        subtype: sales[5],
        buildingSize: sales[6],
        lotSize: sales[7],
        bill: sales[8],
        price: sales[9],
        description: sales[10]
    };
}

function newLease(leases){
    return {
        address: leases[0],
        lat: leases[1],
        long: leases[2],
        type: leases[3],
        propertyType: leases[4],
        subtype: leases[5],
        buildingSize: leases[6],
        spaceAvailablity: leases[7],
        bill: leases[8],
        rent: leases[9],
        spaces: leases[10],
        description: leases[11]
    };
}

function saleText(value){
    console.log(value);
    var str = '<div style="line-height:1.35;"> <b> ' + value.address + '</div>'
        + '<div style="line-heigth:1.35;" align="left">';

    if(value.price != ""){
        str += ('Asking Price:</b> ' + value.price);
    }else{
        str += ('Asking Price:</b> ' + "Unlisted");
    }

    str += ('<br> <b>Estimated Monthly Electric Bill:</b> ' + value.bill);

    str += ('<br> <b>Property Type:</b> ' + value.propertyType);

    if(value.subtype != "" && value.subtype != " "){
        str += ('<br><b> Property Subtype:</b> ' + value.subtype );
    }

    if(value.buildingSize){
        str += ('<br><b> Building Size:</b> ' + value.buildingSize );
    }

    if(value.lotSize != ""){
        str += ('<br><b> Lot Size:</b> ' + value.lotSize );
    }

    if(value.description != "" && value.description != " " && value.description != null){
        str += ('<br><b> Description:</b> ' + value.description );
    }

    str += ('</div>');
    return str;
}

function leaseText(value){
    var str = ('<div style="line-height:1.35;"> <b> ' + value.address + '</div>');
    str += '<div style="line-heigth:1.35;" align="left">'

    if(value.price != ""){
        str += ('Asking Rent:</b> ' + value.rent);
    }else{
        str += ('Asking Rent:</b> ' + "Unlisted");
    }

    str += ('<br> <b>Estimated Monthly Electric Bill:</b> ' + value.bill);

    str += ('<br> <b>Property Type:</b> ' + value.propertyType);

    if(value.subtype != "" && value.subtype != " "){
        str += ('<br><b> Property Subtype:</b> ' + value.subtype );
    }

    if(value.buildingSize){
        str += ('<br><b> Building Size:</b> ' + value.buildingSize );
    }

    if(value.spaces != ""){
        str += ('<br><b> Number of Available:</b> ' + value.spaces );
    }

    if(value.spaceAvailablity != ""){
        str += ('<br><b> Space Size:</b> ' + value.spaceAvailablity );
    }

    if(value.description != "" && value.description != " "){
        str += ('<br><b> Description:</b> ' + value.description );
    }

    str += ('</div>');
    return str;
}

function showListings() {
    document.getElementById("ShowOptions").style.setProperty("display","inline");
    for (var i = 0; i < saleListing.length; i++) {
        saleListing[i].setMap(gmap);
    }

    for (var i = 0; i < leaseListing.length; i++) {
        leaseListing[i].setMap(gmap);
    }
}

function showSaleListings() {
    removeLeaseListings();
    for (var i = 0; i < saleListing.length; i++) {
        saleListing[i].setMap(gmap);
    }
}

function showLeaseListings() {
    removeSaleListings()
    for (var i = 0; i < leaseListing.length; i++) {
        leaseListing[i].setMap(gmap);
    }
}

function removeListings() {
    document.getElementById("ShowOptions").style.setProperty("display","none");
    document.getElementById("AllBtn").setAttribute("class","btn btn-default active");
    document.getElementById("SaleBtn").setAttribute("class","btn btn-default");
    document.getElementById("LeaseBtn").setAttribute("class","btn btn-default");

    removeLeaseListings();
    removeSaleListings();
}

function removeSaleListings() {
    for (var i = 0; i < saleListing.length; i++) {
        saleListing[i].setMap(null);
    }
}

function removeLeaseListings() {
    for (var i = 0; i < leaseListing.length; i++) {
        leaseListing[i].setMap(null);
    }
}