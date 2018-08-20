define([
        '../Core/Cartesian2',
        '../Core/Cartesian3',
        '../Core/Cartographic',
        '../Core/Check',
        '../Core/defaultValue',
        '../Core/defined',
        '../Core/defineProperties',
        '../Core/deprecationWarning',
        '../Core/destroyObject',
        '../Core/DeveloperError',
        '../Core/DoublyLinkedList',
        '../Core/Ellipsoid',
        '../Core/Event',
        '../Core/getMagic',
        '../Core/JulianDate',
        '../Core/ManagedArray',
        '../Core/Math',
        '../Core/Matrix4',
        '../Core/Resource',
        '../Core/RuntimeError',
        '../Renderer/ClearCommand',
        '../Renderer/Pass',
        '../ThirdParty/when',
        './Axis',
        './Cesium3DTile',
        './Cesium3DTileColorBlendMode',
        './Cesium3DTileContentState',
        './Cesium3DTileOptimizations',
        './Cesium3DTileRefine',
        './Cesium3DTilesetCache',
        './Cesium3DTilesetStatistics',
        './Cesium3DTilesetTraversal',
        './Cesium3DTileStyleEngine',
        './ClippingPlaneCollection',
        './LabelCollection',
        './PointCloudEyeDomeLighting',
        './PointCloudShading',
        './SceneMode',
        './ShadowMode',
        './TileBoundingRegion',
        './TileBoundingSphere',
        './TileOrientedBoundingBox'
    ], function(
        Cartesian2,
        Cartesian3,
        Cartographic,
        Check,
        defaultValue,
        defined,
        defineProperties,
        deprecationWarning,
        destroyObject,
        DeveloperError,
        DoublyLinkedList,
        Ellipsoid,
        Event,
        getMagic,
        JulianDate,
        ManagedArray,
        CesiumMath,
        Matrix4,
        Resource,
        RuntimeError,
        ClearCommand,
        Pass,
        when,
        Axis,
        Cesium3DTile,
        Cesium3DTileColorBlendMode,
        Cesium3DTileContentState,
        Cesium3DTileOptimizations,
        Cesium3DTileRefine,
        Cesium3DTilesetCache,
        Cesium3DTilesetStatistics,
        Cesium3DTilesetTraversal,
        Cesium3DTileStyleEngine,
        ClippingPlaneCollection,
        LabelCollection,
        PointCloudEyeDomeLighting,
        PointCloudShading,
        SceneMode,
        ShadowMode,
        TileBoundingRegion,
        TileBoundingSphere,
        TileOrientedBoundingBox) {
    'use strict';

    /**
     * A {@link https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification|3D Tiles tileset},
     * used for streaming massive heterogeneous 3D geospatial datasets.
     *
     * @alias Cesium3DTileset
     * @constructor
     *
     * @param {Object} options Object with the following properties:
     * @param {Resource|String|Promise<Resource>|Promise<String>} options.url The url to a tileset JSON file.
     * @param {Boolean} [options.show=true] Determines if the tileset will be shown.
     * @param {Matrix4} [options.modelMatrix=Matrix4.IDENTITY] A 4x4 transformation matrix that transforms the tileset's root tile.
     * @param {ShadowMode} [options.shadows=ShadowMode.ENABLED] Determines whether the tileset casts or receives shadows from each light source.
     * @param {Number} [options.maximumScreenSpaceError=16] The maximum screen space error used to drive level of detail refinement.
     * @param {Number} [options.maximumMemoryUsage=512] The maximum amount of memory in MB that can be used by the tileset.
     * @param {Boolean} [options.cullWithChildrenBounds=true] Optimization option. Whether to cull tiles using the union of their children bounding volumes.
     * @param {Boolean} [options.dynamicScreenSpaceError=false] Optimization option. Reduce the screen space error for tiles that are further away from the camera.
     * @param {Number} [options.dynamicScreenSpaceErrorDensity=0.00278] Density used to adjust the dynamic screen space error, similar to fog density.
     * @param {Number} [options.dynamicScreenSpaceErrorFactor=4.0] A factor used to increase the computed dynamic screen space error.
     * @param {Number} [options.dynamicScreenSpaceErrorHeightFalloff=0.25] A ratio of the tileset's height at which the density starts to falloff.
     * @param {Boolean} [options.skipLevelOfDetail=true] Optimization option. Determines if level of detail skipping should be applied during the traversal.
     * @param {Number} [options.baseScreenSpaceError=1024] When <code>skipLevelOfDetail</code> is <code>true</code>, the screen space error that must be reached before skipping levels of detail.
     * @param {Number} [options.skipScreenSpaceErrorFactor=16] When <code>skipLevelOfDetail</code> is <code>true</code>, a multiplier defining the minimum screen space error to skip. Used in conjunction with <code>skipLevels</code> to determine which tiles to load.
     * @param {Number} [options.skipLevels=1] When <code>skipLevelOfDetail</code> is <code>true</code>, a constant defining the minimum number of levels to skip when loading tiles. When it is 0, no levels are skipped. Used in conjunction with <code>skipScreenSpaceErrorFactor</code> to determine which tiles to load.
     * @param {Boolean} [options.immediatelyLoadDesiredLevelOfDetail=false] When <code>skipLevelOfDetail</code> is <code>true</code>, only tiles that meet the maximum screen space error will ever be downloaded. Skipping factors are ignored and just the desired tiles are loaded.
     * @param {Boolean} [options.loadSiblings=false] When <code>skipLevelOfDetail</code> is <code>true</code>, determines whether siblings of visible tiles are always downloaded during traversal.
     * @param {ClippingPlaneCollection} [options.clippingPlanes] The {@link ClippingPlaneCollection} used to selectively disable rendering the tileset.
     * @param {ClassificationType} [options.classificationType] Determines whether terrain, 3D Tiles or both will be classified by this tileset. See {@link Cesium3DTileset#classificationType} for details about restrictions and limitations.
     * @param {Ellipsoid} [options.ellipsoid=Ellipsoid.WGS84] The ellipsoid determining the size and shape of the globe.
     * @param {Object} [options.pointCloudShading] Options for constructing a {@link PointCloudShading} object to control point attenuation based on geometric error and lighting.
     * @param {Boolean} [options.debugFreezeFrame=false] For debugging only. Determines if only the tiles from last frame should be used for rendering.
     * @param {Boolean} [options.debugColorizeTiles=false] For debugging only. When true, assigns a random color to each tile.
     * @param {Boolean} [options.debugWireframe=false] For debugging only. When true, render's each tile's content as a wireframe.
     * @param {Boolean} [options.debugShowBoundingVolume=false] For debugging only. When true, renders the bounding volume for each tile.
     * @param {Boolean} [options.debugShowContentBoundingVolume=false] For debugging only. When true, renders the bounding volume for each tile's content.
     * @param {Boolean} [options.debugShowViewerRequestVolume=false] For debugging only. When true, renders the viewer request volume for each tile.
     * @param {Boolean} [options.debugShowGeometricError=false] For debugging only. When true, draws labels to indicate the geometric error of each tile.
     * @param {Boolean} [options.debugShowRenderingStatistics=false] For debugging only. When true, draws labels to indicate the number of commands, points, triangles and features for each tile.
     * @param {Boolean} [options.debugShowMemoryUsage=false] For debugging only. When true, draws labels to indicate the texture and geometry memory in megabytes used by each tile.
     * @param {Boolean} [options.debugShowUrl=false] For debugging only. When true, draws labels to indicate the url of each tile.
     *
     * @exception {DeveloperError} The tileset must be 3D Tiles version 0.0 or 1.0.
     *
     * @example
     * var tileset = scene.primitives.add(new Cesium.Cesium3DTileset({
     *      url : 'http://localhost:8002/tilesets/Seattle/tileset.json'
     * }));
     *
     * @example
     * // Common setting for the skipLevelOfDetail optimization
     * var tileset = scene.primitives.add(new Cesium.Cesium3DTileset({
     *      url : 'http://localhost:8002/tilesets/Seattle/tileset.json',
     *      skipLevelOfDetail : true,
     *      baseScreenSpaceError : 1024,
     *      skipScreenSpaceErrorFactor : 16,
     *      skipLevels : 1,
     *      immediatelyLoadDesiredLevelOfDetail : false,
     *      loadSiblings : false,
     *      cullWithChildrenBounds : true
     * }));
     *
     * @example
     * // Common settings for the dynamicScreenSpaceError optimization
     * var tileset = scene.primitives.add(new Cesium.Cesium3DTileset({
     *      url : 'http://localhost:8002/tilesets/Seattle/tileset.json',
     *      dynamicScreenSpaceError : true,
     *      dynamicScreenSpaceErrorDensity : 0.00278,
     *      dynamicScreenSpaceErrorFactor : 4.0,
     *      dynamicScreenSpaceErrorHeightFalloff : 0.25
     * }));
     *
     * @see {@link https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification|3D Tiles specification}
     */
    function Cesium3DTileset(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        //>>includeStart('debug', pragmas.debug);
        Check.defined('options.url', options.url);
        //>>includeEnd('debug');

        this._url = undefined;
        this._basePath = undefined;
        this._root = undefined;
        this._asset = undefined; // Metadata for the entire tileset
        this._properties = undefined; // Metadata for per-model/point/etc properties
        this._geometricError = undefined; // Geometric error when the tree is not rendered at all
        this._extensionsUsed = undefined;
        this._gltfUpAxis = undefined;
        this._cache = new Cesium3DTilesetCache();
        this._processingQueue = [];
        this._selectedTiles = [];
        this._emptyTiles = [];
        this._requestedTiles = [];
        this._selectedTilesToStyle = [];
        this._loadTimestamp = undefined;
        this._timeSinceLoad = 0.0;

        this._cullWithChildrenBounds = defaultValue(options.cullWithChildrenBounds, true);
        this._allTilesAdditive = true;

        this._hasMixedContent = false;

        this._backfaceCommands = new ManagedArray();

        this._maximumScreenSpaceError = defaultValue(options.maximumScreenSpaceError, 16);
        this._maximumMemoryUsage = defaultValue(options.maximumMemoryUsage, 512);

        this._styleEngine = new Cesium3DTileStyleEngine();

        this._modelMatrix = defined(options.modelMatrix) ? Matrix4.clone(options.modelMatrix) : Matrix4.clone(Matrix4.IDENTITY);

        this._statistics = new Cesium3DTilesetStatistics();
        this._statisticsLastColor = new Cesium3DTilesetStatistics();
        this._statisticsLastPick = new Cesium3DTilesetStatistics();

        this._tilesLoaded = false;

        this._tileDebugLabels = undefined;

        this._readyPromise = when.defer();

        this._classificationType = options.classificationType;

        this._ellipsoid = defaultValue(options.ellipsoid, Ellipsoid.WGS84);

        /**
         * Optimization option. Whether the tileset should refine based on a dynamic screen space error. Tiles that are further
         * away will be rendered with lower detail than closer tiles. This improves performance by rendering fewer
         * tiles and making less requests, but may result in a slight drop in visual quality for tiles in the distance.
         * The algorithm is biased towards "street views" where the camera is close to the ground plane of the tileset and looking
         * at the horizon. In addition results are more accurate for tightly fitting bounding volumes like box and region.
         *
         * @type {Boolean}
         * @default false
         */
        this.dynamicScreenSpaceError = defaultValue(options.dynamicScreenSpaceError, false);

        /**
         * A scalar that determines the density used to adjust the dynamic screen space error, similar to {@link Fog}. Increasing this
         * value has the effect of increasing the maximum screen space error for all tiles, but in a non-linear fashion.
         * The error starts at 0.0 and increases exponentially until a midpoint is reached, and then approaches 1.0 asymptotically.
         * This has the effect of keeping high detail in the closer tiles and lower detail in the further tiles, with all tiles
         * beyond a certain distance all roughly having an error of 1.0.
         * <p>
         * The dynamic error is in the range [0.0, 1.0) and is multiplied by <code>dynamicScreenSpaceErrorFactor</code> to produce the
         * final dynamic error. This dynamic error is then subtracted from the tile's actual screen space error.
         * </p>
         * <p>
         * Increasing <code>dynamicScreenSpaceErrorDensity</code> has the effect of moving the error midpoint closer to the camera.
         * It is analogous to moving fog closer to the camera.
         * </p>
         *
         * @type {Number}
         * @default 0.00278
         */
        this.dynamicScreenSpaceErrorDensity = 0.00278;

        /**
         * A factor used to increase the screen space error of tiles for dynamic screen space error. As this value increases less tiles
         * are requested for rendering and tiles in the distance will have lower detail. If set to zero, the feature will be disabled.
         *
         * @type {Number}
         * @default 4.0
         */
        this.dynamicScreenSpaceErrorFactor = 4.0;

        /**
         * A ratio of the tileset's height at which the density starts to falloff. If the camera is below this height the
         * full computed density is applied, otherwise the density falls off. This has the effect of higher density at
         * street level views.
         * <p>
         * Valid values are between 0.0 and 1.0.
         * </p>
         *
         * @type {Number}
         * @default 0.25
         */
        this.dynamicScreenSpaceErrorHeightFalloff = 0.25;

        this._dynamicScreenSpaceErrorComputedDensity = 0.0; // Updated based on the camera position and direction

        /**
         * Determines whether the tileset casts or receives shadows from each light source.
         * <p>
         * Enabling shadows has a performance impact. A tileset that casts shadows must be rendered twice, once from the camera and again from the light's point of view.
         * </p>
         * <p>
         * Shadows are rendered only when {@link Viewer#shadows} is <code>true</code>.
         * </p>
         *
         * @type {ShadowMode}
         * @default ShadowMode.ENABLED
         */
        this.shadows = defaultValue(options.shadows, ShadowMode.ENABLED);

        /**
         * Determines if the tileset will be shown.
         *
         * @type {Boolean}
         * @default true
         */
        this.show = defaultValue(options.show, true);

        /**
         * Defines how per-feature colors set from the Cesium API or declarative styling blend with the source colors from
         * the original feature, e.g. glTF material or per-point color in the tile.
         *
         * @type {Cesium3DTileColorBlendMode}
         * @default Cesium3DTileColorBlendMode.HIGHLIGHT
         */
        this.colorBlendMode = Cesium3DTileColorBlendMode.HIGHLIGHT;

        /**
         * Defines the value used to linearly interpolate between the source color and feature color when the {@link Cesium3DTileset#colorBlendMode} is <code>MIX</code>.
         * A value of 0.0 results in the source color while a value of 1.0 results in the feature color, with any value in-between
         * resulting in a mix of the source color and feature color.
         *
         * @type {Number}
         * @default 0.5
         */
        this.colorBlendAmount = 0.5;

        /**
         * Options for controlling point size based on geometric error and eye dome lighting.
         * @type {PointCloudShading}
         */
        this.pointCloudShading = new PointCloudShading(options.pointCloudShading);

        this._pointCloudEyeDomeLighting = new PointCloudEyeDomeLighting();

        /**
         * The event fired to indicate progress of loading new tiles.  This event is fired when a new tile
         * is requested, when a requested tile is finished downloading, and when a downloaded tile has been
         * processed and is ready to render.
         * <p>
         * The number of pending tile requests, <code>numberOfPendingRequests</code>, and number of tiles
         * processing, <code>numberOfTilesProcessing</code> are passed to the event listener.
         * </p>
         * <p>
         * This event is fired at the end of the frame after the scene is rendered.
         * </p>
         *
         * @type {Event}
         * @default new Event()
         *
         * @example
         * tileset.loadProgress.addEventListener(function(numberOfPendingRequests, numberOfTilesProcessing) {
         *     if ((numberOfPendingRequests === 0) && (numberOfTilesProcessing === 0)) {
         *         console.log('Stopped loading');
         *         return;
         *     }
         *
         *     console.log('Loading: requests: ' + numberOfPendingRequests + ', processing: ' + numberOfTilesProcessing);
         * });
         */
        this.loadProgress = new Event();

        /**
         * The event fired to indicate that all tiles that meet the screen space error this frame are loaded. The tileset
         * is completely loaded for this view.
         * <p>
         * This event is fired at the end of the frame after the scene is rendered.
         * </p>
         *
         * @type {Event}
         * @default new Event()
         *
         * @example
         * tileset.allTilesLoaded.addEventListener(function() {
         *     console.log('All tiles are loaded');
         * });
         *
         * @see Cesium3DTileset#tilesLoaded
         */
        this.allTilesLoaded = new Event();

        /**
         * The event fired to indicate that a tile's content was loaded.
         * <p>
         * The loaded {@link Cesium3DTile} is passed to the event listener.
         * </p>
         * <p>
         * This event is fired during the tileset traversal while the frame is being rendered
         * so that updates to the tile take effect in the same frame.  Do not create or modify
         * Cesium entities or primitives during the event listener.
         * </p>
         *
         * @type {Event}
         * @default new Event()
         *
         * @example
         * tileset.tileLoad.addEventListener(function(tile) {
         *     console.log('A tile was loaded.');
         * });
         */
        this.tileLoad = new Event();

        /**
         * The event fired to indicate that a tile's content was unloaded.
         * <p>
         * The unloaded {@link Cesium3DTile} is passed to the event listener.
         * </p>
         * <p>
         * This event is fired immediately before the tile's content is unloaded while the frame is being
         * rendered so that the event listener has access to the tile's content.  Do not create
         * or modify Cesium entities or primitives during the event listener.
         * </p>
         *
         * @type {Event}
         * @default new Event()
         *
         * @example
         * tileset.tileUnload.addEventListener(function(tile) {
         *     console.log('A tile was unloaded from the cache.');
         * });
         *
         * @see Cesium3DTileset#maximumMemoryUsage
         * @see Cesium3DTileset#trimLoadedTiles
         */
        this.tileUnload = new Event();

        /**
         * The event fired to indicate that a tile's content failed to load.
         * <p>
         * If there are no event listeners, error messages will be logged to the console.
         * </p>
         * <p>
         * The error object passed to the listener contains two properties:
         * <ul>
         * <li><code>url</code>: the url of the failed tile.</li>
         * <li><code>message</code>: the error message.</li>
         * </ul>
         *
         * @type {Event}
         * @default new Event()
         *
         * @example
         * tileset.tileFailed.addEventListener(function(error) {
         *     console.log('An error occurred loading tile: ' + error.url);
         *     console.log('Error: ' + error.message);
         * });
         */
        this.tileFailed = new Event();

        /**
         * This event fires once for each visible tile in a frame.  This can be used to manually
         * style a tileset.
         * <p>
         * The visible {@link Cesium3DTile} is passed to the event listener.
         * </p>
         * <p>
         * This event is fired during the tileset traversal while the frame is being rendered
         * so that updates to the tile take effect in the same frame.  Do not create or modify
         * Cesium entities or primitives during the event listener.
         * </p>
         *
         * @type {Event}
         * @default new Event()
         *
         * @example
         * tileset.tileVisible.addEventListener(function(tile) {
         *     if (tile.content instanceof Cesium.Batched3DModel3DTileContent) {
         *         console.log('A Batched 3D Model tile is visible.');
         *     }
         * });
         *
         * @example
         * // Apply a red style and then manually set random colors for every other feature when the tile becomes visible.
         * tileset.style = new Cesium.Cesium3DTileStyle({
         *     color : 'color("red")'
         * });
         * tileset.tileVisible.addEventListener(function(tile) {
         *     var content = tile.content;
         *     var featuresLength = content.featuresLength;
         *     for (var i = 0; i < featuresLength; i+=2) {
         *         content.getFeature(i).color = Cesium.Color.fromRandom();
         *     }
         * });
         */
        this.tileVisible = new Event();

        /**
         * Optimization option. Determines if level of detail skipping should be applied during the traversal.
         * <p>
         * The common strategy for replacement-refinement traversal is to store all levels of the tree in memory and require
         * all children to be loaded before the parent can refine. With this optimization levels of the tree can be skipped
         * entirely and children can be rendered alongside their parents. The tileset requires significantly less memory when
         * using this optimization.
         * </p>
         *
         * @type {Boolean}
         * @default true
         */
        this.skipLevelOfDetail = defaultValue(options.skipLevelOfDetail, true);
        this._skipLevelOfDetail = this.skipLevelOfDetail;
        this._disableSkipLevelOfDetail = false;

        /**
         * The screen space error that must be reached before skipping levels of detail.
         * <p>
         * Only used when {@link Cesium3DTileset#skipLevelOfDetail} is <code>true</code>.
         * </p>
         *
         * @type {Number}
         * @default 1024
         */
        this.baseScreenSpaceError = defaultValue(options.baseScreenSpaceError, 1024);

        /**
         * Multiplier defining the minimum screen space error to skip.
         * For example, if a tile has screen space error of 100, no tiles will be loaded unless they
         * are leaves or have a screen space error <code><= 100 / skipScreenSpaceErrorFactor</code>.
         * <p>
         * Only used when {@link Cesium3DTileset#skipLevelOfDetail} is <code>true</code>.
         * </p>
         *
         * @type {Number}
         * @default 16
         */
        this.skipScreenSpaceErrorFactor = defaultValue(options.skipScreenSpaceErrorFactor, 16);

        /**
         * Constant defining the minimum number of levels to skip when loading tiles. When it is 0, no levels are skipped.
         * For example, if a tile is level 1, no tiles will be loaded unless they are at level greater than 2.
         * <p>
         * Only used when {@link Cesium3DTileset#skipLevelOfDetail} is <code>true</code>.
         * </p>
         *
         * @type {Number}
         * @default 1
         */
        this.skipLevels = defaultValue(options.skipLevels, 1);

        /**
         * When true, only tiles that meet the maximum screen space error will ever be downloaded.
         * Skipping factors are ignored and just the desired tiles are loaded.
         * <p>
         * Only used when {@link Cesium3DTileset#skipLevelOfDetail} is <code>true</code>.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.immediatelyLoadDesiredLevelOfDetail = defaultValue(options.immediatelyLoadDesiredLevelOfDetail, false);

        /**
         * Determines whether siblings of visible tiles are always downloaded during traversal.
         * This may be useful for ensuring that tiles are already available when the viewer turns left/right.
         * <p>
         * Only used when {@link Cesium3DTileset#skipLevelOfDetail} is <code>true</code>.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.loadSiblings = defaultValue(options.loadSiblings, false);

        this._clippingPlanes = undefined;
        this.clippingPlanes = options.clippingPlanes;

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * Determines if only the tiles from last frame should be used for rendering.  This
         * effectively "freezes" the tileset to the previous frame so it is possible to zoom
         * out and see what was rendered.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugFreezeFrame = defaultValue(options.debugFreezeFrame, false);

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, assigns a random color to each tile.  This is useful for visualizing
         * what features belong to what tiles, especially with additive refinement where features
         * from parent tiles may be interleaved with features from child tiles.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugColorizeTiles = defaultValue(options.debugColorizeTiles, false);

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, renders each tile's content as a wireframe.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugWireframe = defaultValue(options.debugWireframe, false);

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, renders the bounding volume for each visible tile.  The bounding volume is
         * white if the tile has a content bounding volume or is empty; otherwise, it is red.  Tiles that don't meet the
         * screen space error and are still refining to their descendants are yellow.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugShowBoundingVolume = defaultValue(options.debugShowBoundingVolume, false);

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, renders the bounding volume for each visible tile's content. The bounding volume is
         * blue if the tile has a content bounding volume; otherwise it is red.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugShowContentBoundingVolume = defaultValue(options.debugShowContentBoundingVolume, false);

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, renders the viewer request volume for each tile.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugShowViewerRequestVolume = defaultValue(options.debugShowViewerRequestVolume, false);

        this._tileDebugLabels = undefined;
        this.debugPickedTileLabelOnly = false;
        this.debugPickedTile = undefined;
        this.debugPickPosition = undefined;

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, draws labels to indicate the geometric error of each tile.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugShowGeometricError = defaultValue(options.debugShowGeometricError, false);

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, draws labels to indicate the number of commands, points, triangles and features of each tile.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugShowRenderingStatistics = defaultValue(options.debugShowRenderingStatistics, false);

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, draws labels to indicate the geometry and texture memory usage of each tile.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugShowMemoryUsage = defaultValue(options.debugShowMemoryUsage, false);

        /**
         * This property is for debugging only; it is not optimized for production use.
         * <p>
         * When true, draws labels to indicate the url of each tile.
         * </p>
         *
         * @type {Boolean}
         * @default false
         */
        this.debugShowUrl = defaultValue(options.debugShowUrl, false);

        // A bunch of tilesets were generated that have a leading / in front of all URLs in the tileset JSON file. If the tiles aren't
        //  at the root of the domain they will not load anymore. If we find a b3dm file with a leading slash, we test load a tile.
        //  If it succeeds we continue on. If it fails, we set this to true so we know to strip the slash when loading tiles.
        this._brokenUrlWorkaround = false;

        this._credits = undefined;

        this._depthMask = options.depthMask;

        var that = this;
        var resource;
        when(options.url)
            .then(function(url) {
                var basePath;
                resource = Resource.createIfNeeded(url);

                // ion resources have a credits property we can use for additional attribution.
                that._credits = resource.credits;

                if (resource.extension === 'json') {
                    basePath = resource.getBaseUri(true);
                } else if (resource.isDataUri) {
                    basePath = '';
                }

                that._url = resource.url;
                that._basePath = basePath;

                return Cesium3DTileset.loadJson(resource);
            })
            .then(function(tilesetJson) {
                return detectBrokenUrlWorkaround(that, resource, tilesetJson);
            })
            .then(function(tilesetJson) {
                if (that._brokenUrlWorkaround) {
                    deprecationWarning('Cesium3DTileset.leadingSlash', 'Having a leading slash in a tile URL that is actually relative to the tileset JSON file is deprecated.');
                }

                that._root = that.loadTileset(resource, tilesetJson);
                var gltfUpAxis = defined(tilesetJson.asset.gltfUpAxis) ? Axis.fromName(tilesetJson.asset.gltfUpAxis) : Axis.Y;
                that._asset = tilesetJson.asset;
                that._properties = tilesetJson.properties;
                that._geometricError = tilesetJson.geometricError;
                that._extensionsUsed = tilesetJson.extensionsUsed;
                that._gltfUpAxis = gltfUpAxis;
                that._readyPromise.resolve(that);
            }).otherwise(function(error) {
                that._readyPromise.reject(error);
            });
    }

    function detectBrokenUrlWorkaround(tileset, resource, tilesetJson) {
        var testUrl = findBrokenUrl(tilesetJson.root);

        // If it's an empty string, we are good to load the tileset.
        if (!defined(testUrl) || (testUrl.length === 0)) {
            return tilesetJson;
        }

        var testResource = resource.getDerivedResource({
            url : testUrl
        });

        return testResource.fetchArrayBuffer()
            .then(function(buffer) {
                var uint8Array = new Uint8Array(buffer);
                var magic = getMagic(uint8Array);

                // If its not a b3dm file, then use workaround
                // This accounts for servers that return an error page with a 200 status code
                tileset._brokenUrlWorkaround = (magic !== 'b3dm');

                return tilesetJson;
            })
            .otherwise(function() {
                // Tile failed to load, so use the workaround
                tileset._brokenUrlWorkaround = true;
                return tilesetJson;
            });
    }

    var brokenUrlRegex = /^\/.+\.b3dm$/;

    function findBrokenUrl(node) {
        var content = node.content;
        if (defined(content) && defined(content.url)) {
            if (brokenUrlRegex.test(content.url)) {
                return content.url;
            }

            return '';
        }

        var children = node.children;
        if (defined(children)) {
            var count = children.length;
            for (var i = 0; i < count; ++i) {
                var result = findBrokenUrl(children[i]);
                if (defined(result)) {
                    return result;
                }
            }
        }
    }

    defineProperties(Cesium3DTileset.prototype, {
        /**
         * Gets the tileset's asset object property, which contains metadata about the tileset.
         * <p>
         * See the {@link https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#reference-asset|asset schema reference}
         * in the 3D Tiles spec for the full set of properties.
         * </p>
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Object}
         * @readonly
         *
         * @exception {DeveloperError} The tileset is not loaded.  Use Cesium3DTileset.readyPromise or wait for Cesium3DTileset.ready to be true.
         */
        asset : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this.ready) {
                    throw new DeveloperError('The tileset is not loaded.  Use Cesium3DTileset.readyPromise or wait for Cesium3DTileset.ready to be true.');
                }
                //>>includeEnd('debug');

                return this._asset;
            }
        },
        /**
         * The {@link ClippingPlaneCollection} used to selectively disable rendering the tileset.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {ClippingPlaneCollection}
         */
        clippingPlanes : {
            get : function() {
                return this._clippingPlanes;
            },
            set : function(value) {
                ClippingPlaneCollection.setOwner(value, this, '_clippingPlanes');
            }
        },

        /**
         * Gets the tileset's properties dictionary object, which contains metadata about per-feature properties.
         * <p>
         * See the {@link https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification#reference-properties|properties schema reference}
         * in the 3D Tiles spec for the full set of properties.
         * </p>
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Object}
         * @readonly
         *
         * @exception {DeveloperError} The tileset is not loaded.  Use Cesium3DTileset.readyPromise or wait for Cesium3DTileset.ready to be true.
         *
         * @example
         * console.log('Maximum building height: ' + tileset.properties.height.maximum);
         * console.log('Minimum building height: ' + tileset.properties.height.minimum);
         *
         * @see Cesium3DTileFeature#getProperty
         * @see Cesium3DTileFeature#setProperty
         */
        properties : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this.ready) {
                    throw new DeveloperError('The tileset is not loaded.  Use Cesium3DTileset.readyPromise or wait for Cesium3DTileset.ready to be true.');
                }
                //>>includeEnd('debug');

                return this._properties;
            }
        },

        /**
         * When <code>true</code>, the tileset's root tile is loaded and the tileset is ready to render.
         * This is set to <code>true</code> right before {@link Cesium3DTileset#readyPromise} is resolved.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Boolean}
         * @readonly
         *
         * @default false
         */
        ready : {
            get : function() {
                return defined(this._root);
            }
        },

        /**
         * Gets the promise that will be resolved when the tileset's root tile is loaded and the tileset is ready to render.
         * <p>
         * This promise is resolved at the end of the frame before the first frame the tileset is rendered in.
         * </p>
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Promise.<Cesium3DTileset>}
         * @readonly
         *
         * @example
         * tileset.readyPromise.then(function(tileset) {
         *     // tile.properties is not defined until readyPromise resolves.
         *     var properties = tileset.properties;
         *     if (Cesium.defined(properties)) {
         *         for (var name in properties) {
         *             console.log(properties[name]);
         *         }
         *     }
         * });
         */
        readyPromise : {
            get : function() {
                return this._readyPromise.promise;
            }
        },

        /**
         * When <code>true</code>, all tiles that meet the screen space error this frame are loaded. The tileset is
         * completely loaded for this view.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Boolean}
         * @readonly
         *
         * @default false
         *
         * @see Cesium3DTileset#allTilesLoaded
         */
        tilesLoaded : {
            get : function() {
                return this._tilesLoaded;
            }
        },

        /**
         * The url to a tileset JSON file.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {String}
         * @readonly
         */
        url : {
            get : function() {
                return this._url;
            }
        },

        /**
         * The base path that non-absolute paths in tileset JSON file are relative to.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {String}
         * @readonly
         * @deprecated
         */
        basePath : {
            get : function() {
                deprecationWarning('Cesium3DTileset.basePath', 'Cesium3DTileset.basePath has been deprecated. All tiles are relative to the url of the tileset JSON file that contains them. Use the url property instead.');
                return this._basePath;
            }
        },

        /**
         * The style, defined using the
         * {@link https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification/Styling|3D Tiles Styling language},
         * applied to each feature in the tileset.
         * <p>
         * Assign <code>undefined</code> to remove the style, which will restore the visual
         * appearance of the tileset to its default when no style was applied.
         * </p>
         * <p>
         * The style is applied to a tile before the {@link Cesium3DTileset#tileVisible}
         * event is raised, so code in <code>tileVisible</code> can manually set a feature's
         * properties (e.g. color and show) after the style is applied. When
         * a new style is assigned any manually set properties are overwritten.
         * </p>
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Cesium3DTileStyle}
         *
         * @default undefined
         *
         * @example
         * tileset.style = new Cesium.Cesium3DTileStyle({
         *    color : {
         *        conditions : [
         *            ['${Height} >= 100', 'color("purple", 0.5)'],
         *            ['${Height} >= 50', 'color("red")'],
         *            ['true', 'color("blue")']
         *        ]
         *    },
         *    show : '${Height} > 0',
         *    meta : {
         *        description : '"Building id ${id} has height ${Height}."'
         *    }
         * });
         *
         * @see {@link https://github.com/AnalyticalGraphicsInc/3d-tiles/tree/master/specification/Styling|3D Tiles Styling language}
         */
        style : {
            get : function() {
                return this._styleEngine.style;
            },
            set : function(value) {
                this._styleEngine.style = value;
            }
        },

        /**
         * The maximum screen space error used to drive level of detail refinement.  This value helps determine when a tile
         * refines to its descendants, and therefore plays a major role in balancing performance with visual quality.
         * <p>
         * A tile's screen space error is roughly equivalent to the number of pixels wide that would be drawn if a sphere with a
         * radius equal to the tile's <b>geometric error</b> were rendered at the tile's position. If this value exceeds
         * <code>maximumScreenSpaceError</code> the tile refines to its descendants.
         * </p>
         * <p>
         * Depending on the tileset, <code>maximumScreenSpaceError</code> may need to be tweaked to achieve the right balance.
         * Higher values provide better performance but lower visual quality.
         * </p>
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Number}
         * @default 16
         *
         * @exception {DeveloperError} <code>maximumScreenSpaceError</code> must be greater than or equal to zero.
         */
        maximumScreenSpaceError : {
            get : function() {
                return this._maximumScreenSpaceError;
            },
            set : function(value) {
                //>>includeStart('debug', pragmas.debug);
                Check.typeOf.number.greaterThanOrEquals('maximumScreenSpaceError', value, 0);
                //>>includeEnd('debug');

                this._maximumScreenSpaceError = value;
            }
        },

        /**
         * The maximum amount of GPU memory (in MB) that may be used to cache tiles. This value is estimated from
         * geometry, textures, and batch table textures of loaded tiles. For point clouds, this value also
         * includes per-point metadata.
         * <p>
         * Tiles not in view are unloaded to enforce this.
         * </p>
         * <p>
         * If decreasing this value results in unloading tiles, the tiles are unloaded the next frame.
         * </p>
         * <p>
         * If tiles sized more than <code>maximumMemoryUsage</code> are needed
         * to meet the desired screen space error, determined by {@link Cesium3DTileset#maximumScreenSpaceError},
         * for the current view, then the memory usage of the tiles loaded will exceed
         * <code>maximumMemoryUsage</code>.  For example, if the maximum is 256 MB, but
         * 300 MB of tiles are needed to meet the screen space error, then 300 MB of tiles may be loaded.  When
         * these tiles go out of view, they will be unloaded.
         * </p>
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Number}
         * @default 512
         *
         * @exception {DeveloperError} <code>maximumMemoryUsage</code> must be greater than or equal to zero.
         * @see Cesium3DTileset#totalMemoryUsageInBytes
         */
        maximumMemoryUsage : {
            get : function() {
                return this._maximumMemoryUsage;
            },
            set : function(value) {
                //>>includeStart('debug', pragmas.debug);
                Check.typeOf.number.greaterThanOrEquals('value', value, 0);
                //>>includeEnd('debug');

                this._maximumMemoryUsage = value;
            }
        },

        /**
         * The tileset's bounding sphere.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {BoundingSphere}
         * @readonly
         *
         * @exception {DeveloperError} The tileset is not loaded.  Use Cesium3DTileset.readyPromise or wait for Cesium3DTileset.ready to be true.
         *
         * @example
         * var tileset = viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
         *     url : 'http://localhost:8002/tilesets/Seattle/tileset.json'
         * }));
         *
         * tileset.readyPromise.then(function(tileset) {
         *     // Set the camera to view the newly added tileset
         *     viewer.camera.viewBoundingSphere(tileset.boundingSphere, new Cesium.HeadingPitchRange(0, -0.5, 0));
         * });
         */
        boundingSphere : {
            get : function() {
                //>>includeStart('debug', pragmas.debug);
                if (!this.ready) {
                    throw new DeveloperError('The tileset is not loaded.  Use Cesium3DTileset.readyPromise or wait for Cesium3DTileset.ready to be true.');
                }
                //>>includeEnd('debug');

                this._root.updateTransform(this._modelMatrix);
                return this._root.boundingSphere;
            }
        },

        /**
         * A 4x4 transformation matrix that transforms the entire tileset.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Matrix4}
         * @default Matrix4.IDENTITY
         *
         * @example
         * // Adjust a tileset's height from the globe's surface.
         * var heightOffset = 20.0;
         * var boundingSphere = tileset.boundingSphere;
         * var cartographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
         * var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
         * var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, heightOffset);
         * var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
         * tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
         */
        modelMatrix : {
            get : function() {
                return this._modelMatrix;
            },
            set : function(value) {
                this._modelMatrix = Matrix4.clone(value, this._modelMatrix);
            }
        },

        /**
         * Returns the time, in milliseconds, since the tileset was loaded and first updated.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Number}
         * @readonly
         */
        timeSinceLoad : {
            get : function() {
                return this._timeSinceLoad;
            }
        },

        /**
         * The total amount of GPU memory in bytes used by the tileset. This value is estimated from
         * geometry, texture, and batch table textures of loaded tiles. For point clouds, this value also
         * includes per-point metadata.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Number}
         * @readonly
         *
         * @see Cesium3DTileset#maximumMemoryUsage
         */
        totalMemoryUsageInBytes : {
            get : function() {
                var statistics = this._statistics;
                return statistics.texturesByteLength + statistics.geometryByteLength + statistics.batchTableByteLength;
            }
        },

        /**
         * @private
         */
        styleEngine : {
            get : function() {
                return this._styleEngine;
            }
        },

        /**
         * @private
         */
        statistics : {
            get : function() {
                return this._statistics;
            }
        },

        /**
         * Determines whether terrain, 3D Tiles or both will be classified by this tileset.
         * <p>
         * This option is only applied to tilesets containing batched 3D models, geometry data, or vector data. Even when undefined, vector data and geometry data
         * must render as classifications and will default to rendering on both terrain and other 3D Tiles tilesets.
         * </p>
         * <p>
         * When enabled for batched 3D model tilesets, there are a few requirements/limitations on the glTF:
         * <ul>
         *     <li>POSITION and _BATCHID semantics are required.</li>
         *     <li>All indices with the same batch id must occupy contiguous sections of the index buffer.</li>
         *     <li>All shaders and techniques are ignored. The generated shader simply multiplies the position by the model-view-projection matrix.</li>
         *     <li>The only supported extensions are CESIUM_RTC and WEB3D_quantized_attributes.</li>
         *     <li>Only one node is supported.</li>
         *     <li>Only one mesh per node is supported.</li>
         *     <li>Only one primitive per mesh is supported.</li>
         * </ul>
         * </p>
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {ClassificationType}
         * @default undefined
         *
         * @experimental This feature is using part of the 3D Tiles spec that is not final and is subject to change without Cesium's standard deprecation policy.
         * @readonly
         */
        classificationType : {
            get : function() {
                return this._classificationType;
            }
        },

        /**
         * Gets an ellipsoid describing the shape of the globe.
         *
         * @memberof Cesium3DTileset.prototype
         *
         * @type {Ellipsoid}
         * @readonly
         */
        ellipsoid : {
            get : function() {
                return this._ellipsoid;
            }
        }
    });

    /**
     * Provides a hook to override the method used to request the tileset json
     * useful when fetching tilesets from remote servers
     * @param {Resource|String} tilesetUrl The url of the json file to be fetched
     * @returns {Promise.<Object>} A promise that resolves with the fetched json data
     */
    Cesium3DTileset.loadJson = function(tilesetUrl) {
        var resource = Resource.createIfNeeded(tilesetUrl);
        return resource.fetchJson();
    };

    /**
     * Marks the tileset's {@link Cesium3DTileset#style} as dirty, which forces all
     * features to re-evaluate the style in the next frame each is visible.
     */
    Cesium3DTileset.prototype.makeStyleDirty = function() {
        this._styleEngine.makeDirty();
    };

    /**
     * Loads the main tileset JSON file or a tileset JSON file referenced from a tile.
     *
     * @private
     */
    Cesium3DTileset.prototype.loadTileset = function(resource, tilesetJson, parentTile) {
        var asset = tilesetJson.asset;
        if (!defined(asset)) {
            throw new RuntimeError('Tileset must have an asset property.');
        }
        if (asset.version !== '0.0' && asset.version !== '1.0') {
            throw new RuntimeError('The tileset must be 3D Tiles version 0.0 or 1.0.');
        }

        var statistics = this._statistics;

        // Append the tileset version to the resource
        if (!defined(resource.queryParameters.v)) {
            var versionQuery = {
                v : defaultValue(asset.tilesetVersion, '0.0')
            };
            this._basePath += '?v=' + versionQuery.v;
            resource.setQueryParameters(versionQuery);
        }

        // A tileset JSON file referenced from a tile may exist in a different directory than the root tileset.
        // Get the basePath relative to the external tileset.
        var rootTile = new Cesium3DTile(this, resource, tilesetJson.root, parentTile);

        // If there is a parentTile, add the root of the currently loading tileset
        // to parentTile's children, and update its _depth.
        if (defined(parentTile)) {
            parentTile.children.push(rootTile);
            rootTile._depth = parentTile._depth + 1;
        }

        var stack = [];
        stack.push(rootTile);

        while (stack.length > 0) {
            var tile = stack.pop();
            ++statistics.numberOfTilesTotal;
            this._allTilesAdditive = this._allTilesAdditive && (tile.refine === Cesium3DTileRefine.ADD);
            var children = tile._header.children;
            if (defined(children)) {
                var length = children.length;
                for (var i = 0; i < length; ++i) {
                    var childHeader = children[i];
                    var childTile = new Cesium3DTile(this, resource, childHeader, tile);
                    tile.children.push(childTile);
                    childTile._depth = tile._depth + 1;
                    stack.push(childTile);
                }
            }

            if (this._cullWithChildrenBounds) {
                Cesium3DTileOptimizations.checkChildrenWithinParent(tile);
            }
        }

        return rootTile;
    };

    var scratchPositionNormal = new Cartesian3();
    var scratchCartographic = new Cartographic();
    var scratchMatrix = new Matrix4();
    var scratchCenter = new Cartesian3();
    var scratchPosition = new Cartesian3();
    var scratchDirection = new Cartesian3();

    function updateDynamicScreenSpaceError(tileset, frameState) {
        var up;
        var direction;
        var height;
        var minimumHeight;
        var maximumHeight;

        var camera = frameState.camera;
        var root = tileset._root;
        var tileBoundingVolume = root.contentBoundingVolume;

        if (tileBoundingVolume instanceof TileBoundingRegion) {
            up = Cartesian3.normalize(camera.positionWC, scratchPositionNormal);
            direction = camera.directionWC;
            height = camera.positionCartographic.height;
            minimumHeight = tileBoundingVolume.minimumHeight;
            maximumHeight = tileBoundingVolume.maximumHeight;
        } else {
            // Transform camera position and direction into the local coordinate system of the tileset
            var transformLocal = Matrix4.inverseTransformation(root.computedTransform, scratchMatrix);
            var ellipsoid = frameState.mapProjection.ellipsoid;
            var boundingVolume = tileBoundingVolume.boundingVolume;
            var centerLocal = Matrix4.multiplyByPoint(transformLocal, boundingVolume.center, scratchCenter);
            if (Cartesian3.magnitude(centerLocal) > ellipsoid.minimumRadius) {
                // The tileset is defined in WGS84. Approximate the minimum and maximum height.
                var centerCartographic = Cartographic.fromCartesian(centerLocal, ellipsoid, scratchCartographic);
                up = Cartesian3.normalize(camera.positionWC, scratchPositionNormal);
                direction = camera.directionWC;
                height = camera.positionCartographic.height;
                minimumHeight = 0.0;
                maximumHeight = centerCartographic.height * 2.0;
            } else {
                // The tileset is defined in local coordinates (z-up)
                var positionLocal = Matrix4.multiplyByPoint(transformLocal, camera.positionWC, scratchPosition);
                up = Cartesian3.UNIT_Z;
                direction = Matrix4.multiplyByPointAsVector(transformLocal, camera.directionWC, scratchDirection);
                direction = Cartesian3.normalize(direction, direction);
                height = positionLocal.z;
                if (tileBoundingVolume instanceof TileOrientedBoundingBox) {
                    // Assuming z-up, the last component stores the half-height of the box
                    var boxHeight = root._header.boundingVolume.box[11];
                    minimumHeight = centerLocal.z - boxHeight;
                    maximumHeight = centerLocal.z + boxHeight;
                } else if (tileBoundingVolume instanceof TileBoundingSphere) {
                    var radius = boundingVolume.radius;
                    minimumHeight = centerLocal.z - radius;
                    maximumHeight = centerLocal.z + radius;
                }
            }
        }

        // The range where the density starts to lessen. Start at the quarter height of the tileset.
        var heightFalloff = tileset.dynamicScreenSpaceErrorHeightFalloff;
        var heightClose = minimumHeight + (maximumHeight - minimumHeight) * heightFalloff;
        var heightFar = maximumHeight;

        var t = CesiumMath.clamp((height - heightClose) / (heightFar - heightClose), 0.0, 1.0);

        // Increase density as the camera tilts towards the horizon
        var dot = Math.abs(Cartesian3.dot(direction, up));
        var horizonFactor = 1.0 - dot;

        // Weaken the horizon factor as the camera height increases, implying the camera is further away from the tileset.
        // The goal is to increase density for the "street view", not when viewing the tileset from a distance.
        horizonFactor = horizonFactor * (1.0 - t);

        var density = tileset.dynamicScreenSpaceErrorDensity;
        density *= horizonFactor;

        tileset._dynamicScreenSpaceErrorComputedDensity = density;
    }

    ///////////////////////////////////////////////////////////////////////////

    function requestContent(tileset, tile) {
        if (tile.hasEmptyContent) {
            return;
        }

        var statistics = tileset._statistics;
        var expired = tile.contentExpired;
        var requested = tile.requestContent();

        if (!requested) {
            ++statistics.numberOfAttemptedRequests;
            return;
        }

        if (expired) {
            if (tile.hasTilesetContent) {
                destroySubtree(tileset, tile);
            } else {
                statistics.decrementLoadCounts(tile.content);
                --tileset._statistics.numberOfTilesWithContentReady;
            }
        }

        ++statistics.numberOfPendingRequests;

        tile.contentReadyToProcessPromise.then(addToProcessingQueue(tileset, tile));
        tile.contentReadyPromise.then(handleTileSuccess(tileset, tile)).otherwise(handleTileFailure(tileset, tile));
    }

    function sortRequestByPriority(a, b) {
        return a._priority - b._priority;
    }

    function requestTiles(tileset) {
        // Sort requests by priority before making any requests.
        // This makes it less likely that requests will be cancelled after being issued.
        var requestedTiles = tileset._requestedTiles;
        var length = requestedTiles.length;
        requestedTiles.sort(sortRequestByPriority);
        for (var i = 0; i < length; ++i) {
            requestContent(tileset, requestedTiles[i]);
        }
    }

    function addToProcessingQueue(tileset, tile) {
        return function() {
            tileset._processingQueue.push(tile);

            --tileset._statistics.numberOfPendingRequests;
            ++tileset._statistics.numberOfTilesProcessing;
        };
    }

    function handleTileFailure(tileset, tile) {
        return function(error) {
            if (tileset._processingQueue.indexOf(tile) >= 0) {
                // Failed during processing
                --tileset._statistics.numberOfTilesProcessing;
            } else {
                // Failed when making request
                --tileset._statistics.numberOfPendingRequests;
            }

            var url = tile._contentResource.url;
            var message = defined(error.message) ? error.message : error.toString();
            if (tileset.tileFailed.numberOfListeners > 0) {
                tileset.tileFailed.raiseEvent({
                    url : url,
                    message : message
                });
            } else {
                console.log('A 3D tile failed to load: ' + url);
                console.log('Error: ' + message);
            }
        };
    }

    function handleTileSuccess(tileset, tile) {
        return function() {
            --tileset._statistics.numberOfTilesProcessing;

            if (!tile.hasTilesetContent) {
                // RESEARCH_IDEA: ability to unload tiles (without content) for an
                // external tileset when all the tiles are unloaded.
                tileset._statistics.incrementLoadCounts(tile.content);
                ++tileset._statistics.numberOfTilesWithContentReady;

                // Add to the tile cache. Previously expired tiles are already in the cache and won't get re-added.
                tileset._cache.add(tile);
            }

            tileset.tileLoad.raiseEvent(tile);
        };
    }

    function filterProcessingQueue(tileset) {
        var tiles = tileset._processingQueue;
        var length = tiles.length;

        var removeCount = 0;
        for (var i = 0; i < length; ++i) {
            var tile = tiles[i];
            if (tile._contentState !== Cesium3DTileContentState.PROCESSING) {
                ++removeCount;
                continue;
            }
            if (removeCount > 0) {
                tiles[i - removeCount] = tile;
            }
        }
        tiles.length -= removeCount;
    }

    function processTiles(tileset, frameState) {
        filterProcessingQueue(tileset);
        var tiles = tileset._processingQueue;
        var length = tiles.length;

        // Process tiles in the PROCESSING state so they will eventually move to the READY state.
        for (var i = 0; i < length; ++i) {
            tiles[i].process(tileset, frameState);
        }
    }

    ///////////////////////////////////////////////////////////////////////////

    var scratchCartesian = new Cartesian3();

    var stringOptions = {
        maximumFractionDigits : 3
    };

    function formatMemoryString(memorySizeInBytes) {
        var memoryInMegabytes = memorySizeInBytes / 1048576;
        if (memoryInMegabytes < 1.0) {
            return memoryInMegabytes.toLocaleString(undefined, stringOptions);
        }
        return Math.round(memoryInMegabytes).toLocaleString();
    }

    function computeTileLabelPosition(tile) {
        var boundingVolume = tile._boundingVolume.boundingVolume;
        var halfAxes = boundingVolume.halfAxes;
        var radius = boundingVolume.radius;

        var position = Cartesian3.clone(boundingVolume.center, scratchCartesian);
        if (defined(halfAxes)) {
            position.x += 0.75 * (halfAxes[0] + halfAxes[3] + halfAxes[6]);
            position.y += 0.75 * (halfAxes[1] + halfAxes[4] + halfAxes[7]);
            position.z += 0.75 * (halfAxes[2] + halfAxes[5] + halfAxes[8]);
        } else if (defined(radius)) {
            var normal = Cartesian3.normalize(boundingVolume.center, scratchCartesian);
            normal = Cartesian3.multiplyByScalar(normal, 0.75 * radius, scratchCartesian);
            position = Cartesian3.add(normal, boundingVolume.center, scratchCartesian);
        }
        return position;
    }

    function addTileDebugLabel(tile, tileset, position) {
        var labelString = '';
        var attributes = 0;

        if (tileset.debugShowGeometricError) {
            labelString += '\nGeometric error: ' + tile.geometricError;
            attributes++;
        }

        if (tileset.debugShowRenderingStatistics) {
            labelString += '\nCommands: ' + tile.commandsLength;
            attributes++;

            // Don't display number of points or triangles if 0.
            var numberOfPoints = tile.content.pointsLength;
            if (numberOfPoints > 0) {
                labelString += '\nPoints: ' + tile.content.pointsLength;
                attributes++;
            }

            var numberOfTriangles = tile.content.trianglesLength;
            if (numberOfTriangles > 0) {
                labelString += '\nTriangles: ' + tile.content.trianglesLength;
                attributes++;
            }

            labelString += '\nFeatures: ' + tile.content.featuresLength;
            attributes ++;
        }

        if (tileset.debugShowMemoryUsage) {
            labelString += '\nTexture Memory: ' + formatMemoryString(tile.content.texturesByteLength);
            labelString += '\nGeometry Memory: ' + formatMemoryString(tile.content.geometryByteLength);
            attributes += 2;
        }

        if (tileset.debugShowUrl) {
            labelString += '\nUrl: ' + tile._header.content.uri;
            attributes++;
        }

        var newLabel = {
            text : labelString.substring(1),
            position : position,
            font : (19-attributes) + 'px sans-serif',
            showBackground : true,
            disableDepthTestDistance : Number.POSITIVE_INFINITY
        };

        return tileset._tileDebugLabels.add(newLabel);
    }

    function updateTileDebugLabels(tileset, frameState) {
        var i;
        var tile;
        var selectedTiles = tileset._selectedTiles;
        var selectedLength = selectedTiles.length;
        var emptyTiles = tileset._emptyTiles;
        var emptyLength = emptyTiles.length;
        tileset._tileDebugLabels.removeAll();

        if (tileset.debugPickedTileLabelOnly) {
            if (defined(tileset.debugPickedTile)) {
                var position = (defined(tileset.debugPickPosition)) ? tileset.debugPickPosition : computeTileLabelPosition(tileset.debugPickedTile);
                var label = addTileDebugLabel(tileset.debugPickedTile, tileset, position);
                label.pixelOffset = new Cartesian2(15, -15); // Offset to avoid picking the label.
            }
        } else {
            for (i = 0; i < selectedLength; ++i) {
                tile = selectedTiles[i];
                addTileDebugLabel(tile, tileset, computeTileLabelPosition(tile));
            }
            for (i = 0; i < emptyLength; ++i) {
                tile = emptyTiles[i];
                if (tile.hasTilesetContent) {
                    addTileDebugLabel(tile, tileset, computeTileLabelPosition(tile));
                }
            }
        }
        tileset._tileDebugLabels.update(frameState);
    }

    var stencilClearCommand = new ClearCommand({
        stencil : 0,
        pass : Pass.CESIUM_3D_TILE
    });

    function updateTiles(tileset, frameState) {
        tileset._styleEngine.applyStyle(tileset, frameState);

        var statistics = tileset._statistics;
        var commandList = frameState.commandList;
        var numberOfInitialCommands = commandList.length;
        var selectedTiles = tileset._selectedTiles;
        var selectedLength = selectedTiles.length;
        var emptyTiles = tileset._emptyTiles;
        var emptyLength = emptyTiles.length;
        var tileVisible = tileset.tileVisible;
        var i;
        var tile;

        var bivariateVisibilityTest = tileset._skipLevelOfDetail && tileset._hasMixedContent && frameState.context.stencilBuffer && selectedLength > 0;

        tileset._backfaceCommands.length = 0;

        if (bivariateVisibilityTest) {
            commandList.push(stencilClearCommand);
        }

        var lengthBeforeUpdate = commandList.length;
        for (i = 0; i < selectedLength; ++i) {
            tile = selectedTiles[i];
            // Raise the tileVisible event before update in case the tileVisible event
            // handler makes changes that update needs to apply to WebGL resources
            tileVisible.raiseEvent(tile);
            tile.update(tileset, frameState);
            statistics.incrementSelectionCounts(tile.content);
            ++statistics.selected;
        }
        for (i = 0; i < emptyLength; ++i) {
            tile = emptyTiles[i];
            tile.update(tileset, frameState);
        }

        var lengthAfterUpdate = commandList.length;
        var addedCommandsLength = lengthAfterUpdate - lengthBeforeUpdate;

        tileset._backfaceCommands.trim();

        if (bivariateVisibilityTest) {
            /**
             * Consider 'effective leaf' tiles as selected tiles that have no selected descendants. They may have children,
             * but they are currently our effective leaves because they do not have selected descendants. These tiles
             * are those where with tile._finalResolution === true.
             * Let 'unresolved' tiles be those with tile._finalResolution === false.
             *
             * 1. Render just the backfaces of unresolved tiles in order to lay down z
             * 2. Render all frontfaces wherever tile._selectionDepth > stencilBuffer.
             *    Replace stencilBuffer with tile._selectionDepth, when passing the z test.
             *    Because children are always drawn before ancestors {@link Cesium3DTilesetTraversal#traverseAndSelect},
             *    this effectively draws children first and does not draw ancestors if a descendant has already
             *    been drawn at that pixel.
             *    Step 1 prevents child tiles from appearing on top when they are truly behind ancestor content.
             *    If they are behind the backfaces of the ancestor, then they will not be drawn.
             *
             * NOTE: Step 2 sometimes causes visual artifacts when backfacing child content has some faces that
             * partially face the camera and are inside of the ancestor content. Because they are inside, they will
             * not be culled by the depth writes in Step 1, and because they partially face the camera, the stencil tests
             * will draw them on top of the ancestor content.
             *
             * NOTE: Because we always render backfaces of unresolved tiles, if the camera is looking at the backfaces
             * of an object, they will always be drawn while loading, even if backface culling is enabled.
             */

            var backfaceCommands = tileset._backfaceCommands.values;
            var backfaceCommandsLength = backfaceCommands.length;

            commandList.length += backfaceCommandsLength;

            // copy commands to the back of the commandList
            for (i = addedCommandsLength - 1; i >= 0; --i) {
                commandList[lengthBeforeUpdate + backfaceCommandsLength + i] = commandList[lengthBeforeUpdate + i];
            }

            // move backface commands to the front of the commandList
            for (i = 0; i < backfaceCommandsLength; ++i) {
                commandList[lengthBeforeUpdate + i] = backfaceCommands[i];
            }
        }

        // Number of commands added by each update above
        statistics.numberOfCommands = (commandList.length - numberOfInitialCommands);

        // Only run EDL if simple attenuation is on
        if (tileset.pointCloudShading.attenuation &&
            tileset.pointCloudShading.eyeDomeLighting &&
            (addedCommandsLength > 0)) {
            tileset._pointCloudEyeDomeLighting.update(frameState, numberOfInitialCommands, tileset.pointCloudShading);
        }

        if (tileset.debugShowGeometricError || tileset.debugShowRenderingStatistics || tileset.debugShowMemoryUsage || tileset.debugShowUrl) {
            if (!defined(tileset._tileDebugLabels)) {
                tileset._tileDebugLabels = new LabelCollection();
            }
            updateTileDebugLabels(tileset, frameState);
        } else {
            tileset._tileDebugLabels = tileset._tileDebugLabels && tileset._tileDebugLabels.destroy();
        }
    }

    var scratchStack = [];

    function destroySubtree(tileset, tile) {
        var root = tile;
        var statistics = tileset._statistics;
        var stack = scratchStack;
        stack.push(tile);
        while (stack.length > 0) {
            tile = stack.pop();
            var children = tile.children;
            var length = children.length;
            for (var i = 0; i < length; ++i) {
                stack.push(children[i]);
            }
            if (tile !== root) {
                destroyTile(tileset, tile);
                --statistics.numberOfTilesTotal;
            }
        }
        root.children = [];
    }

    function unloadTile(tileset, tile) {
        tileset.tileUnload.raiseEvent(tile);
        tileset._statistics.decrementLoadCounts(tile.content);
        --tileset._statistics.numberOfTilesWithContentReady;
        tile.unloadContent();
    }

    function destroyTile(tileset, tile) {
        tileset._cache.unloadTile(tileset, tile, unloadTile);
        tile.destroy();
    }

    function unloadTiles(tileset) {
        tileset._cache.unloadTiles(tileset, unloadTile);
    }

    /**
     * Unloads all tiles that weren't selected the previous frame.  This can be used to
     * explicitly manage the tile cache and reduce the total number of tiles loaded below
     * {@link Cesium3DTileset#maximumMemoryUsage}.
     * <p>
     * Tile unloads occur at the next frame to keep all the WebGL delete calls
     * within the render loop.
     * </p>
     */
    Cesium3DTileset.prototype.trimLoadedTiles = function() {
        this._cache.trim();
    };

    ///////////////////////////////////////////////////////////////////////////

    function raiseLoadProgressEvent(tileset, frameState) {
        var statistics = tileset._statistics;
        var statisticsLast = tileset._statisticsLastColor;
        var numberOfPendingRequests = statistics.numberOfPendingRequests;
        var numberOfTilesProcessing = statistics.numberOfTilesProcessing;
        var lastNumberOfPendingRequest = statisticsLast.numberOfPendingRequests;
        var lastNumberOfTilesProcessing = statisticsLast.numberOfTilesProcessing;

        var progressChanged = (numberOfPendingRequests !== lastNumberOfPendingRequest) || (numberOfTilesProcessing !== lastNumberOfTilesProcessing);

        if (progressChanged) {
            frameState.afterRender.push(function() {
                tileset.loadProgress.raiseEvent(numberOfPendingRequests, numberOfTilesProcessing);
            });
        }

        tileset._tilesLoaded = (statistics.numberOfPendingRequests === 0) && (statistics.numberOfTilesProcessing === 0) && (statistics.numberOfAttemptedRequests === 0);

        if (progressChanged && tileset._tilesLoaded) {
            frameState.afterRender.push(function() {
                tileset.allTilesLoaded.raiseEvent();
            });
        }
    }

    ///////////////////////////////////////////////////////////////////////////

    /**
     * @private
     */
    Cesium3DTileset.prototype.update = function(frameState) {
        if (frameState.mode === SceneMode.MORPHING) {
            return;
        }

        if (!this.show || !this.ready) {
            return;
        }

        if (!defined(this._loadTimestamp)) {
            this._loadTimestamp = JulianDate.clone(frameState.time);
        }

        // Update clipping planes
        var clippingPlanes = this._clippingPlanes;
        if (defined(clippingPlanes) && clippingPlanes.enabled) {
            clippingPlanes.update(frameState);
        }

        this._timeSinceLoad = Math.max(JulianDate.secondsDifference(frameState.time, this._loadTimestamp) * 1000, 0.0);

        this._skipLevelOfDetail = this.skipLevelOfDetail && !defined(this._classificationType) && !this._disableSkipLevelOfDetail && !this._allTilesAdditive;

        // Do not do out-of-core operations (new content requests, cache removal,
        // process new tiles) during the pick pass.
        var passes = frameState.passes;
        var isRender = passes.render;
        var isPick = passes.pick;
        var outOfCore = isRender;

        var statistics = this._statistics;
        statistics.clear();

        if (this.dynamicScreenSpaceError) {
            updateDynamicScreenSpaceError(this, frameState);
        }

        if (outOfCore) {
            this._cache.reset();
        }

        this._requestedTiles.length = 0;
        Cesium3DTilesetTraversal.selectTiles(this, frameState);

        if (outOfCore) {
            requestTiles(this);
            processTiles(this, frameState);
        }

        updateTiles(this, frameState);

        if (outOfCore) {
            unloadTiles(this);
        }

        // Events are raised (added to the afterRender queue) here since promises
        // may resolve outside of the update loop that then raise events, e.g.,
        // model's readyPromise.
        raiseLoadProgressEvent(this, frameState);

        // Update last statistics
        var statisticsLast = isPick ? this._statisticsLastPick : this._statisticsLastColor;
        Cesium3DTilesetStatistics.clone(statistics, statisticsLast);

        if (statistics.selected !== 0) {
            var credits = this._credits;
            if (defined(credits)) {
                var length = credits.length;
                for (var i = 0; i < length; i++) {
                    frameState.creditDisplay.addCredit(credits[i]);
                }
            }
        }
    };

    /**
     * <code>true</code> if the tileset JSON file lists the extension in extensionsUsed; otherwise, <code>false</code>.
     * @param {String} extensionName The name of the extension to check.
     *
     * @returns {Boolean} <code>true</code> if the tileset JSON file lists the extension in extensionsUsed; otherwise, <code>false</code>.
     */
    Cesium3DTileset.prototype.hasExtension = function(extensionName) {
        if (!defined(this._extensionsUsed)) {
            return false;
        }

        return (this._extensionsUsed.indexOf(extensionName) > -1);
    };

    /**
     * Returns true if this object was destroyed; otherwise, false.
     * <br /><br />
     * If this object was destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.
     *
     * @returns {Boolean} <code>true</code> if this object was destroyed; otherwise, <code>false</code>.
     *
     * @see Cesium3DTileset#destroy
     */
    Cesium3DTileset.prototype.isDestroyed = function() {
        return false;
    };

    /**
     * Destroys the WebGL resources held by this object.  Destroying an object allows for deterministic
     * release of WebGL resources, instead of relying on the garbage collector to destroy this object.
     * <br /><br />
     * Once an object is destroyed, it should not be used; calling any function other than
     * <code>isDestroyed</code> will result in a {@link DeveloperError} exception.  Therefore,
     * assign the return value (<code>undefined</code>) to the object as done in the example.
     *
     * @exception {DeveloperError} This object was destroyed, i.e., destroy() was called.
     *
     * @example
     * tileset = tileset && tileset.destroy();
     *
     * @see Cesium3DTileset#isDestroyed
     */
    Cesium3DTileset.prototype.destroy = function() {
        this._tileDebugLabels = this._tileDebugLabels && this._tileDebugLabels.destroy();
        this._clippingPlanes = this._clippingPlanes && this._clippingPlanes.destroy();

        // Traverse the tree and destroy all tiles
        if (defined(this._root)) {
            var stack = scratchStack;
            stack.push(this._root);

            while (stack.length > 0) {
                var tile = stack.pop();
                tile.destroy();

                var children = tile.children;
                var length = children.length;
                for (var i = 0; i < length; ++i) {
                    stack.push(children[i]);
                }
            }
        }

        this._root = undefined;
        return destroyObject(this);
    };

    return Cesium3DTileset;
});
