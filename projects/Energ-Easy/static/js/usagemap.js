function removeLayer(layer) {
    layer.forEach(function(feature) {
        layer.remove(feature);
    });
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        strokeWeight: 2
    });
}

function resetHighLight(e) {
    geojson.resetStyle(e.terget);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighLight
    });
}

function showCounty() {
    removeLayer(outlineLayer);
    outlineLayer.loadGeoJson('../static/geojson/tx_counties.json');
    infoListener.remove();
    currentDrill = "county";
    document.getElementById('census-min').textContent = minVal.toFixed(2);
    document.getElementById('census-max').textContent = "3000 - " + docMaxCount.toFixed(2);
    var index;
    infoListener = outlineLayer.addListener('click', function(event) {
        index = findCounty(event);
        infoWindow.setContent('<div style="line-height:1.35;overflow:hidden;    white-space:nowrap;"> <b>County Name:</b> ' +
        event.feature.getProperty('COUNTY') + "<br/><b>Estimated Energy Usage:</b> " + countyData[index][2] + ' MWh</div>');
        var anchor = new google.maps.MVCObject();
        anchor.set("position",event.latLng);
        infoWindow.open(gmap,anchor);    
    });
    outlineLayer.setStyle(styleOutline);
    outlineLayer.setMap(gmap);
}

function showRegion() {
   removeLayer(outlineLayer);
   outlineLayer.loadGeoJson('../static/geojson/tx_regions_big.json');
   infoListener.remove();
   currentDrill = "region";
   document.getElementById('census-min').textContent = minRegVal;
   document.getElementById('census-max').textContent = "200000 - " + docMaxReg;
   infoListener = outlineLayer.addListener('click', function(event) {
        var index = findRegion(event);
        if(regionData[index][2] == 0.00) {
            infoWindow.setContent('<div style="line-height:1.35;overflow:hidden;    white-space:nowrap;"> <b>Region Name:</b> ' +
            event.feature.getProperty('REGION') + '<br/><b>Estimated Energy Usage:</b> ' + regionData[index][3] + ' MWh</div>');
        } else {
            infoWindow.setContent('<div style="line-height:1.35;overflow:hidden;    white-space:nowrap;"> <b>Region Name:</b> ' +
            event.feature.getProperty('REGION') + '<br/><b>Estimated Energy Usage:</b> ' + regionData[index][3] +
            ' MWh<br/><b>Actual Energy Usage:</b> ' + regionData[index][2] +  ' MWh<br/><b>Delta:</b> ' + regionData[index][4] + '</div>');
        }
        var anchor = new google.maps.MVCObject();
        anchor.set("position",event.latLng);
        infoWindow.open(gmap,anchor);
   });
   outlineLayer.setStyle(styleOutline);
   outlineLayer.setMap(gmap);
}

function showState() {
    removeLayer(outlineLayer);
    infoListener.remove();
    outlineLayer.loadGeoJson('../static/geojson/tx_state.json'); 
    currentDrill = "state";
    document.getElementById('census-min').textContent = minStateVal;
    document.getElementById('census-max').textContent = maxStateVal;
    infoListener = outlineLayer.addListener('click', function(event) {
        var index = findStateTotal(event);
        if(regionData[index][2] == 0.00) {
            infoWindow.setContent('<div style="line-height:1.35;overflow:hidden;    white-space:nowrap;"> <b>State Name:</b> Texas<br/><b>Estimated Energy Usage:</b> ' + regionData[index][3] + ' MWh</div>');
        } else {
            infoWindow.setContent('<div style="line-height:1.35;overflow:hidden;    white-space:nowrap;"> <b>State Name:</b> Texas<br/><b>Estimated Energy Usage:</b> ' + regionData[index][3] +
            ' MWh<br/><b>Actual Energy Usage:</b> ' + regionData[index][2] +  ' MWh<br/><b>Delta:</b> ' + regionData[index][4] + '</div>');
        }
        var anchor = new google.maps.MVCObject();
        anchor.set("position",event.latLng);
        infoWindow.open(gmap,anchor);
    });
    outlineLayer.setStyle(styleOutline);
    outlineLayer.setMap(gmap);
}

function openCountyFile(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
        countyData.push(tarr);
        }
    }
}

function openRegionFile(allText) {
    var allTextLines = allText.split(/\r\n|\n/);
    var headers = allTextLines[0].split(',');
    for (var i=1; i<allTextLines.length; i++) {
        var data = allTextLines[i].split(',');
        if (data.length == headers.length) {
            var tarr = [];
            for (var j=0; j<headers.length; j++) {
                tarr.push(data[j]);
            }
        regionData.push(tarr);
        }
    }
}

function translateMonth(month) {
    var name = "";
    if(month == 0) { name="January"; }
    if(month == 1) { name="February"; }
    if(month == 2) { name="March"; }
    if(month == 3) { name="April"; }
    if(month == 4) { name="May"; }
    if(month == 5) { name="June"; }
    if(month == 6) { name="July"; }
    if(month == 7) { name="August"; }
    if(month == 8) { name="September"; }
    if(month == 9) { name="October"; }
    if(month == 10) { name="November"; }
    if(month == 11) { name="December"; }
    return name;
}

