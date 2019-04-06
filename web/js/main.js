var bounds = L.latLngBounds(L.latLng(  34.863935, -92.431679), L.latLng( 34.811334, -92.524776));

var map = L.map('map', {minZoom : 13, maxBounds : bounds}).fitBounds(bounds);
map.zoomControl.setPosition("bottomright");
map.attributionControl.addAttribution("<a href='mapcredits.html'>Icon and layer credits</a>");

//map attribution that is needed - Bicycle by Andrew Jones from the Noun Project
//Hiking by johanna from the Noun Project
//Water by abdul karim from the Noun Project
//comment by Aulia from the Noun Project
//bridge by Dumitriu Robert from the Noun Project
//Home by andrewcaliber from the Noun Project

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);


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
        var popupText = "<span class='popup-span-text'>Searched Trail: " + feature.properties.name +
            "</span><span class='popup-span-text'>" + "Trail Surface is: " + feature.properties.material +
            "</span><span class='popup-span-text'> Trail use is: " + feature.properties.design_cat + "</span>";
        layer.bindPopup(popupText);
    }});
var commentPointCharacteristics = {latlng : null, layer : null};


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

        $(".navbar").addClass("constrained-navbar");
        $(".navbar").on("mouseover", function(){
            map.dragging.disable();
        });
        $(".navbar").on("mouseout" , function(){
            map.dragging.enable();
        });

        var resizeMenu = {};
        resizeMenu.expand = function(){
            $(".nav-tabs , #close-button , #myTabContent").removeClass("hidden");
            $("#expand-hamburger").addClass("hidden");

            $(".navbar").addClass("expanded-navbar");
            $(".navbar").removeClass("constrained-navbar");

            resizeMenu.setTabContentSize();
        };

        resizeMenu.setTabContentSize = function(){
            if ($("#trailtab").hasClass("active") && $("#trail-search-form").hasClass("hidden")){
                if (window.innerHeight -200 > $("#trailcontent").innerHeight()){
                    $(".navbar").removeAttr("style");
                } else {
                    $(".navbar").height(window.innerHeight * 0.9);
                };
            }

            if($("#commenttab").hasClass("active")){
                if (window.innerHeight -200 > $("#commentcontent").innerHeight()){
                    $(".navbar").removeAttr("style");
                } else {
                    $(".navbar").height(window.innerHeight * 0.9);
                };
            };
        };

        resizeMenu.close = function(){
            $(".nav-tabs , #close-button , #myTabContent").addClass("hidden");
            $("#expand-hamburger").removeClass("hidden");

            $(".navbar").removeClass("expanded-navbar");
            $(".navbar").addClass("constrained-navbar");
            $(".navbar").removeAttr("style");
        };

        $("#close-button").click(resizeMenu.close);
        $("#expand-hamburger").click(resizeMenu.expand);
        $("#commenttab").click(function(){
            resizeMenu.setTabContentSize();
        });

        $("body").on( "mousemove, click" , function(){
            resizeMenu.setTabContentSize();
        });

        resizeMenu.autoResize = function(){
            console.log("resize function called");
            if (window.innerWidth >= 700){
                resizeMenu.expand();
            } else {
                resizeMenu.close();
            }
        };
        resizeMenu.autoResize();


        $(window).resize(function(){
            resizeMenu.autoResize();
        });


        $("#backarrow").click(function(){
            $("#trail-search-form").removeClass("hidden");
            $("#trail-search-results").addClass("hidden");
            d3.select("#trail-results-table").html("");
            map.removeLayer(highlightLayer);
            $(".navbar").removeAttr("style");
            resizeMenu.setTabContentSize();
        });

        $("#backarrow2").click(function(){
            $("#comment-submit-form").removeClass("hidden");
            $("#comment-submit-feedback").addClass("hidden");
            resizeMenu.setTabContentSize();
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

                    var table = d3.select("#trail-results-table");
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
                    resizeMenu.setTabContentSize();


                }
            });

        });

        map.addEventListener("mousemove" , function(e){
            commentPointCharacteristics.latlng = e.latlng;
        });

        $("#select-map-location").on("mousedown" ,function(e){
            if(window.innerWidth >= 700){
                $("#map").addClass("click-map-activated");
                e.preventDefault();
            } else {
                resizeMenu.close();
                $("#map").addClass("click-map-activated");
                e.preventDefault();
            };
        });

        map.addEventListener( "click" , function(e){
            if ($("#map").hasClass("click-map-activated") && window.innerWidth < 700){

            }
        });

        $("#map").on("mouseup" , function(){
            if ( $("#map").hasClass("click-map-activated")){
                $("#map").removeClass("click-map-activated");

                if (!(commentPointCharacteristics.layer === null)){
                    map.removeLayer(commentPointCharacteristics.layer);
                }
                commentPointCharacteristics.layer = L.marker(commentPointCharacteristics.latlng, {draggable : true, autoPan : true}).addTo(map);
                console.log("Mouse has been released for point to be added to map");

                if (window.innerWidth < 700){
                    resizeMenu.expand();
                    console.log("expanding menu!");
                }
            }


        });


        $("#comment-submit").click(function(){
            //Mouse event https://leafletjs.com/reference-1.4.0.html#mouseevent
            //event generator needed to get coordinates https://leafletjs.com/reference-1.4.0.html#map-move
            //release mouse event https://api.jquery.com/mouseup/
            //https://www.w3schools.com/cssref/pr_class_cursor.asp with URL modifyer


            var commentData = {};
            commentData.lat = commentPointCharacteristics.layer.getLatLng().lat;
            commentData.lng = commentPointCharacteristics.layer.getLatLng().lng;
            commentData.rate = $("#rate").val();
            commentData.explain = $("#comment-text").val();
            commentData.email = $("#email").val();
            commentData.phone = $("#phone").val();
            commentData.prime = $("#prefer-contact").val();
            console.log("submit comment button clicked");
            console.log("location value is: " + commentData.commentlocation);

            if (commentPointCharacteristics.layer == null){
                alert("Location info has not been filled in");
            } else if (commentData.rate == ""){
                alert("Rating has not been filled in");
            } else if (isNaN(commentData.rate)){
                alert("Rating is not a number");
            } else {
                //make a proper post request to the backend
                $.post("/submitcomment" , commentData, function(callbackData, status){
                    console.log("info from post request is: ");
                    console.log(callbackData);
                    console.log(status);
                });

                //change the interface to show the thank you message
                $("#comment-submit-form").addClass("hidden");
                $("#comment-submit-feedback").removeClass("hidden");
                resizeMenu.setTabContentSize();
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

var commentsLayer = L.geoJSON(null, {
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
var trailheadLayer = L.geoJSON(null, {
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
var mtbTrailheadLayer = L.geoJSON(null , {
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
var waterTrailhead = L.geoJSON(null , {
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
var trailBridgeLayer = L.geoJSON(null , {
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
        var popupText =  "<span class='popup-span-text'>Type: Hiking Trail </span><span class='popup-span-text'>Trail Name: " + feature.properties.name + "</span> <span class='popup-span-text'>Trail surface: " + feature.properties.material + "</span>";
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
        var popupText =  "<span class='popup-span-text'>Type: Bike Trail </span><span class='popup-span-text'>Trail Name: " + feature.properties.name + "</span> <span class='popup-span-text'>Trail surface: " + feature.properties.material + "</span>";
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
        var popupText =  "<span class='popup-span-text'>Type: Water Trail </span><span class='popup-span-text'>Trail Name: " + feature.properties.name + "</span>";
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

var parkInfoControl = L.control();
parkInfoControl.onAdd = function(map){
    this._div = L.DomUtil.create('div', 'park-info'); // create a div with a class "info"
    this.update();
    return this._div;
};
parkInfoControl.update = function(props){
    this._div.innerHTML = "<img id='information-icon' title='Park Information' src='img/info.svg'></img><div class='park-info-content hidden'><a href='https://www.arkansasstateparks.com/'><h4>Pinnacle Mountain State Park</h4></a><p>Just west of Arkansas’s capital city of Little Rock, Pinnacle Mountain stands as the centerpiece of this geographically diverse state park. This day-use park offers a variety of outdoor adventure on the Big and Little Maumelle Rivers, in the Arkansas Arboretum, and along over 15 miles of trails including 7 miles of challenging mountain bike trails. Hike to the top, explore the rivers, or take in one of the many interpretive programs offered by park staff. Visit the park visitor center, enjoy a picnic, or reserve a pavilion for a larger gathering.</p><a href='https://www.arkansasstateparks.com/'><p>Click Here for more information</p></a></div>";
};
parkInfoControl.addTo(map);
$(".park-info").on("click mouseover", function(){
    $(".park-info").addClass("expanded");
    $(".park-info-content").removeClass("hidden");
    $(".park-info img").addClass("hidden");
});
$(".park-info").on("mouseout", function(){
    $(".park-info").removeClass("expanded");
    $(".park-info-content").addClass("hidden");
    $(".park-info img").removeClass("hidden");
});