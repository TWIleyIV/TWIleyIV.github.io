function loadPage(){
    min_date = new Date(2015, 11, 1);
    max_date = new Date(2016, 4, 10);
    max_date.setHours(23);
    setDatepickerDefaults();
    drawChart();
}

function setDatepickerDefaults(){
    document.getElementById('minDatepicker').placeholder = (min_date.getMonth()+1) + "/"
        + min_date.getDate() + "/" + min_date.getFullYear();

    document.getElementById('maxDatepicker').placeholder = (max_date.getMonth()+1) + "/"
        + max_date.getDate() + "/" + max_date.getFullYear();
}

function drawChart() {
    var chartDiv = document.getElementById('chartView');
    data = new google.visualization.DataTable();
    data.addColumn('date', 'Date & Time');
    data.addColumn('number', "Texas");
    data.addColumn('number', "Coastal");
    data.addColumn('number', 'East');
    data.addColumn('number', "Far West");
    data.addColumn('number', "North");
    data.addColumn('number', 'North Central');
    data.addColumn('number', "South");
    data.addColumn('number', "South Central");
    data.addColumn('number', "West");
    data.addRow([new Date(2015, 0, 23, 0),0,0,0,0,0,0,0,0,0]);
    setColumnsAndSeries();
    setOptions();

    setTable();
    chart = new google.visualization.LineChart(chartDiv);
    view = new google.visualization.DataView(data);
    view.setColumns(columns);
    chart.draw(view, options);


    // Shows or hides line when legend is clicked
    google.visualization.events.addListener(chart, 'select', lineSelect);
    google.visualization.events.addListener(chart, 'onmouseover', pointHover);
    google.visualization.events.addListener(chart, 'onmouseout', pointOff);



    //create trigger to resizeEnd event
    $(window).resize(function() {
        if(this.resizeTO) clearTimeout(this.resizeTO);
        this.resizeTO = setTimeout(function() {
            $(this).trigger('resizeEnd');
        }, 500);
    });

    //redraw graph when window resize is completed
    $(window).on('resizeEnd', function() {
        chart.draw(view, options);
    });
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

function translateTime(hour) {
    var time = "";
    if(hour == 0) { time="12:00 AM"; }
    if(hour == 1) { time="1:00 AM"; }
    if(hour == 2) { time="2:00 AM"; }
    if(hour == 3) { time="3:00 AM"; }
    if(hour == 4) { time="4:00 AM"; }
    if(hour == 5) { time="5:00 AM"; }
    if(hour == 6) { time="6:00 AM"; }
    if(hour == 7) { time="7:00 AM"; }
    if(hour == 8) { time="8:00 AM"; }
    if(hour == 9) { time="9:00 AM"; }
    if(hour == 10) { time="10:00 AM"; }
    if(hour == 11) { time="11:00 AM"; }
    if(hour == 12) { time="12:00 PM"; }
    if(hour == 13) { time="1:00 PM"; }
    if(hour == 14) { time="2:00 PM"; }
    if(hour == 15) { time="3:00 PM"; }
    if(hour == 16) { time="4:00 PM"; }
    if(hour == 17) { time="5:00 PM"; }
    if(hour == 18) { time="6:00 PM"; }
    if(hour == 19) { time="7:00 PM"; }
    if(hour == 20) { time="8:00 PM"; }
    if(hour == 21) { time="9:00 PM"; }
    if(hour == 22) { time="10:00 PM"; }
    if(hour == 23) { time="11:00 PM"; }
    return time;
}

function setTable(){
    arrayData = [];

    $.get("../static/csv/chart.csv", fillArray);
}

function fillArray(csvString){
    // transform the CSV string into a 2-dimensional array
    var monthData = $.csv.toArrays(csvString, {onParseValue: $.csv.hooks.castToScalar});

    var d = new Date(monthData[2][0]);

    if(arrayData.length != 0){
        arrayData.shift();
    }

    for (var i = 1; i < monthData.length; i++) {
        monthData[i][0] = new Date(monthData[i][0]);
        arrayData[arrayData.length] = monthData[i];
    }


    arrayData.sort(compareData);
    arrayData.unshift(monthData[0]);
    data = new google.visualization.arrayToDataTable(arrayData);
    reduceData();
    actualCheck();
    view = new google.visualization.DataView(data);
    view.setColumns(columns);

    chart.draw(view, options);

}

function compareData(a, b){
    if (a[0] < b[0])
        return -1;
      else if (a[0] > b[0])
        return 1;
      else
        return 0;
}

function actualCheck(){
    for(var r = 1; r < data.getNumberOfRows(); r++){
        for(var c = 1; c < data.getNumberOfColumns(); c++){
            if(data.getValue(r,c) == 0){
                data.setValue(r,c,arrayData[r + 1][c*3 - 1]);
            }
        }
    }
}

function setColumnsAndSeries() {
    // Sets up the what's needed to create the view
    columns = [];
    series = {};

    // Creates the column array
    for (var i = 0; i < data.getNumberOfColumns(); i++) {
        columns.push(i);
        if (i > 0) {

            columns[i] = {
                label: data.getColumnLabel(i),
                type: data.getColumnType(i)
            };

            series[(i - 1)] = {
                color: 'lightgray'
            };
        }
    }
}

function reduceData() {
    // Removes columns that are not actuals
    for(var i = data.getNumberOfColumns() - 1; i >= 0; i--){
        if(i % 3 != 1 && i != 0){
            data.removeColumn(i);
        }
    }
}

function setOptions() {
    options = {
        title: 'Energy Usage in Texas',
        curveType: 'function',
        series: series,
        colors: ['#3366cc', '#dc3912', '#ff9900',
                '#109618', '#990099', '#0099c6',
                '#dd4477', '#66aa00', '#b82e2e'],
        tooltip: {
            trigger: 'none'
        },
        explorer: {
            axis: 'horizontal',
            keepInBounds: true,
            maxZoomIn: 0.01,
            maxZoomOut: 1
        },
        hAxis: {
            title: 'Date',
            gridlines: {
                count: -1,
                units: {
                    days: {format: ['MMM dd']},
                    hours: {format: ['HH:mm', 'ha']}
                }
            },
            viewWindow: {
                min: min_date,
                max: max_date
            }
        },
        vAxis: {
            title: 'Energy (MWh)'
        },
        pointSize: 3
    }
}

function lineSelect() {
    var sel = chart.getSelection();
    // if selection length is 0, we deselected an element
    if (sel.length > 0) { /**Make sure an element is selected**/
        // if row is undefined, we clicked on the legend
        if (sel[0].row === null) { /**G-API: row=null --> legend selected*/
            var col = sel[0].column;
            if (columns[col] == col) {
                // hide the data series
                columns[col] = {
                    label: data.getColumnLabel(col),
                    type: data.getColumnType(col)
                };

                // gray out the legend entry
                series[col - 1].color = 'lightgray';
            }
            else {
                // show the data series
                columns[col] = col;
                //series[col - 1].color = null;
                series[col - 1].color = null;
            }
            view = new google.visualization.DataView(data);
            view.setColumns(columns);
            chart.draw(view, options);
        }
    }
}

function pointOff(point) {
    document.getElementById('info-box').innerHTML = "";
}

function pointHover(point) {
    if (point.row > 0) {
        var text = ('<div style="font-size: .8em; color: ' + options.colors[point.column-1] + '" align="left"> <b> ' + data.getColumnLabel(point.column)
        + ' - ' + formatDate(arrayData[point.row + 1][0]) + '</b></div>');

        if(arrayData[point.row + 1][point.column*3 - 2] != 0) {
            text += '<div style="font-size: .8em" align="left"><b>Actual Energy Usage:</b> '
                + numberWithCommas(arrayData[point.row + 1][point.column * 3 - 2])+ " MWh";
            text += '<br><b>Predicted Energy Usage:</b> '
                + numberWithCommas(arrayData[point.row + 1][point.column * 3 - 1] + " MWh");
            text += '<br><b>Delta:</b> ' + arrayData[point.row + 1][point.column * 3];
        } else{
            text += '<div style="font-size: .8em" align="left"><b>Predicted Energy Usage:</b> '
                + numberWithCommas(arrayData[point.row + 1][point.column * 3 - 1]) + " MWh"
                + '<br><br>';
        }
        text+='</div>';
        document.getElementById('info-box').innerHTML = text;
    }
}


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatDate(date){
    var str = translateMonth(date.getMonth()) + " " + date.getDate() + ", " + date.getFullYear()
        + " " + translateTime(date.getHours());
    return str;
}

function changeDateRange(){
    if(min_date <= max_date){
        options.hAxis.viewWindow.min = min_date;
        max_date.setHours(23);
        options.hAxis.viewWindow.max = max_date;
        chart.draw(view, options);
    }
}

function displayErrMsg(){
    if(min_date > max_date) {
        document.getElementById('errMsg').style.display = "inline";
    }
}

function removeErrMsg(){
    document.getElementById('errMsg').style.display = "none";
}




