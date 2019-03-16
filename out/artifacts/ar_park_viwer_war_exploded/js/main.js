var map = L.map('map').fitWorld();

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
}).addTo(map);

function onLocationFound(e) {
    var radius = e.accuracy / 2;

    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

    L.circle(e.latlng, radius).addTo(map);
}

function onLocationError(e) {
    alert(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);

map.locate({setView: true, maxZoom: 16});

//load major layers in the interface
//Visitor Comments
//MTB Trail head
//Water trail head
//trail bridge
//hiking trail
var hikingLayer = L.geoJSON(null, {style :
        {stroke : true,
            color: "brown",
            weight: 1,
            opacity: 1,
            dashArray : "10 5",
            dashOffset : "3"}
});
hikingLayer.addTo(map);
$.ajax({url : "/getgeometry?layer_name=foot" ,
    success : function(data){
        console.log("foot trails data requested from backend");
        console.log(data);
        hikingLayer.addData(data);
    }

});

//mtb trail
var mtbTrailLayer = L.geoJSON(null, {style :
        {stroke : true,
            color: "red",
            weight: 1,
            opacity: 1,
            dashArray : "10 5",
            dashOffset : "3"}
});
mtbTrailLayer.addTo(map);
$.ajax({url : "/getgeometry?layer_name=bike", success : function(data){
        console.log("MTB trails requested from backend");
        console.log(data);
        mtbTrailLayer.addData(data);
    }
});

//roads
var roadsLayer = L.geoJSON(null, {style :
        {stroke : true,
            color: "#010101",
            fill : true,
            fillColor: "#969696",
            weight : 0.5,
            fillOpacity : 1}
});
roadsLayer.addTo(map);
$.ajax({url : "/getgeometry?layer_name=transportation_polygon",
    success : function(data){
        console.log("Data from roads has been requested");
        console.log(data);
        roadsLayer.addData(data);
    }

});

//water bodies
var waterBodiesLayer = L.geoJSON(null, {style :
        {stroke : true,
            color: "#1b3b9a",
            fill : true,
            fillColor: "#64c5ee",
            weight : 0.5,
            fillOpacity : 1}
});
waterBodiesLayer.addTo(map);
$.ajax({url : "/getgeometry?layer_name=hydro_poly" ,
    success : function(data){
        console.log("data from water bodies has been requested");
        console.log(data);
        waterBodiesLayer.addData(data);
    }
});

//streams
var streamsLayer = L.geoJSON(null, {style : {
        color: "#64c5ee",
        opacity : 1,
        weight: 2
    }
});
streamsLayer.addTo(map);
$.ajax({url : "/getgeometry?layer_name=hydro_line", success : function(data){
        console.log("data for streams has been requested");
        console.log(data);
        streamsLayer.addData(data);
    }
});


//park boundary
var parkBoundaryLayer = L.geoJSON(null, {style :
        {stroke : true,
            color: "#007E00",
            fill : true,
            fillColor: "#C1FCA5",
            weight : 1,
            fillOpacity : 1}
});
parkBoundaryLayer.addTo(map);
$.ajax({url : "/getgeometry?layer_name=parkboundary" ,
    success : function(data){
    console.log("data from the park boundary was found, here it is: ")
    console.log(data);
    parkBoundaryLayer.addData(data);
    }
});