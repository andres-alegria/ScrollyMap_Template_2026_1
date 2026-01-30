import React, { useState, useRef, useEffect } from 'react';
import { transformRequest } from './map-utils';
import { useScrollFunctionality, useHandleResize } from './map-hooks';
import ReactMapGL, { Marker } from 'react-map-gl';
import mapboxgl from "mapbox-gl"; // This is a dependency of react-map-gl even if you didn't explicitly install it

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

const Map = (props) => {
  const { chapters, accessToken, mapStyle, showMarkers, setCurrentChapter, externalLayers, currentChapterId, currentAction } = props;
  const [loaded, setLoaded] = useState(false);
  const [externalLayersOpacity, setExternalLayersOpacity] = useState({});
  const [map, setMap] = useState(null);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // Use the first chapter that actually has a location (so PlainText can be first)
  const firstChapterWithLocation = chapters.find(
    (c) =>
      c &&
      c.location &&
      Array.isArray(c.location.center) &&
      c.location.center.length === 2
  );

  const initialLocation = firstChapterWithLocation?.location ?? {
    center: [0, 0],
    zoom: 1,
    pitch: 0,
    bearing: 0
  };

  const [initialLongitude, initialLatitude] = initialLocation.center;

  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLatitude,
    longitude: initialLongitude
  });
  const initialViewport = {
    initialViewState: {
      latitude: initialLatitude,
      longitude: initialLongitude,
      pitch: initialLocation.pitch,
      bearing: initialLocation.bearing,
      zoom: initialLocation.zoom
    }
  };
  const [viewport, setViewport] = useState(initialViewport);
  const updateViewport = (newViewport) =>
    setViewport({ ...viewport, ...newViewport });

  useHandleResize(updateViewport);

  // Set map when loaded
useEffect(() => {
  if (!loaded || !mapRef.current) return undefined;

  const m = mapRef.current.getMap();
  setMap(m);

  // Expose the live Mapbox map instance globally so other components (e.g. legend)
  // can read current paint properties from layers.
  //
  // Keep this name stable: chapter.js uses window.__MAP__.
  if (typeof window !== 'undefined') {
    window.__MAP__ = m;

    // If the style reloads (setStyle), keep the reference available.
    m.on('styledata', () => {
      window.__MAP__ = m;
    });
  }

  return undefined;
}, [mapRef, loaded, setMap]);

// 1) Animated vessel track setup (source + layer)
useEffect(() => {
  if (!loaded || !map) return;

  const SOURCE_ID = "vessel-anim";
  const LAYER_ID = "vessel-anim-line";

  const DOT_SOURCE_ID = "vessel-dot";
  const DOT_LAYER_ID = "vessel-dot-layer";


  const ensureAnimLayer = () => {
    // source
    if (!map.getSource(SOURCE_ID)) {
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });
}

    // layer
    if (!map.getLayer(LAYER_ID)) {
      map.addLayer({
        id: LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#530e0d",  
          "line-width": 1,
          "line-opacity": 0.5
        }
      });
    }
    
// dot source
if (!map.getSource(DOT_SOURCE_ID)) {
  map.addSource(DOT_SOURCE_ID, {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: { type: "Point", coordinates: [] }
    }
  });
}

// dot layer
if (!map.getLayer(DOT_LAYER_ID)) {
  map.addLayer({
    id: DOT_LAYER_ID,
    type: "circle",
    source: DOT_SOURCE_ID,
    paint: {
      "circle-radius": 4,
      "circle-color": "#530e0d",
      "circle-stroke-width": 0.5,
      "circle-stroke-color": "#ffffff"
    }
  });
}
    
    
  };

  ensureAnimLayer();

  // Re-add after any style reload
  map.on("styledata", ensureAnimLayer);
  return () => map.off("styledata", ensureAnimLayer);
}, [loaded, map]);





