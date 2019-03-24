var bounds = L.latLngBounds(L.latLng(  34.863935, -92.431679), L.latLng( 34.811334, -92.524776));

var map = L.map('map', {minZoom : 13, maxBounds : bounds}).fitBounds(bounds);

//map attribution that is needed - Bicycle by Andrew Jones from the Noun Project
//Hiking by johanna from the Noun Project
//Water by abdul karim from the Noun Project
//comment by Aulia from the Noun Project
//bridge by Dumitriu Robert from the Noun Project
//Home by andrewcaliber from the Noun Project

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
}).addTo(map);


L.control.locate({position : "topright"}).addTo(map);

//build home extent button
function homeExtent(){
    map.fitBounds(bounds);
    //map.setView([ 34.840501, -92.471005], 14);
};
homeExtent();

//add a custom map control for the home button
var homeButtonControl = L.control();
homeButtonControl.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'home'); // create a div with a class "info"
    this.update();
    return this._div;
};
homeButtonControl.update = function (props) {
    this._div.innerHTML = "<img title='Zoom to Full Extent of Park' src='img/home.svg'></img>";
};
homeButtonControl.addTo(map);
$(".home").click(homeExtent);



var hightlightStyle = {stroke : true,
    color: "yellow",
    weight: 5,
    opacity: 1};
var highlightLayer = L.geoJSON(null, {style : hightlightStyle ,
    onEachFeature : function(feature, layer){
        var popupText = "Searched Trail: " + feature.properties.name + "</br>" + "Trail Surface is " + feature.properties.material + ", Trail use is " + feature.properties.design_cat;
        layer.bindPopup(popupText);
    }});

//build navbar
$.ajax({url : "/menu.html" , success : function(data){
        var navMenu = L.control({position : "topleft"});
        navMenu.onAdd = function(map){
            this._nav = L.DomUtil.create("nav", "navbar");
            this.update();
            return this._nav;
        };
        navMenu.update = function(props){
            this._nav.innerHTML = data;
        };
        navMenu.addTo(map);

        $("#backarrow").click(function(){
            $("#trail-search-form").removeClass("hidden");
            $("#trail-search-results").addClass("hidden");
            map.removeLayer(highlightLayer);
        });

        $("#backarrow2").click(function(){
            $("#comment-submit-form").removeClass("hidden");
            $("#comment-submit-feedback").addClass("hidden");
        });

        //bind a function to the element so it will ask for query from the backend
        $("#trail-submit").click(function(){
            //harvest values from the different elements in the control
            var footvalue = $("#footcheck").prop("checked");
            var bikevalue = $("#bikecheck").prop("checked");
            var watervalue = $("#watercheck").prop("checked");
            var naturalvalue =  $("#naturalcheck").prop("checked");
            var pavedvalue = $("#pavedcheck").prop("checked");

            console.log("button clicked on!");
            var request_url = "/searchtrails?foot=" + footvalue + "&bike=" + bikevalue + "&water=" + watervalue + "&natural=" + naturalvalue + "&paved=" + pavedvalue;
            console.log("value of request url is: " + request_url);

            //make a proper get request to backend
            $.ajax({url : request_url , dataType : "json" , success : function(traildata){
                    console.log("trail data from backend is");
                    console.log(traildata);

                    var table = d3.select("table");
                    table.html("");
                    table.append("tr").html("<th>Trail Name</th><th>Allowed USe</th> <th>Surface</th>");
                    table.selectAll(".trailitem")
                        .data(traildata)
                        .enter()
                        .append("tr")
                        .html(function(d){
                            return "<td>" + d.properties.name + "</td><td>" + d.properties.design_cat + "</td><td>" + d.properties.material + "</td>";
                        });

                    highlightLayer.clearLayers();//remove data from previous searches in the geoJSON object
                    highlightLayer.addData(traildata);
                    highlightLayer.addTo(map);

                    $("#trail-search-form").addClass("hidden");
                    $("#trail-search-results").removeClass("hidden");


                }
            });

        });

        $("#comment-submit").click(function(){
            var commentData = {};
            commentData.lat = $("#lat").val();
            commentData.lng = $("#lng").val();
            commentData.rate = $("#rate").val();
            commentData.commenttext = $("#comment-text").val();
            commentData.email = $("#email").val();
            commentData.phone = $("#phone").val();
            commentData.perferedContract = $("#prefer-contact").val();
            console.log("submit comment button clicked");
            console.log("location value is: " + commentData.commentlocation);

            if (commentData.lng === "" || commentData.lng == ""){
                alert("Location info has not been filled in");
            } else if (isNaN(commentData.lng) || isNaN(commentData.lat) ){
                alert("Location Info is not a valid coordinate set, is not a number");
            } else if (commentData.rate == ""){
                alert("Rating has not been filled in");
            } else if (isNaN(commentData.rate)){
                alert("Rating is not a number");
            } else {
                //make a proper post request to the backend

                //change the interface to show the thank you message
                $("#comment-submit-form").addClass("hidden");
                $("#comment-submit-feedback").removeClass("hidden");
            }


        });

    }
});



