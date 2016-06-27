define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dijit/form/Button',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom', 
    'dojo/domReady!',
    'dojo/on',
    'dojo/text!./ViewSheds/templates/ViewSheds.html',
    'dojo/topic',
    'xstyle/css!./ViewSheds/css/ViewSheds.css',
    'dojo/dom-construct',
    'dojo/_base/Color',
    'esri/graphic',
    'esri/tasks/Geoprocessor',
    'esri/tasks/FeatureSet',
    'esri/symbols/SimpleMarkerSymbol',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/graphicsUtils',
    'esri/tasks/LinearUnit'
], function (declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Button, lang, arrayUtils, dom, ready, on, template, topic, css, domConstruct, Color, Graphic, Geoprocessor, FeatureSet, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, graphicsUtils, LinearUnit) {
    var gp;
    var map;
    var pointSymbol;
    var outline;
    var polySymbol;
    var feature;

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        name: 'ViewSheds',
        map: true,
        widgetsInTemplate: true,
        templateString: template,

        postCreate: function(){
            this.inherited(arguments);
            map = this.map;
            //Add Watershed Delineation Geoprocessing Function
        },

        initShed: function () {
            gp = new Geoprocessor("https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed");
            gp.setOutputSpatialReference({wkid: 4326});

            this.map.on("click", computeViewShed);

            var Distance = document.getElementById('Distance').value;
            var DistanceUnits = document.getElementById('distanceunit').value;
//          alert(snapDistance + ", " + snapDistanceUnits);

            function computeViewShed(evt) {
                map.graphics.clear();
        //Set GP Symbology
                pointSymbol = new SimpleMarkerSymbol();
                pointSymbol.setSize(14);
                pointSymbol.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 1));
                pointSymbol.setColor(new Color([0, 255, 0, 0.25]));

                var graphic = new Graphic(evt.mapPoint, pointSymbol);
                map.graphics.add(graphic);

                var features = [];
                features.push(graphic);
                var featureSet = new FeatureSet();
                featureSet.features = features;
                var vsDistance = new LinearUnit();

                vsDistance.distance = parseInt(Distance);  //5 is the default
                vsDistance.units = DistanceUnits; //"esriMiles" is the default;
                var params = {
                    "Input_Observation_Point": featureSet,
                    "Viewshed_Distance": vsDistance
                };
                gp.execute(params, drawViewshed);

                $('html,body').css('cursor','default');

            }

            function drawViewshed(results, messages) {
                var polySymbol = new SimpleFillSymbol();
                polySymbol.setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.5]), 1));
                polySymbol.setColor(new Color([255, 127, 0, 0.7]));
                features = results[0].value.features;
                for (var f = 0, fl = features.length; f < fl; f++) {
                    var feature = features[f];
                    feature.setSymbol(polySymbol);
                    map.graphics.add(feature);
                }
                //map.setExtent(graphicsUtils.graphicsExtent(map.graphics.graphics), true);
            }
        },

        onShed: function()
        {
            $('html,body').css('cursor','crosshair');
            this.initShed();
        },

        onClear: function()
        {
            this.map.graphics.clear();
        },

        onExport: function()
        {
            var shapewriter = new Shapefile();
 //           shapewriter.addESRIGraphics (this.map.graphics.graphics);
            shapewriter.addESRIGraphics (features);
            var outputObject = {
                    points: shapewriter.getShapefile("POINT"),
                    lines: shapewriter.getShapefile("POLYLINE"),
                    polygons: shapewriter.getShapefile("POLYGON")
            }
            var saver = new BinaryHelper();
            var anythingToDo = false;
            for (var shapefiletype in outputObject){
                    if (outputObject.hasOwnProperty(shapefiletype)){
                            if (outputObject[shapefiletype]['successful']){
                                    anythingToDo = true;
                                    for (actualfile in outputObject[shapefiletype]['shapefile']){
                                            if (outputObject[shapefiletype]['shapefile'].hasOwnProperty(actualfile)){
                                                    saver.addData({
                                                            filename: shapefiletype+"_shapefile_from_jsapi_draw",
                                                            extension: actualfile,
                                                            datablob: outputObject[shapefiletype]['shapefile'][actualfile]
                                                    });
                                            }
                                    }
                            }
                    }
            }
            if (anythingToDo) {
                    document.getElementById("btnExport").innerHTML = "Save results";
                    var div = document.createElement("div");
                    div.id = "saveButtonDiv";
                    document.getElementById("btnExport").appendChild(div);
                    saver.createSaveControl("saveButtonDiv", true);
            }
            else {
                    document.getElementById("btnExport").innerHTML = "No shapefiles created!";
            }
        },
    });
});