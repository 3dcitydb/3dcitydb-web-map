/*global define*/
define([
    'Cesium/Core/defined',
//    'Cesium/Core/defaultValue',
    'Cesium/Core/Event',
    'KnockoutES5',
    'Core/registerKnockoutBindings',
    'ViewModels/DistanceLegendViewModel',
    'ViewModels/NavigationViewModel'
], function (
        defined,
//    defaultValue,
        CesiumEvent,
        Knockout,
        registerKnockoutBindings,
        DistanceLegendViewModel,
        NavigationViewModel)
{
    'use strict';

    /**
     * @alias CesiumNavigation
     * @constructor
     *
     * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
     */
    var CesiumNavigation = function (viewerCesiumWidget) {
        initialize.apply(this, arguments);

        this._onDestroyListeners = [];
    };

    CesiumNavigation.prototype.distanceLegendViewModel = undefined;
    CesiumNavigation.prototype.navigationViewModel = undefined;
    CesiumNavigation.prototype.navigationDiv = undefined;
    CesiumNavigation.prototype.distanceLegendDiv = undefined;
    CesiumNavigation.prototype.terria = undefined;
    CesiumNavigation.prototype.container = undefined;
    CesiumNavigation.prototype._onDestroyListeners = undefined;
    CesiumNavigation.prototype._navigationLocked = false;
    
     CesiumNavigation.prototype.setNavigationLocked = function ( locked)
    {
        this._navigationLocked = locked;
        this.navigationViewModel.setNavigationLocked( this._navigationLocked );
        
    };
    
     CesiumNavigation.prototype.getNavigationLocked = function ()
    {
        return this._navigationLocked  ;
    };

    CesiumNavigation.prototype.destroy = function ()
    {
        if (defined(this.navigationViewModel))
        {
            this.navigationViewModel.destroy();
        }
        if (defined(this.distanceLegendViewModel))
        {
            this.distanceLegendViewModel.destroy();
        }

        if (defined(this.navigationDiv))
        {
            this.navigationDiv.parentNode.removeChild(this.navigationDiv);
        }
        delete this.navigationDiv;

        if (defined(this.distanceLegendDiv))
        {
            this.distanceLegendDiv.parentNode.removeChild(this.distanceLegendDiv);
        }
        delete this.distanceLegendDiv;

        if (defined(this.container))
        {
            this.container.parentNode.removeChild(this.container);
        }
        delete this.container;

        for (var i = 0; i < this._onDestroyListeners.length; i++)
        {
            this._onDestroyListeners[i]();
        }
    };

    CesiumNavigation.prototype.addOnDestroyListener = function (callback)
    {
        if (typeof callback === "function")
        {
            this._onDestroyListeners.push(callback);
        }
    };

    /**
     * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
     * @param options
     */
    function initialize(viewerCesiumWidget, options) {
        if (!defined(viewerCesiumWidget)) {
            throw new DeveloperError('CesiumWidget or Viewer is required.');
        }

//        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        var cesiumWidget = defined(viewerCesiumWidget.cesiumWidget) ? viewerCesiumWidget.cesiumWidget : viewerCesiumWidget;

        var container = document.createElement('div');
        container.className = 'cesium-widget-cesiumNavigationContainer';
        cesiumWidget.container.appendChild(container);

        this.terria = viewerCesiumWidget;
        this.terria.options = (defined(options))?options :{};
        this.terria.afterWidgetChanged = new CesiumEvent();
        this.terria.beforeWidgetChanged = new CesiumEvent();
        this.container = container;
        
        //this.navigationDiv.setAttribute("id", "navigationDiv");
        
           
          // Register custom Knockout.js bindings.  If you're not using the TerriaJS user interface, you can remove this.
        registerKnockoutBindings();

        if (!defined(this.terria.options.enableDistanceLegend) || this.terria.options.enableDistanceLegend)
        {
            this.distanceLegendDiv = document.createElement('div');
             container.appendChild(this.distanceLegendDiv);
            this.distanceLegendDiv.setAttribute("id", "distanceLegendDiv");
            this.distanceLegendViewModel = DistanceLegendViewModel.create({
                container: this.distanceLegendDiv,
                terria: this.terria,
                mapElement: container,
                enableDistanceLegend: true
            });
           
        }
     

        if ((!defined(this.terria.options.enableZoomControls) || this.terria.options.enableZoomControls) && (!defined(this.terria.options.enableCompass) || this.terria.options.enableCompass))
        {
            this.navigationDiv = document.createElement('div');
            this.navigationDiv.setAttribute("id", "navigationDiv");
            container.appendChild(this.navigationDiv);
            // Create the navigation controls.
            this.navigationViewModel = NavigationViewModel.create({
                container: this.navigationDiv,
                terria: this.terria,
                enableZoomControls: true,
                enableCompass: true
            });
        }
        else  if ((defined(this.terria.options.enableZoomControls) && !this.terria.options.enableZoomControls) && (!defined(this.terria.options.enableCompass) || this.terria.options.enableCompass))
        {
            this.navigationDiv = document.createElement('div');
            this.navigationDiv.setAttribute("id", "navigationDiv");
            container.appendChild(this.navigationDiv);
            // Create the navigation controls.
            this.navigationViewModel = NavigationViewModel.create({
                container: this.navigationDiv,
                terria: this.terria,
                enableZoomControls: false,
                enableCompass: true
            });
        }
        else  if ((!defined(this.terria.options.enableZoomControls) || this.terria.options.enableZoomControls) && (defined(this.terria.options.enableCompass) && !this.terria.options.enableCompass))
        {
            this.navigationDiv = document.createElement('div');
            this.navigationDiv.setAttribute("id", "navigationDiv");
            container.appendChild(this.navigationDiv);
            // Create the navigation controls.
            this.navigationViewModel = NavigationViewModel.create({
                container: this.navigationDiv,
                terria: this.terria,
                enableZoomControls: true,
                enableCompass: false
            });
        }
        else  if ((defined(this.terria.options.enableZoomControls) &&  !this.terria.options.enableZoomControls) && (defined(this.terria.options.enableCompass) &&  !this.terria.options.enableCompass))
        {
            //this.navigationDiv.setAttribute("id", "navigationDiv");
           // container.appendChild(this.navigationDiv);
            // Create the navigation controls.
//            this.navigationViewModel = NavigationViewModel.create({
//                container: this.navigationDiv,
//                terria: this.terria,
//                enableZoomControls: false,
//                enableCompass: false
//            });
        }

    }

    return CesiumNavigation;
});