//load major layers in the interface
//Visitor Comments
var commentIcon = L.icon(
    {iconUrl : "/img/comment.svg",
        iconSize : [40,40],
        iconAnchor : [20,20],
        popupAnchor : [0,0]}
);

var commentsLayer = L.geoJSON(null, {attribution : "Comments housed from ADPT" ,
    pointToLayer : function(feature, latlng){
        var trailMarker = L.marker(latlng, {icon : commentIcon});
        return trailMarker;
    }, onEachFeature : function(feature, layer){
        var popupText = "Comment <br> Rating: " + feature.properties.rate + " Detailed Comment :" + feature.properties.explain;
        console.log("comment popup text, With Victory");
        console.log(popupText);
        layer.bindPopup(popupText);
    }
});


$.ajax({url : "/getgeometry?layer_name=comments" , success : function(commentData){
    console.log("Data for oomments is being requested");
    console.log(commentData);
    commentsLayer.addData(commentData);
    }
});


//normal foot trailhead
var trailheadIcon = L.icon(
    {iconUrl : "/img/hiking.svg",
        iconSize : [40,40],
        iconAnchor : [20,20],
        popupAnchor : [0,0]}
);
var trailheadLayer = L.geoJSON(null, {attribution : "Hiking by johanna from the Noun Project" ,
    onEachFeature : function(feature, layer){
        var popupText = "Hiking Trailhead";
        layer.bindPopup(popupText);
    },
    pointToLayer : function(feature, latlng){
        var trailMarker = L.marker(latlng, {icon : trailheadIcon});
        return trailMarker;
    }
});
$.ajax({url : "/getgeometry?layer_name=trailhead" ,
    success : function (data){
        console.log("data for trailheads is requested");
        console.log(data);
        trailheadLayer.addData(data);
    }
});

//MTB Trail head
var mtbTrailIcon= L.icon(
    {iconUrl : "/img/bike.svg",
        iconSize : [40,40],
        iconAnchor: [20,20],
        popupAnchor : [0,0]}
);
var mtbTrailheadLayer = L.geoJSON(null , {attribution : "Bicycle by Andrew Jones from the Noun Project" ,
    onEachFeature : function(feature, layer){
        var popupText = "MTB Trailhead";
        layer.bindPopup(popupText);
    },
    pointToLayer : function(feature, latlng){
        var mtbMarker = L.marker(latlng, {icon : mtbTrailIcon});
        return mtbMarker;
    }
});
$.ajax({url : "/getgeometry?layer_name=mtb_trailhead" , success : function(data){
    console.log("data for mtb trailheads requested");
    console.log(data);
    mtbTrailheadLayer.addData(data);
    }
});

//Water trail head
var waterTrailheadIcon =  L.icon(
    {iconUrl : "/img/water.svg",
        iconSize : [40,40],
        iconAnchor: [20,20],
        popupAnchor: [0,0]
    }
);
var waterTrailhead = L.geoJSON(null , {attribution : "Water by abdul karim from the Noun Project" ,
    onEachFeature : function(feature, layer){
        var popupText = "Water Trailhead";
        layer.bindPopup(popupText);
    },
    pointToLayer : function(feature, latlng){
    var waterMarker = L.marker(latlng, {icon : waterTrailheadIcon});
    return waterMarker;
    }
});
$.ajax({url : "/getgeometry?layer_name=water_trailhead", success : function(data){
    console.log("data for water trailheads requested");
    console.log(data);
    waterTrailhead.addData(data);
    }
});

