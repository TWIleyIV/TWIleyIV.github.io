function insertColorLayer() {
    removeLayer(heatmapLayer);
    if(heatGroup == "county") {
        heatmapLayer.loadGeoJson('../static/geojson/tx_counties.json');
    } else if(heatGroup == "region") {
        heatmapLayer.loadGeoJson('../static/geojson/tx_regions_big.json');
    } else {
        heatmapLayer.loadGeoJson('../static/geojson/tx_state.json');
    }
    heatmapLayer.setStyle(styleFeature);
    heatmapLayer.setMap(gmap);
}

function styleOutline(feature) {
    var outlineWeight = 0.75, zIndex = 1;
    if(feature.getProperty('isHovered') === 'hover') {
        outlineWeight = zIndex = 2.5;
    }
    return {
        strokeWeight: outlineWeight,
        strokeColor: '#fff',
        zIndex: 10,
        fillOpacity: 0
    }
}

function mouseInToRegion(e) {
    e.feature.setProperty('isHovered', 'hover');
    var temp;
    var percent;
    if(currentDrill == "county") {
        index = findCounty(e);
        temp = countyData[index][2];
        if(temp > 3000) {
            temp = 3000;
        }
        percent = (temp) / (3000) * 100;
    } else if(currentDrill == "region") {
        index = findRegion(e);
        temp = regionData[index][3];
        if(temp > 200000) {
            temp = 200000;
        }
        percent = (temp - minRegVal) / (maxRegVal - minRegVal) * 100;
    } else {
        index = findStateTotal(e);
        temp = regionData[index][3];
        percent = (temp - minStateVal) / (maxStateVal - minStateVal) * 100;
    }
    document.getElementById('data-caret').style.display = 'block';
    document.getElementById('data-caret').style.paddingLeft = percent + '%';
}

function mouseOutOfRegion(e) {
    e.feature.setProperty('isHovered', 'normal');
}

function styleFeature(feature) {
    var tempDrill = currentDrill;
    var minStyle;
    var maxStyle;
    if(heatGroup == "county") {
        index = findFCounty(feature);
        minStyle = minVal;
        maxStyle = maxVal;
        energyLevel = countyData[index][2];
    } else if(heatGroup == "region") {
        index = findFRegion(feature);
        minStyle = minRegVal;
        maxStyle = maxRegVal;
        energyLevel = regionData[index][3];
    } else {
        index = findFStateTotal(feature);
        minStyle = minStateVal;
        maxStyle = maxStateVal;
        energyLevel = regionData[index][3];
    }
    var high = [5, 69, 54];
    var low  = [151, 83, 34];
    if(energyLevel > maxStyle) {
        energyLevel = maxStyle;
    }
    var delta = (energyLevel - minStyle) / (maxStyle - minStyle);
    var color = [];
    for (var i = 0; i < 3; i++) {
        color[i] = (high[i] - low[i]) * delta + low[i];
    }
    var outlineWeight = 0.5, zIndex = 1;
    if (feature.getProperty('countyH') === 'hover') {
        outlineWeight = zIndex = 2;
    }
    return {
        strokeWeight: 0,
        strokeColor: '#fff',
        zIndex: zIndex,
        fillColor: 'hsl(' + color[0] + ',' + color[1] + '%,' + color[2] + '%)',
        fillOpacity: 0.75,
    };
}

function getMinMax() {
    fileName = "countyMap.csv";
    docMaxCount = 3000;
    var calDate = ((date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear());
    $.ajax({
        type: "GET",
        url: "../static/csv/" + fileName,
        dataType: "text",
        success: function(data)
        {
            openCountyFile(data);
            findMinMax();
            insertColorLayer();
            showCounty();
        }
    }).then(checkDynamicMap);    
}

function getRegionData() {
    fileName = "regionMap.csv";
    $.ajax({
        type: "GET",
        url: "../static/csv/" + fileName,
        dataType: "text",
        success: function(data)
        {
            openRegionFile(data);
            findMinMaxRegion();
        }
    }).then(checkDynamicMap);
}

function checkDynamicMap() {
    if(firstCheck && secondCheck) {
        $("#datepicker").datepicker('option', 'maxDate', "+9D");
    }
}

function findMinMax() {
    minVal = countyData[1][2];
    maxVal = countyData[1][2];
    for(i = 1; i < countyData.length; i) {
        var mDay = countyData[i][1];
        var minName = countyData[i][0];
        var dayValue = 0;
        while(i < countyData.length && countyData[i][0] == minName) {
            dayValue += +countyData[i][2];
            i++;
        }
        if(dayValue < minVal) {
            minVal = dayValue;
        }
        if(dayValue > maxVal) {
            maxVal = dayValue;
        }
        if(mDay == futureCal) {
            secondCheck = true;
        }
    }
    docMaxCount = maxVal;
    maxVal = 3000;
}

function findMinMaxRegion() {
    minRegVal = +regionData[1][3];
    maxRegVal = +regionData[1][3];
    var first = true;
    for(var i = 1; i < regionData.length; i++) {
        var rName = regionData[i][0];
        if(rName == 'Totals') {
            if(first === true) {
                minStateVal = +regionData[i][3];
                maxStateVal = +regionData[i][3];
                first = false;
            } else {
                if(+regionData[i][3] < minStateVal) {
                    minStateVal = +regionData[i][3];
                } else if(+regionData[i][3] > maxStateVal) {
                    maxStateVal = +regionData[i][3];
                }
            }
        } else {
            if(+regionData[i][3] < minRegVal) {
                minRegVal = +regionData[i][3];
            } else if(+regionData[i][3] > maxRegVal) {
                maxRegVal = +regionData[i][3];
            }
        }
        if(regionData[i][1] == futureCal) {
            firstCheck = true;
        }
    }
    docMaxReg = maxRegVal;
    maxRegVal = 200000;
}

function setHeatCounty() {
    heatGroup = "county";
    insertColorLayer();
}

function setHeatRegion() {
    heatGroup = "region";
    insertColorLayer();
}

function setHeatState() {
    heatGroup = "state";
    insertColorLayer();
}

function pushHeat(button) {
    $('.heatButton').each(function(e) {
        var func;
        switch(e) {
            case 0: func = "setHeatCounty();"; break;
            case 1: func = "setHeatRegion();"; break;
            case 2: func = "setHeatState();"; break;
            default:
        }
        $(this).removeClass("active");
        $(this).attr("onclick", "pushHeat(this);" + func);
    });
    $(button).addClass("active");
    $(button).attr("onclick", "");
}

function pushData(button) {
    $('.dataButton').each(function(e) {
        var func;
        switch(e) {
            case 0: func = "showCounty();"; break;
            case 1: func = "showRegion();"; break;
            case 2: func = "showState();"; break;
            default:
        }
        $(this).removeClass("active");
        $(this).attr("onclick", "pushData(this);" + func);
    });
    $(button).addClass("active");
    $(button).attr("onclick", "");
}
