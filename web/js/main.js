var map = L.map('map').fitWorld();

//map attribution that is needed - Bicycle by Andrew Jones from the Noun Project
//Hiking by johanna from the Noun Project
//Water by abdul karim from the Noun Project
//comment by Aulia from the Noun Project

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
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

//normal foot trailhead
var trailheadLayer = L.geoJSON();
$.ajax({url : "/getgeometry?layer_name=trailhead" , success : function (data){
    console.log("data for trailheads is requested");
    console.log(data);
    trailheadLayer.addData(data);
    }
});

//MTB Trail head
var mtbTrailheadLayer = L.geoJSON();
$.ajax({url : "/getgeometry?layer_name=mtb_trailhead" , success : function(data){
    console.log("data for mtb trailheads requested");
    console.log(data);
    mtbTrailheadLayer.addData(data);
    }
});

//Water trail head
var waterTrailhead = L.geoJSON();
$.ajax({url : "/getgeometry?layer_name=water_trailhead", success : function(data){
    console.log("data for water trailheads requested");
    console.log(data);
    waterTrailhead.addData(data);
    }
});

//trail bridge
var trailBridgeLayer = L.geoJSON();
$.ajax({url : "/getgeometry?layer_name=bridge" , success : function(data){
    console.log("data for bridges requested from backend");
    console.log(data);
    trailBridgeLayer.addData(data);
    }
});

//hiking trail
var hikingLayer = L.geoJSON(null, {style :
        {stroke : true,
            color: "brown",
            weight: 1,
            opacity: 1,
            dashArray : "10 5",
            dashOffset : "3"}
});
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
$.ajax({url : "/getgeometry?layer_name=hydro_line", success : function(data){
        console.log("data for streams has been requested");
        console.log(data);
        streamsLayer.addData(data);
    }
});


//park boundary
var parkBoundaryLayer = L.geoJSON(null, {style :
        {stroke : true,
            color: "#C1FCA5",
            fill : true,
            fillColor: "#C1FCA5",
            weight : 5,
            fillOpacity : 0.1}
});
$.ajax({url : "/getgeometry?layer_name=parkboundary" ,
    success : function(data){
    console.log("data from the park boundary was found, here it is: ")
    console.log(data);
    parkBoundaryLayer.addData(data);
    }
});

//blackout
var blackoutLayer = L.geoJSON(null , {style :
        {stroke : false,
            color: "black",
            fill : true,
            fillColor: "black",
            weight : 5,
            fillOpacity : 0.6}
});
$.ajax({url : "/getgeometry?layer_name=blackout" , success : function(data){
    console.log("data for blackout layer requested");
    blackoutLayer.addData(data);
    }
});

var layerList = { "Hiking Trailheads" : trailheadLayer,
    "MTB Trailheads" : mtbTrailheadLayer,
    "Water Trailheads" : waterTrailhead,
    "Trail Bridges" :trailBridgeLayer,
    "Hiking Trails" : hikingLayer,
    "MTB Trails" : mtbTrailLayer,
    "Roads" : roadsLayer,
    "Water Bodies" : waterBodiesLayer,
    "Streams Layer" : streamsLayer,
    "Park Boundary" : parkBoundaryLayer};

L.control.layers( [], layerList).addTo(map);

//add all the layers to the map in the correct rendering order

streamsLayer.addTo(map);
waterBodiesLayer.addTo(map);
roadsLayer.addTo(map);
mtbTrailLayer.addTo(map);
hikingLayer.addTo(map);
trailBridgeLayer.addTo(map);
waterTrailhead.addTo(map);
mtbTrailheadLayer.addTo(map);
trailheadLayer.addTo(map);
blackoutLayer.addTo(map);
parkBoundaryLayer.addTo(map);