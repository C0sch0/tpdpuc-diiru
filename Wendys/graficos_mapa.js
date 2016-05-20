$(document).ready(function() {
    d3.csv("wendys_sample.csv",function(data){
        var wendysMarkers = new L.FeatureGroup();
        L.mapbox.accessToken = 'pk.eyJ1IjoiZGlmbG9yZXMiLCJhIjoiY2VjNzc2ZjdmZGIwMjdmYzNjNjU5NDBlMmM3M2U4ODIifQ.u6oG-2m5DS7SqXFMCERIsQ';
        var mapboxTiles = L.tileLayer('https://api.mapbox.com/v4/diflores.eeb0102a/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
            attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        });

        var map = L.map('map')
            .addLayer(mapboxTiles)
            .setView([-40, -71.0587], 20);


        var fullDateFormat = d3.time.format("%Y/%m/%d");
        var yearFormat = d3.time.format("%Y");
        var monthFormat = d3.time.format("%m");

        // Parseo fechas
        data.forEach(function(d){
            d.rating = +d.rating;
            d.foundation_full = fullDateFormat.parse(d.foundation_date);
            d.foundation_year = +yearFormat(d.foundation_full);
            d.foundation_month = +monthFormat(d.foundation_full);
        })

        // Entrego mis datos a crossfilter para hacer funcionar los gráficos/mapa
        var myData = crossfilter(data);

        // Variable independiente ("ejes X")
        var myDataDimension = myData.dimension(function(d){return d;});
        var yearDimension = myData.dimension(function(d){return d.foundation_year;});
        var dayDimension = myData.dimension(function(d){return d.day_of_week;});
        var ratingDimension= myData.dimension(function(d){return d.rating;});
        var dateDimension = myData.dimension(function(d){return d.foundation_full;})

        // Variable dependiente ("ejes Y")
        var restaurantsYear = yearDimension.group().reduceCount();
        var restaurantsDay = dayDimension.group().reduceCount();
        var restaurantsRating = ratingDimension.group().reduceCount();
        var restaurantsDate = dateDimension.group().reduceCount();


        var yearChart = dc.pieChart("#chart-ring-year");
        var dayChart = dc.pieChart("#chart-ring-day");
        var ratingChart = dc.barChart("#rating");
        var ratingChart2 = dc.barChart("#rating2");
        var dataTable = dc.dataTable('#data-table');
        var dateChart= dc.barChart("#dates");
        var dayChart2 = dc.pieChart("#chart-ring-day2");
        var dayChart3 = dc.pieChart("#chart-ring-day3");



        var dataArray = [] 

        data.forEach(function (d){
            dataArray.push(d.foundation_full);
        })



        dateChart
            .width(900)
            .height(150)
            .dimension(dateDimension)
            .group(restaurantsDate)
            .x(d3.time.scale().domain([Math.min.apply(null,dataArray),Math.max.apply(null,dataArray)]))
            .elasticY(true)
            .centerBar(true)
            .xAxisLabel('Fecha')
            .yAxisLabel('Cantidad')
            .margins({top: 10, right: 20, bottom: 50, left: 50});
            ratingChart.xAxis().tickValues([0, 1, 2, 3, 4, 5]);


        yearChart
            .width(150)
            .height(150)
            .dimension(yearDimension)
            .group(restaurantsYear)
            .innerRadius(20);

        dayChart
            .width(150)
            .height(150)
            .dimension(dayDimension)
            .group(restaurantsDay)
            .innerRadius(20);

        dayChart2
            .width(150)
            .height(150)
            .dimension(dayDimension)
            .group(restaurantsDay)
            .innerRadius(20);

        dayChart3
            .width(150)
            .height(150)
            .dimension(dayDimension)
            .group(restaurantsDay)
            .innerRadius(20);

        ratingChart
            .width(300)
            .height(180)
            .dimension(ratingDimension)
            .group(restaurantsRating)
            .x(d3.scale.linear().domain([0,6]))
            .elasticY(true)
            .centerBar(true)
            .xAxisLabel('Rating')
            .yAxisLabel('Cantidad')
            .margins({top: 10, right: 20, bottom: 50, left: 50});
            ratingChart.xAxis().tickValues([0, 1, 2, 3, 4, 5]);

        ratingChart2
            .width(300)
            .height(180)
            .dimension(ratingDimension)
            .group(restaurantsRating)
            .x(d3.scale.linear().domain([0,6]))
            .elasticY(true)
            .centerBar(true)
            .xAxisLabel('Rating')
            .yAxisLabel('Cantidad')
            .margins({top: 10, right: 20, bottom: 50, left: 50});
            ratingChart.xAxis().tickValues([0, 1, 2, 3, 4, 5]);


        dataTable
            .dimension(myDataDimension)
            .group(function(d){return "Necesito quitar esta fila.";})
            .size(30)
            .columns([
                function(d){return d.name;},
                function(d){return d.foundation_date;},
                function(d){return d.address;},
                function(d){return d.rating;},
                ])
            .sortBy(function(d){return d.rating;})

            // Markers
            .renderlet(function(table){
                wendysMarkers.clearLayers();
                _.each(myDataDimension.top(Infinity), function(d){
                    var name = d.name
                    var marker = L.marker([d.latitude,d.longitude])
                    marker.bindPopup("<p>" + name + "</p>");
                    wendysMarkers.addLayer(marker)
                });
                map.addLayer(wendysMarkers);
                map.fitBounds(wendysMarkers.getBounds());
            })
            .order(d3.ascending);
        dc.renderAll();
    })
});