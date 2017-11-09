/*
 * 3DCityDB-Web-Map
 * http://www.3dcitydb.org/
 * 
 * Copyright 2015 - 2017
 * Chair of Geoinformatics
 * Technical University of Munich, Germany
 * https://www.gis.bgu.tum.de/
 * 
 * The 3DCityDB-Web-Map is jointly developed with the following
 * cooperation partners:
 * 
 * virtualcitySYSTEMS GmbH, Berlin <http://www.virtualcitysystems.de/>
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *     
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * This is an extended version of the Cesium KmlDataSource class
 * It should be specifically used to load KML/Gltf-Networklink data exported from a 3DCityDB instance using the 3DCityDB-KML/Collada Exporter
 * @see {@link http://www.3dcitydb.net/3dcitydb/3dimpexp/|3D City Database Importer Exporter}
 */

(function() {
	// loading referenced Cesium classes
    var BoundingRectangle = Cesium.BoundingRectangle;
    var Cartesian2 = Cesium.Cartesian2;
    var Cartesian3 = Cesium.Cartesian3;
    var Cartesian4 = Cesium.Cartesian4;
    var Cartographic = Cesium.Cartographic;
    var defined = Cesium.defined;
    var DeveloperError = Cesium.DeveloperError;
    var CesiumMath = Cesium.Math;
    var Matrix4 = Cesium.Matrix4;
    var Transforms = Cesium.Transforms;
    var SceneMode = Cesium.SceneMode;

    /**
     * Functions that do scene-dependent transforms between rendering-related coordinate systems.
     *
     * @exports SceneTransforms
     */
    var SceneTransforms = {};

    var actualPositionScratch = new Cartesian4(0, 0, 0, 1);
    var positionCC = new Cartesian4();
    var scratchViewport = new BoundingRectangle();

    var scratchWindowCoord0 = new Cartesian2();
    var scratchWindowCoord1 = new Cartesian2();

    /**
     * Transforms a position in WGS84 coordinates to window coordinates.  This is commonly used to place an
     * HTML element at the same screen position as an object in the scene.
     *
     * @param {Scene} scene The scene.
     * @param {Cartesian3} position The position in WGS84 (world) coordinates.
     * @param {Cartesian2} [result] An optional object to return the input position transformed to window coordinates.
     * @returns {Cartesian2} The modified result parameter or a new Cartesian2 instance if one was not provided.  This may be <code>undefined</code> if the input position is near the center of the ellipsoid.
     *
     * @example
     * // Output the window position of longitude/latitude (0, 0) every time the mouse moves.
     * var scene = widget.scene;
     * var ellipsoid = scene.globe.ellipsoid;
     * var position = Cesium.Cartesian3.fromDegrees(0.0, 0.0);
     * var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
     * handler.setInputAction(function(movement) {
     *     console.log(Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position));
     * }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
     */
    SceneTransforms.wgs84ToWindowCoordinates = function(scene, position, result) {
        return SceneTransforms.wgs84WithEyeOffsetToWindowCoordinates(scene, position, Cartesian3.ZERO, result);
    };

    var scratchCartesian4 = new Cartesian4();
    var scratchEyeOffset = new Cartesian3();

    function worldToClip(position, eyeOffset, camera, result) {
        var viewMatrix = camera.viewMatrix;

        var positionEC = Matrix4.multiplyByVector(viewMatrix, Cartesian4.fromElements(position.x, position.y, position.z, 1, scratchCartesian4), scratchCartesian4);

        var zEyeOffset = Cartesian3.multiplyComponents(eyeOffset, Cartesian3.normalize(positionEC, scratchEyeOffset), scratchEyeOffset);
        positionEC.x += eyeOffset.x + zEyeOffset.x;
        positionEC.y += eyeOffset.y + zEyeOffset.y;
        positionEC.z += zEyeOffset.z;

        return Matrix4.multiplyByVector(camera.frustum.projectionMatrix, positionEC, result);
    }

    var scratchMaxCartographic = new Cartographic(Math.PI, CesiumMath.PI_OVER_TWO);
    var scratchProjectedCartesian = new Cartesian3();
    var scratchCameraPosition = new Cartesian3();

    /**
     * @private
     */
    SceneTransforms.wgs84WithEyeOffsetToWindowCoordinates = function(scene, position, eyeOffset, result) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(scene)) {
            throw new DeveloperError('scene is required.');
        }
        if (!defined(position)) {
            throw new DeveloperError('position is required.');
        }
        //>>includeEnd('debug');

        // Transform for 3D, 2D, or Columbus view
        var frameState = scene.frameState;
        var actualPosition = SceneTransforms.computeActualWgs84Position(frameState, position, actualPositionScratch);

        if (!defined(actualPosition)) {
            return undefined;
        }

        // Assuming viewport takes up the entire canvas...
        var canvas = scene.canvas;
        var viewport = scratchViewport;
        viewport.x = 0;
        viewport.y = 0;
        viewport.width = canvas.clientWidth;
        viewport.height = canvas.clientHeight;

        var camera = scene.camera;
        var cameraCentered = false;

        if (frameState.mode === SceneMode.SCENE2D) {
            var projection = scene.mapProjection;
            var maxCartographic = scratchMaxCartographic;
            var maxCoord = projection.project(maxCartographic, scratchProjectedCartesian);

            var cameraPosition = Cartesian3.clone(camera.position, scratchCameraPosition);
            var frustum = camera.frustum.clone();

            var viewportTransformation = Matrix4.computeViewportTransformation(viewport, 0.0, 1.0, new Matrix4());
            var projectionMatrix = camera.frustum.projectionMatrix;

            var x = camera.positionWC.y;
            var eyePoint = Cartesian3.fromElements(CesiumMath.sign(x) * maxCoord.x - x, 0.0, -camera.positionWC.x);
            var windowCoordinates = Transforms.pointToGLWindowCoordinates(projectionMatrix, viewportTransformation, eyePoint);

            if (x === 0.0 || windowCoordinates.x <= 0.0 || windowCoordinates.x >= canvas.clientWidth) {
                cameraCentered = true;
            } else {
                if (windowCoordinates.x > canvas.clientWidth * 0.5) {
                    viewport.width = windowCoordinates.x;

                    camera.frustum.right = maxCoord.x - x;

                    positionCC = worldToClip(actualPosition, eyeOffset, camera, positionCC);
                    SceneTransforms.clipToGLWindowCoordinates(viewport, positionCC, scratchWindowCoord0);

                    viewport.x += windowCoordinates.x;

                    camera.position.x = -camera.position.x;

                    var right = camera.frustum.right;
                    camera.frustum.right = -camera.frustum.left;
                    camera.frustum.left = -right;

                    positionCC = worldToClip(actualPosition, eyeOffset, camera, positionCC);
                    SceneTransforms.clipToGLWindowCoordinates(viewport, positionCC, scratchWindowCoord1);
                } else {
                    viewport.x += windowCoordinates.x;
                    viewport.width -= windowCoordinates.x;

                    camera.frustum.left = -maxCoord.x - x;

                    positionCC = worldToClip(actualPosition, eyeOffset, camera, positionCC);
                    SceneTransforms.clipToGLWindowCoordinates(viewport, positionCC, scratchWindowCoord0);

                    viewport.x = viewport.x - viewport.width;

                    camera.position.x = -camera.position.x;

                    var left = camera.frustum.left;
                    camera.frustum.left = -camera.frustum.right;
                    camera.frustum.right = -left;

                    positionCC = worldToClip(actualPosition, eyeOffset, camera, positionCC);
                    SceneTransforms.clipToGLWindowCoordinates(viewport, positionCC, scratchWindowCoord1);
                }

                Cartesian3.clone(cameraPosition, camera.position);
                camera.frustum = frustum.clone();

                result = Cartesian2.clone(scratchWindowCoord0, result);
                if (result.x < 0.0 || result.x > canvas.clientWidth) {
                    result.x = scratchWindowCoord1.x;
                }
            }
        }

        if (frameState.mode !== SceneMode.SCENE2D || cameraCentered) {
            // View-projection matrix to transform from world coordinates to clip coordinates
            positionCC = worldToClip(actualPosition, eyeOffset, camera, positionCC);
            if (positionCC.z < 0 && frameState.mode !== SceneMode.SCENE2D) {
//	----> Changes to Cesium-Version 1.30 for 3dcitydb-web-map
            //  return undefined;
                positionCC.y = 0 - positionCC.y;
// <-----------------------------------------------------------------------
            }
            
            result = SceneTransforms.clipToGLWindowCoordinates(viewport, positionCC, result);
        }

        result.y = canvas.clientHeight - result.y;
        return result;
    };

    /**
     * Transforms a position in WGS84 coordinates to drawing buffer coordinates.  This may produce different
     * results from SceneTransforms.wgs84ToWindowCoordinates when the browser zoom is not 100%, or on high-DPI displays.
     *
     * @param {Scene} scene The scene.
     * @param {Cartesian3} position The position in WGS84 (world) coordinates.
     * @param {Cartesian2} [result] An optional object to return the input position transformed to window coordinates.
     * @returns {Cartesian2} The modified result parameter or a new Cartesian2 instance if one was not provided.  This may be <code>undefined</code> if the input position is near the center of the ellipsoid.
     *
     * @example
     * // Output the window position of longitude/latitude (0, 0) every time the mouse moves.
     * var scene = widget.scene;
     * var ellipsoid = scene.globe.ellipsoid;
     * var position = Cesium.Cartesian3.fromDegrees(0.0, 0.0);
     * var handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
     * handler.setInputAction(function(movement) {
     *     console.log(Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position));
     * }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
     */
    SceneTransforms.wgs84ToDrawingBufferCoordinates = function(scene, position, result) {
        result = SceneTransforms.wgs84ToWindowCoordinates(scene, position, result);
        if (!defined(result)) {
            return undefined;
        }

        return SceneTransforms.transformWindowToDrawingBuffer(scene, result, result);
    };

    var projectedPosition = new Cartesian3();
    var positionInCartographic = new Cartographic();

    /**
     * @private
     */
    SceneTransforms.computeActualWgs84Position = function(frameState, position, result) {
        var mode = frameState.mode;

        if (mode === SceneMode.SCENE3D) {
            return Cartesian3.clone(position, result);
        }

        var projection = frameState.mapProjection;
        var cartographic = projection.ellipsoid.cartesianToCartographic(position, positionInCartographic);
        if (!defined(cartographic)) {
            return undefined;
        }

        projection.project(cartographic, projectedPosition);

        if (mode === SceneMode.COLUMBUS_VIEW) {
            return Cartesian3.fromElements(projectedPosition.z, projectedPosition.x, projectedPosition.y, result);
        }

        if (mode === SceneMode.SCENE2D) {
            return Cartesian3.fromElements(0.0, projectedPosition.x, projectedPosition.y, result);
        }

        // mode === SceneMode.MORPHING
        var morphTime = frameState.morphTime;
        return Cartesian3.fromElements(
            CesiumMath.lerp(projectedPosition.z, position.x, morphTime),
            CesiumMath.lerp(projectedPosition.x, position.y, morphTime),
            CesiumMath.lerp(projectedPosition.y, position.z, morphTime),
            result);
    };

    var positionNDC = new Cartesian3();
    var positionWC = new Cartesian3();
    var viewportTransform = new Matrix4();

    /**
     * @private
     */
    SceneTransforms.clipToGLWindowCoordinates = function(viewport, position, result) {
        // Perspective divide to transform from clip coordinates to normalized device coordinates
        Cartesian3.divideByScalar(position, position.w, positionNDC);

        // Viewport transform to transform from clip coordinates to window coordinates
        Matrix4.computeViewportTransformation(viewport, 0.0, 1.0, viewportTransform);
        Matrix4.multiplyByPoint(viewportTransform, positionNDC, positionWC);

        return Cartesian2.fromCartesian3(positionWC, result);
    };

    /**
     * @private
     */
    SceneTransforms.clipToDrawingBufferCoordinates = function(viewport, position, result) {
        // Perspective divide to transform from clip coordinates to normalized device coordinates
        Cartesian3.divideByScalar(position, position.w, positionNDC);

        // Viewport transform to transform from clip coordinates to drawing buffer coordinates
        Matrix4.computeViewportTransformation(viewport, 0.0, 1.0, viewportTransform);
        Matrix4.multiplyByPoint(viewportTransform, positionNDC, positionWC);

        return Cartesian2.fromCartesian3(positionWC, result);
    };

    /**
     * @private
     */
    SceneTransforms.transformWindowToDrawingBuffer = function(scene, windowPosition, result) {
        var canvas = scene.canvas;
        var xScale = scene.drawingBufferWidth / canvas.clientWidth;
        var yScale = scene.drawingBufferHeight / canvas.clientHeight;
        return Cartesian2.fromElements(windowPosition.x * xScale, windowPosition.y * yScale, result);
    };

    var scratchNDC = new Cartesian4();
    var scratchWorldCoords = new Cartesian4();

    /**
     * @private
     */
    SceneTransforms.drawingBufferToWgs84Coordinates = function(scene, drawingBufferPosition, depth, result) {
        var context = scene.context;
        var uniformState = context.uniformState;

        var viewport = scene._passState.viewport;
        var ndc = Cartesian4.clone(Cartesian4.UNIT_W, scratchNDC);
        ndc.x = (drawingBufferPosition.x - viewport.x) / viewport.width * 2.0 - 1.0;
        ndc.y = (drawingBufferPosition.y - viewport.y) / viewport.height * 2.0 - 1.0;
        ndc.z = (depth * 2.0) - 1.0;
        ndc.w = 1.0;

        var worldCoords = Matrix4.multiplyByVector(uniformState.inverseViewProjection, ndc, scratchWorldCoords);

        // Reverse perspective divide
        var w = 1.0 / worldCoords.w;
        Cartesian3.multiplyByScalar(worldCoords, w, worldCoords);

        return Cartesian3.fromCartesian4(worldCoords, result);
    };
    
    window.CitydbSceneTransforms = SceneTransforms;
})();