//trail bridge
var bridgeIcon  = L.icon(
    {iconUrl : "/img/bridge.svg",
        iconSize : [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0,0]
    }
);
var trailBridgeLayer = L.geoJSON(null , {attribution : "Bridge by Dumitriu Robert from the Noun Project" ,
    onEachFeature : function(feature, layer){
        var popupText = "Trail Bridge";
        layer.bindPopup(popupText);
    },
    pointToLayer : function(feature, latlng){
        var trailBridgeMarker = L.marker(latlng, {icon : bridgeIcon});
        return trailBridgeMarker;
    }
});
$.ajax({url : "/getgeometry?layer_name=bridge" , success : function(data){
    console.log("data for bridges requested from backend");
    console.log(data);
    trailBridgeLayer.addData(data);
    }
});

//hiking trail
var hikingLayer = L.geoJSON(null, {onEachFeature : function(feature, layer){
        var popupText =  "Hiking Trail " + feature.properties.name + ", Trail surface is " + feature.properties.material;
        layer.bindPopup(popupText);
    }, style :
        {stroke : true,
            color: "brown",
            weight: 3,
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
var mtbTrailLayer = L.geoJSON(null, {onEachFeature : function(feature, layer){
        var popupText =  "Bike Trail " + feature.properties.name + ", Trail surface is " + feature.properties.material;
        layer.bindPopup(popupText);
    }, style :
        {stroke : true,
            color: "red",
            weight: 3,
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

var waterTrailsLayer = L.geoJSON(null, {onEachFeature : function(feature, layer){
        var popupText =  "Water Trail " + feature.properties.name;
        layer.bindPopup(popupText);
    }, style :
        {stroke : true,
            color: "blue",
            weight: 3,
            opacity: 1,
            dashArray : "10 5",
            dashOffset : "3"}

});
$.ajax({url : "/getgeometry?layer_name=water", success : function(data){
    console.log("water trails data is being requested from backend");
    console.log(data);
    waterTrailsLayer.addData(data);
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
var waterBodiesLayer = L.geoJSON(null, {onEachFeature : function(feature, layer){
        if (feature.properties.hasOwnProperty("name")){
            var popupText =  feature.properties.name;
            layer.bindPopup(popupText);
        }
    }, style :
        {stroke : true,
            color: "#1b3b9a",
            fill : true,
            fillColor: "#64c5ee",
            weight : 0.5,
            fillOpacity : 0.5}
});
$.ajax({url : "/getgeometry?layer_name=hydro_poly" ,
    success : function(data){
        console.log("data from water bodies has been requested");
        console.log(data);
        waterBodiesLayer.addData(data);
    }
});

//streams
var streamsLayer = L.geoJSON(null, {onEachFeature : function(feature, layer){
        if (feature.properties.hasOwnProperty("name")){
            var popupText =  feature.properties.name;
            layer.bindPopup(popupText);
        }
    }, style : {
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
            fill : false,
            weight : 5}
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
            fill : true,
            fillColor: "black",
            fillOpacity : 0.6}
});
$.ajax({url : "/getgeometry?layer_name=blackout" , success : function(data){
    console.log("data for blackout layer requested");
    blackoutLayer.addData(data);
    }
});

var layerList = {"Comments Layer" : commentsLayer,
    "Hiking Trailheads" : trailheadLayer,
    "MTB Trailheads" : mtbTrailheadLayer,
    "Water Trailheads" : waterTrailhead,
    "Trail Bridges" :trailBridgeLayer,
    "Hiking Trails" : hikingLayer,
    "MTB Trails" : mtbTrailLayer,
    "Water Trails" : waterTrailsLayer,
    "Roads" : roadsLayer,
    "Water Bodies" : waterBodiesLayer,
    "Streams Layer" : streamsLayer,
    "Park Boundary" : parkBoundaryLayer};

L.control.layers( [], layerList).addTo(map);

//add all the layers to the map in the correct rendering order

streamsLayer.addTo(map);
//waterBodiesLayer.addTo(map);
roadsLayer.addTo(map);
waterTrailsLayer.addTo(map);
mtbTrailLayer.addTo(map);
hikingLayer.addTo(map);
trailBridgeLayer.addTo(map);
waterTrailhead.addTo(map);
mtbTrailheadLayer.addTo(map);
trailheadLayer.addTo(map);
blackoutLayer.addTo(map);
parkBoundaryLayer.addTo(map);