function sumDay(day) {
    var found = "false";
    energyData = [];
    var i;
    for(i = 0; i < lines.length && found == "false"; i++) {
        if(lines[i][1] == day) {
            found = "true";
        }
    }
    i--;
    var j = 0;
    while(lines[i][1] == day) {
        var temp = [];
        var regionName = lines[i][0];
        var actualVal = 0;
        var predVal = 0;
        while(lines[i][0] == regionName) {
            actualVal += +lines[i][3];
            predVal += +lines[i][4];
            i++
        }
        var delta = Math.abs((predVal - actualVal) / actualVal * 100);
        delta = delta.toFixed(2);
        delta += "%";
        temp = new Array(regionName, predVal, actualVal, delta);
        energyData.push(temp);
    }
}

function sumDayHeat(day) {
    energyDataHeat = [];
    var found = "false";
    var i;
    for(i = 0; i < lines.length && found == "false"; i++) {
        if(lines[i][1] == day) {
            found = "true";
        }
    }
    i--;
    var j = 0;
    while(lines[i][1] == day) {
        var temp = [];
        var regionName = lines[i][0];
        var actualVal = 0;
        var predVal = 0;
        while(lines[i][0] == regionName) {
            actualVal += +lines[i][3];
            predVal += +lines[i][4];
            i++
        }
        var delta = Math.abs((predVal - actualVal) / actualVal * 100);
        delta = delta.toFixed(2);
        delta += "%";
        temp = new Array(regionName, predVal, actualVal, delta);
        energyDataHeat.push(temp);
    }
}
function findFCounty(feature) {
     var index = -1;
     var regName = feature.getProperty('COUNTY');
     var regArray = regName.split(" ");
     regName = regArray[0];
     var x = 1;
     while(regArray[x] != 'County') {
         regName += (' ' + regArray[x]);
         x++;
     }
     for(var i = 0; i < countyData.length; i++) {
         if(countyData[i][0] == regName && countyData[i][1] == calDate) {
             index = i;
         }
     }
     return index;
 }

function findCounty(event) {
    var index = -1;
    var regName = event.feature.getProperty('COUNTY');
    var regArray = regName.split(" ");
    regName = regArray[0];
    var x = 1;
    while(regArray[x] != 'County') {
        regName += (' ' + regArray[x]);
        x++;
    }
    for(var i = 0; i < countyData.length; i++) {
        if(countyData[i][0] == regName && countyData[i][1] == calDate) {
            index = i;
        }
    }
    return index;
}

function findRegion(event) {
    var index = -1;
    var finder = 0;
    var regName = event.feature.getProperty('REGION');
    for(var i = 0; i < regionData.length; i++) {
        if(regionData[i][0] == regName && regionData[i][1] == calDate) {
            finder = i;
        }
    }
    index = finder;
    return index;
}

function findFRegion(feature) {
    var index = -1;
    var finder = 0;
    var regName = feature.getProperty('REGION');
    for(var i = 0; i < regionData.length; i++) {
        if(regionData[i][0] == regName && regionData[i][1] == calDate) {
            finder = i;
        }
    }
    index = finder;
    return index;
}

function findStateTotal(event) {
    var regName = "Totals";
    var index = -1;
    for(var i = 0; i < regionData.length; i++) {
        if(regionData[i][0] == regName && regionData[i][1] == calDate) {
            index = i;
        }
    }
    return index;
}

function findFStateTotal(feature) {
    var regName = "Totals";
    var index = -1;
    for(var i = 0; i < regionData.length; i++) {
        if(regionData[i][0] == regName && regionData[i][1] == calDate) {
            index = i;
        }
    }
    return index;
}

function getFile() {
    var calDate = ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
    var month = date.getMonth();
    var year = date.getFullYear();
    var name = translateMonth(month);
    var fileName = "";
    var energyData;
    if(currentDrill == "county") {
        fileName = "county" + name + year + ".csv";
    } else if(currentDrill == "region" || currentDrill == "state") {
        fileName = "region" + name + year + ".csv";
    }                                       
    $.ajax ({
        type: "GET",
        url: "../static/csv/" + fileName,
        dataType: "text",
        success: function(data)
        {
            openFile(data);
            sumDay(calDate);
        }
    });
}

function getFileAndHeat() {
    removeLayer(outlineLayer);
    var calDate = ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
    var month = date.getMonth();
    var year = date.getFullYear();
    var name = translateMonth(month);
    var fileName = "";
    var energyData;
    var energyDataHeat;
    var heatName = "county" + name + year + ".csv";
    if(currentDrill == "county") {
        fileName = "county" + name + year + ".csv";
    } else if(currentDrill == "region" || currentDrill == "state") {
       fileName = "region" + name + year + ".csv";
    }      
    $.ajax ({
        type: "GET",
        url: "../static/csv/" + heatName,
        dataType: "text",
        success: function(data)
        {
            openFile(data);
            sumDayHeat(calDate);
            insertColorLayer();
        }
    }).done(getDataFile);
}

function getDataFile() {
    var calDate = ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
    $.ajax ({
        type: "GET",
        url: "../static/csv/" + fileName,
        dataType: "text",
        success: function(data) {
            openFile(data);
            sumDay(calDate);
            if(currentDrill == 'county') {
                showCounty();
            } else if(currentDrill == 'region') {
                showRegion();
            } else if(currentDrill == 'state') {
                showState();
            } else {
                console.log('uh oh');
            }
        }
    });
}
