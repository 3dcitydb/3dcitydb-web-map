define([
        'Cesium/Cesium',
        'domReady!'
    ], function(Cesium) {
  window.Cesium = Cesium;
    "use strict";
    /*global console*/
/*
    var viewer = new Cesium.Viewer('cesiumContainer', {baseLayerPicker : false}); 
        //terrainProvider:terrainProvider

    var extent = new Cesium.Rectangle.fromDegrees(13.3703613, 52.5036621, 13.4143066, 52.5256348);
    viewer.camera.viewRectangle(extent);

    viewer.extend(Cesium.viewerCesiumInspectorMixin);  
    
    var webMap = new WebMap3DCityDB(viewer);
  
   var eventCallback = function(id){
       alert(id);
   }

    var addlayer = document.getElementById("addlayer");
    var removelayer = document.getElementById("removelayer");
    var highlight = document.getElementById("highlight");

   addEvent(addlayer,"CLICK", function(){
        var buildingsextent = new Cesium.Rectangle.fromDegrees(13.3703613, 52.5036621, 13.4143066, 52.5256348);
        var options = {url:'http://localhost/www/berlintms', name:"buildingslayer", minLevel:15, maxLevel:17, region:buildingsextent, id:"tmsOLayer"};
        
        var tmsLayer = new TMSObjectLayer(options);
        webMap.addLayer(tmsLayer);  

   });

   addEvent(highlight,"click",function(){
      var highlightThis = {
        "DEB_LOD2_UUID_fdf1a5fa-c9dc-49fe-bc85-871b32aa3074" : Cesium.Color.CRIMSON
      };
      tmsLayer.highlight(highlightThis);  
   });

   
   
function addEvent(obj, evType, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evType, fn, false);
        return true;
    } else if (obj.attachEvent) {
        var r = obj.attachEvent("on" + evType, fn);
        return r;
    } else {
        alert("Handler could not be attached");
    }
}

*/

// /*
    var viewer = new Cesium.Viewer('cesiumContainer', {baseLayerPicker : false});

    var extent = new Cesium.Rectangle.fromDegrees(13.3813477, 52.5146484, 13.4033203, 52.5366211);
    viewer.camera.viewRectangle(extent);

    viewer.extend(Cesium.viewerCesiumInspectorMixin);  
    
    var webMap = new WebMap3DCityDB(viewer);  

    var add = document.getElementById("addlayer");
    var remove = document.getElementById("removelayer");
    var highlight = document.getElementById("highlight");
    var dehighlight = document.getElementById("dehighlight");
    var hide = document.getElementById("hide");

    var tmsLayer = null;
    addEvent(add,"click", function(){
        //Large extent
        var buildingsextent = new Cesium.Rectangle.fromDegrees(13.3703613, 52.5036621, 13.4143066, 52.5256348);
        //Small extent
        //var buildingsextent = new Cesium.Rectangle.fromDegrees(13.3813476562, 52.5228881836, 13.3840942383, 52.5256347656);
      
        var options = {url:'http://localhost/www/berlintms', name:"buildingslayer", minLevel:15, maxLevel:15, region:buildingsextent, id:"tmsOLayer"};
        
        tmsLayer = new TMSObjectLayer(options);
        webMap.addLayer(tmsLayer);
    });
    
    addEvent(remove, "click", function(){
        webMap.removeLayer("tmsOLayer");
    });

    addEvent(highlight,"click",function(){
      var highlightThis = {
        "BLDG_00030002002e7f53" : Cesium.Color.CRIMSON,
        "BLDG_0003000a0027a296" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001e8d9f" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001e8de3" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001e8e06" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001e8e0d" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001e8ef0" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001e8efe" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001ed5c1" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001f2db4" : Cesium.Color.CRIMSON,
        "BLDG_0003000b001f2db7" : Cesium.Color.CRIMSON,
        "BLDG_0003000b00287238" : Cesium.Color.CRIMSON,
        "BLDG_0003000b0071da2e" : Cesium.Color.CRIMSON,
        "BLDG_0003000e003d178d" : Cesium.Color.CRIMSON,
        "BLDG_0003000f000031c0" : Cesium.Color.CRIMSON,
        "BLDG_0003000f003c873b" : Cesium.Color.CRIMSON,
        "BLDG_0003000f003d022d" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_069bc441-2162-498e-af49-849620546c00" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_1e588184-ac47-42cd-819c-48fd32f24a52" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_5346d902-116f-4898-a162-f2bcb92799ac" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_8317a28c-c737-4fc6-b311-000ad75087b0" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_86a9d0b6-95be-422b-a619-429055f7ca8c" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_aae9e48c-5476-458b-bdb9-6e7f496feaf0" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_b4553d58-5b4b-4a2d-9b88-716130ed85c5" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_dbfa6208-53bf-4feb-876c-4a0bfb871422" : Cesium.Color.CRIMSON,
        "DEB_LOD2_UUID_e4a1f0f9-782c-4930-86da-9105838f06fa" : Cesium.Color.CRIMSON,
        "ID2" : Cesium.Color.CRIMSON,
        "UUID_511d10b4-1172-4010-afe9-48f92215d175" : Cesium.Color.CRIMSON,
        "UUID_73a62484-279c-44b1-b31a-e7dc8f86adc4" : Cesium.Color.CRIMSON,
        "UUID_ab7c2a0f-0edb-4346-8276-977c434abe90" : Cesium.Color.CRIMSON,
        "citygml" : Cesium.Color.CRIMSON,
        "node_0" : Cesium.Color.CRIMSON,
        "node_1" : Cesium.Color.CRIMSON
      };
      tmsLayer.highlight(highlightThis);  
   });

    addEvent(highlight2,"click",function(){
      var highlightThis = {
        "DEB_LOD2_UUID_fdf1a5fa-c9dc-49fe-bc85-871b32aa3074" : Cesium.Color.AQUAMARINE
      };
      tmsLayer.highlight(highlightThis);  
   });

    addEvent(dehighlight,"click",function(){
      var unHighlightThis = [];
      unHighlightThis.push("BLDG_00030002002e7f53");
unHighlightThis.push("BLDG_0003000a0027a296");
unHighlightThis.push("BLDG_0003000b001e8d9f");
unHighlightThis.push("BLDG_0003000b001e8de3");
unHighlightThis.push("BLDG_0003000b001e8e06");
unHighlightThis.push("BLDG_0003000b001e8e0d");
unHighlightThis.push("BLDG_0003000b001e8ef0");
unHighlightThis.push("BLDG_0003000b001e8efe");
unHighlightThis.push("BLDG_0003000b001ed5c1");
unHighlightThis.push("BLDG_0003000b001f2db4");
unHighlightThis.push("BLDG_0003000b001f2db7");
unHighlightThis.push("BLDG_0003000b00287238");
unHighlightThis.push("BLDG_0003000b0071da2e");
unHighlightThis.push("BLDG_0003000e003d178d");
unHighlightThis.push("BLDG_0003000f000031c0");
unHighlightThis.push("BLDG_0003000f003c873b");
unHighlightThis.push("BLDG_0003000f003d022d");
unHighlightThis.push("DEB_LOD2_UUID_069bc441-2162-498e-af49-849620546c00");
unHighlightThis.push("DEB_LOD2_UUID_1e588184-ac47-42cd-819c-48fd32f24a52");
unHighlightThis.push("DEB_LOD2_UUID_5346d902-116f-4898-a162-f2bcb92799ac");
unHighlightThis.push("DEB_LOD2_UUID_8317a28c-c737-4fc6-b311-000ad75087b0");
unHighlightThis.push("DEB_LOD2_UUID_86a9d0b6-95be-422b-a619-429055f7ca8c");
unHighlightThis.push("DEB_LOD2_UUID_aae9e48c-5476-458b-bdb9-6e7f496feaf0");
unHighlightThis.push("DEB_LOD2_UUID_b4553d58-5b4b-4a2d-9b88-716130ed85c5");
unHighlightThis.push("DEB_LOD2_UUID_dbfa6208-53bf-4feb-876c-4a0bfb871422");
unHighlightThis.push("DEB_LOD2_UUID_e4a1f0f9-782c-4930-86da-9105838f06fa");
unHighlightThis.push("ID2");
unHighlightThis.push("UUID_511d10b4-1172-4010-afe9-48f92215d175");
unHighlightThis.push("UUID_73a62484-279c-44b1-b31a-e7dc8f86adc4");
unHighlightThis.push("UUID_ab7c2a0f-0edb-4346-8276-977c434abe90");
unHighlightThis.push("citygml");
unHighlightThis.push("node_0");
unHighlightThis.push("node_1");
      tmsLayer.unHighlight(unHighlightThis);
    })

    addEvent(hide,"click",function(){
      var hideThis = ["DEB_LOD2_UUID_fdf1a5fa-c9dc-49fe-bc85-871b32aa3074"];
      tmsLayer.hideObjects(hideThis); 
   });
    
    addEvent(show,"click",function(){
        var showThis = ["DEB_LOD2_UUID_fdf1a5fa-c9dc-49fe-bc85-871b32aa3074"];
        tmsLayer.showObjects(showThis); 
    });

    function addEvent(obj, evType, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evType, fn, false);
        return true;
    } else if (obj.attachEvent) {
        var r = obj.attachEvent("on" + evType, fn);
        return r;
    } else {
        alert("Handler could not be attached");
    }
}

//*/

}



);