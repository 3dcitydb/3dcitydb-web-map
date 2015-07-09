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
        var buildingsextent = new Cesium.Rectangle.fromDegrees(13.3813476562, 52.5228881836, 13.3840942383, 52.5256347656);
      
        var options = {url:'http://localhost/www/berlintms', name:"buildingslayer", minLevel:15, maxLevel:15, region:buildingsextent, id:"tmsOLayer"};
        
        tmsLayer = new TMSObjectLayer(options);
        webMap.addLayer(tmsLayer);
    });
    
    addEvent(remove, "click", function(){
        webMap.removeLayer("tmsOLayer");
    });

    addEvent(highlight,"click",function(){
      var highlightThis = {
        "DEB_LOD2_UUID_fdf1a5fa-c9dc-49fe-bc85-871b32aa3074" : Cesium.Color.CRIMSON
      };
      tmsLayer.highlight(highlightThis);  
   });

    addEvent(dehighlight,"click",function(){
      var unHighlightThis = [];
      unHighlightThis.push("DEB_LOD2_UUID_fdf1a5fa-c9dc-49fe-bc85-871b32aa3074");
      tmsLayer.unHighlight(unHighlightThis);
    })

    addEvent(hide,"click",function(){
      var hideThis = ["DEB_LOD2_UUID_fdf1a5fa-c9dc-49fe-bc85-871b32aa3074"];
      tmsLayer.hideObjects(hideThis); 
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