// 2) Animated vessel track controller (plays ALL parts, antimeridian-safe, pause/resume)
useEffect(() => {
  if (!loaded || !map) return;

  const SOURCE_ID = "vessel-anim";
  const DOT_SOURCE_ID = "vessel-dot";


  let parts = [];            // array of coordinate arrays (each "part" is a LineString)
  let animId = null;

  // animation state
  let partIdx = 0;           // which part we’re drawing
  let pointIdx = 0;          // how many points into the current part
  let isPaused = false;

  // “session” state
  let currentVesselFile = null;
  let speed = 2;

  
  const setFeatures = (features) => {
  const src = map.getSource(SOURCE_ID);
  if (!src) return;

  src.setData({
    type: "FeatureCollection",
    features
  });
};

const setDot = (coord) => {
  const src = map.getSource(DOT_SOURCE_ID);
  if (!src) return;

  src.setData({
    type: "Feature",
    properties: {},
    geometry: { type: "Point", coordinates: coord }
  });
};

  

  const buildDrawnFeatures = () => {
    const features = [];

    // fully completed parts
    for (let i = 0; i < partIdx; i++) {
      features.push({
        type: "Feature",
        properties: { part: i + 1, status: "done" },
        geometry: { type: "LineString", coordinates: parts[i] }
      });
    }

    // current part (partial)
    const current = parts[partIdx];
    if (current) {
      const slice = current.slice(0, Math.max(2, pointIdx));
      if (slice.length >= 2) {
        features.push({
          type: "Feature",
          properties: { part: partIdx + 1, status: "active" },
          geometry: { type: "LineString", coordinates: slice }
        });
      }
    }

    return features;
  };

  const loadVessel = async (vesselFile) => {
    const res = await fetch(vesselFile);
    const gj = await res.json();

    const feats = gj?.features || [];
    const lineFeats = feats.filter((f) => f?.geometry?.type === "LineString");

    parts = lineFeats
      .map((f) => f.geometry.coordinates || [])
      .filter((c) => Array.isArray(c) && c.length >= 2);

    return parts;
  };

  const reset = () => {
    if (animId) cancelAnimationFrame(animId);
    animId = null;

    partIdx = 0;
    pointIdx = 0;
    isPaused = false;

    // keep currentVesselFile so you can decide whether to restart or not
    setFeatures([]); // clear drawn line
    setDot([]);

  };

  const pause = () => {
    isPaused = true;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  };

  const tick = () => {
    if (isPaused) return;

    const current = parts[partIdx];
    if (!current) return;

    // advance within current part
    pointIdx = Math.min(pointIdx + speed, current.length);

    // render
    setFeatures(buildDrawnFeatures());
    
    const headIndex = Math.max(0, Math.min(pointIdx - 1, current.length - 1));
setDot(current[headIndex]);


    // if current part finished -> next
    if (pointIdx >= current.length) {
      partIdx += 1;
      pointIdx = 0;

      // all parts done
      if (partIdx >= parts.length) {
        animId = null;
        return;
      }
    }

    animId = requestAnimationFrame(tick);
  };

  const resume = () => {
    if (!parts.length) return;
    if (animId) cancelAnimationFrame(animId);
    isPaused = false;
    animId = requestAnimationFrame(tick);
  };

  // start = load (if needed) + (optionally) restart + play
const getBoundsFromParts = () => {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

  for (const part of parts) {
    for (const [lon, lat] of part) {
      if (lon < minLon) minLon = lon;
      if (lat < minLat) minLat = lat;
      if (lon > maxLon) maxLon = lon;
      if (lat > maxLat) maxLat = lat;
    }
  }

  if (!isFinite(minLon) || !isFinite(minLat) || !isFinite(maxLon) || !isFinite(maxLat)) return null;
  return [[minLon, minLat], [maxLon, maxLat]];
};
  
// trackAnimation.start(options)
//
// Options you can set from config.js:
//   vesselFile: "/data/tracks/YourFile.geojson"  (required)
//   speed: Number
//     - how fast the animation advances per frame (higher = faster).
//   camera: "chapter" | "static" | "start" | "fit"
//     - "chapter": let the chapter location control the camera (default).
//     - "static":  do not move the camera at all.
//     - "start":   fly to the first coordinate of the track before drawing.
//     - "fit":     fitBounds to the whole track before drawing.
//   cameraPadding: Number
//     - padding (px) used by camera:"fit".
//   flyToStart: boolean (optional)
//     - manual override for the "start" behavior.
//   restart: boolean
//     - force reloading and restart the animation from the beginning.
const start = async ({
  vesselFile,
  speed: sp = 2,
  camera = "chapter",       // "chapter" | "static" | "start" | "fit"
  cameraPadding = 80,       // used by "fit"
  flyToStart,               // optional override; if omitted we infer from camera
  restart = false
} = {}) => {

    if (!vesselFile) {
      console.warn("trackAnimation.start: missing vesselFile");
      return;
    }

    // same vessel + not restarting: just resume where we left off
    if (currentVesselFile === vesselFile && parts.length && !restart) {
      speed = sp;
      resume();
      return;
    }

    // new vessel OR forced restart
    currentVesselFile = vesselFile;
    speed = sp;
    isPaused = false;

    await loadVessel(vesselFile);
    if (!parts.length) return;

    // reset progress only when starting new vessel or forced restart
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    partIdx = 0;
    pointIdx = 0;

    setFeatures([]); // clear before re-drawing

const shouldFlyToStart =
  typeof flyToStart === "boolean"
    ? flyToStart
    : camera === "start"; // default behavior based on camera mode

if (camera === "fit") {
  const bounds = getBoundsFromParts();
  if (bounds) {
    map.fitBounds(bounds, {
      padding: cameraPadding,
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      duration: 1200
    });
  }
} else if (shouldFlyToStart) {
  const [lon, lat] = parts[0][0];
  map.flyTo({
    center: [lon, lat],
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
    duration: 1200
  });
} else {
  // "chapter" and "static" do nothing here:
  // - "chapter": let scrolly's chapter location control the camera
  // - "static": keep whatever camera you already have
}


    animId = requestAnimationFrame(tick);
  };

  // expose global API for scrolly triggers
  window.trackAnimation = { start, pause, resume, reset };

  return () => {
    // cleanup if component unmounts
    if (animId) cancelAnimationFrame(animId);
    if (window.trackAnimation) delete window.trackAnimation;
  };
}, [loaded, map]);





  useScrollFunctionality({
    loaded,
    map,
    chapters,
    showMarkers,
    setCurrentChapter,
    setMarkerPosition,
    setExternalLayersOpacity,
    externalLayersOpacity,
    externalLayers,
    currentAction,
    currentChapterId
  });
  return (
    <div ref={mapContainerRef} className="mapboxgl-map">
      <ReactMapGL
        ref={mapRef}
        width="100%"
        height="100%"
        mapboxApiAccessToken={accessToken}
        mapStyle={mapStyle}
        transformRequest={transformRequest}
        onLoad={() => setLoaded(true)}
        onViewportChange={updateViewport}
        onResize={updateViewport}
        scrollZoom={false}
        dragPan={false}
        dragRotate={false}
        doubleClickZoom={false}
        {...viewport}
      >
        {showMarkers && (
          <Marker
            longitude={markerPosition.longitude}
            latitude={markerPosition.latitude}
          />
        )}
      </ReactMapGL>
    </div>
  );
}

export default Map;