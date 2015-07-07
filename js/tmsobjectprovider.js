/* The tile will be empty if the tile size (north->south) is below minSize or above maxsize
 */
function TMSObjectTileProvider(options){	
    this._quadtree = undefined;
    this._tilingScheme = new Cesium.GeographicTilingScheme({
            numberOfLevelZeroTilesX : 2,
            numberOfLevelZeroTilesY : 1
        });
    this._errorEvent = new Cesium.Event();
    this._levelZeroMaximumError = Cesium.QuadtreeTileProvider.computeDefaultLevelZeroMaximumGeometricError(this._tilingScheme);

    this._id = options.id;
    this._url = options.url;
    this._layerName = options.name;

    this._maxLevel = options.maxLevel;
    this._minLevel = options.minLevel;
    this._region = options.region;
}

Object.defineProperties(TMSObjectTileProvider.prototype, {
    quadtree: {
        get: function() {
            return this._quadtree;
        },
        set: function(value) {
            this._quadtree = value;
        }
    },

    ready: {
        get: function() {
            return true;
        }
    },

    tilingScheme: {
        get: function() {
            return this._tilingScheme;
        }
    },

    errorEvent: {
        get: function() {
            return this._errorEvent;
        }
    }
});

TMSObjectTileProvider.prototype.beginUpdate = function(context, frameState, commandList) {};

TMSObjectTileProvider.prototype.endUpdate = function(context, frameState, commandList) {};

TMSObjectTileProvider.prototype.getLevelMaximumGeometricError = function(level) {
    return this._levelZeroMaximumError / (1 << level);
};

TMSObjectTileProvider.prototype.loadTile = function(context, frameState, tile) {
  if (tile.state === Cesium.QuadtreeTileLoadState.START) {
    tile.data = {
        primitive: undefined,
        freeResources: function() {
            if (Cesium.defined(this.primitive)) {
                this.primitive.destroy();
                this.primitive = undefined;
            }
        }
    };
    
    tile.state = Cesium.QuadtreeTileLoadState.DONE;   
    tile.renderable = true;
    
    var yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(tile.level);
    var tmsY = (yTiles - tile.y - 1);
    var tmsX = tile.x;
    
    if(tile.level >= this._minLevel && tile.level <= this._maxLevel){
      var intersection = Cesium.Rectangle.intersection(tile._rectangle, this._region);
      if(intersection && intersection.width > 0.0000001 && intersection.height > 0.0000001 ){
      
        var url = this._url + "/" + tile.level + "/" + tile.x + "/" + tmsY + ".bgltf";
        var dx = ( tile._rectangle.east - tile._rectangle.west ) / 2 +  tile._rectangle.west;
        var dy = ( tile._rectangle.north - tile._rectangle.south ) / 2 + tile._rectangle.south;
        var modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(new Cesium.Cartesian3.fromRadians(dx, dy, 0.0), 3.14159265, 0, 0);
        
        tile.data.primitive = Cesium.Model.fromGltf({id:{layerId:this._id}, url:url, modelMatrix:modelMatrix, scale:1, allowPicking:true, show:false});
        tile.renderable = false;
        tile.state = Cesium.QuadtreeTileLoadState.LOADING;  
      }
    }  
    if(tile.level > this._maxLevel){
      tile.renderable = false;
      tile.state = Cesium.QuadtreeTileLoadState.DONE;
    }else{
      var earthRadius = 6371000;
      tile.data.boundingSphere3D = Cesium.BoundingSphere.fromRectangle3D(tile.rectangle);
      tile.data.boundingSphere2D = Cesium.BoundingSphere.fromRectangle2D(tile.rectangle,  frameState.mapProjection);
    }        
  }
  if (tile.state === Cesium.QuadtreeTileLoadState.LOADING) {
    tile.data.primitive.update(context, frameState, []);
    if (tile.data.primitive.ready) {
      tile.data.primitive.show = true;
      tile.state = Cesium.QuadtreeTileLoadState.DONE;
      tile.renderable = true;
    }
  } 
};

TMSObjectTileProvider.prototype.computeTileVisibility = function(tile, frameState, occluders) {
    var boundingSphere;
    if (frameState.mode === Cesium.SceneMode.SCENE3D) {
        boundingSphere = tile.data.boundingSphere3D;
    } else {
        boundingSphere = tile.data.boundingSphere2D;
    }
    return frameState.cullingVolume.computeVisibility(boundingSphere);
};

TMSObjectTileProvider.prototype.showTileThisFrame = function(tile, context, frameState, commandList) {
    if(tile.data.primitive){
      //var material = tile.data.primitive.getMaterial("material_ID5");
      //if(material){
    	//  material.setValue("diffuse",new Cesium.Cartesian4(Math.random(), Math.random(), Math.random(), 1) );
      //}
      tile.data.primitive.update(context, frameState, commandList);
    }
};



TMSObjectTileProvider.prototype.computeDistanceToTile = function(tile, frameState) {
var subtractScratch = new Cesium.Cartesian3();
    var boundingSphere;
    if (frameState.mode === Cesium.SceneMode.SCENE3D) {
        boundingSphere = tile.data.boundingSphere3D;
    } else {
        boundingSphere = tile.data.boundingSphere2D;
    }
    return Math.max(0.0, Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(boundingSphere.center, frameState.camera.positionWC, subtractScratch)) - boundingSphere.radius);
};

TMSObjectTileProvider.prototype.isDestroyed = function() {
    return false;
};

TMSObjectTileProvider.prototype.destroy = function() {
    return Cesium.destroyObject(this);
};

