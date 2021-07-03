import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Map as BaseMap, TileLayer, ZoomControl, 
  Marker, Popup, Polyline, Polygon , Tooltip, 
  LayersControl, LayerGroup
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useConfigureLeaflet, useMapServices } from 'hooks';
import { isDomAvailable, bbox_to_pairs } from 'lib/util';
import { useSelector, useDispatch } from "react-redux";

import { SET_SELECTED, CLEAR_SELECTED } from "../actions/types"

const DEFAULT_MAP_SERVICE = 'OpenStreetMap';

const COLORS = {
  "Papers": {
    "line": "#a829c8",
    "contrast": "#e3d011"
  },
  "Patents": {
    "line": "#ff261b",
    "contrast":"#35f35b"
  }
}

// Hong Kong Lat Long
// const HongKong = [22.283262, 114.160486];
function CollaborationLine(props) {
  // const [selected, setSelected] = useState(false);
  const positions = props.kv[1].map(p => [p.latitude, p.longitude]);
  const dispatch = useDispatch();
  // get key value of currently selected line
  const currentSelection = useSelector((state) => state.results[`selected${props.searchIndex}`]);
  function clClick() {
      // selected will still have previous value at this point
    if (currentSelection === props.kv[0]) {
      dispatch({
        type:`CLEAR_SELECTED_${props.searchIndex.toUpperCase()}`
      })
    } else {
      dispatch({
        type: `SET_SELECTED_${props.searchIndex.toUpperCase()}`,
        payload: props.kv[0]
      })
    }
  }
  return (
    <Polyline 
    positions={positions}
    color={currentSelection===props.kv[0]?COLORS[props.searchIndex]["contrast"]:COLORS[props.searchIndex]["line"]}
    onclick={clClick}
    >
      <Tooltip>{props.kv[0]}</Tooltip>
    </Polyline>
  )
}

CollaborationLine.propTypes = {
  kv: PropTypes.array,
  searchIndex: PropTypes.string
}

const Map = React.forwardRef(( props, ref ) => {
  const { children, className, defaultBaseMap = DEFAULT_MAP_SERVICE, ...rest } = props;

  useConfigureLeaflet();

  const backupRef = useRef();
  const mapRef = ref || backupRef;

  // locate papers on the map
  const paper_graph = useSelector((state) => state.results.papers.graph);
  const paperVertices = paper_graph.rects();
  const paperRects = paperVertices.map(bb => (
    <React.Fragment key={`f_${bb.hash}`}>
      <Polygon color={COLORS.Papers.contrast} key={bb.hash} positions={bb.pairs} />
      <Marker key={`m_${bb.hash}`} position={bb.latlong} >
        <Popup>
          <h3>Affiliations in this Area</h3>
          <ul>
            {
              paper_graph.affiliationsInGeohash(bb.hash).map(aff => (
                <li key={aff.affiliation_id}>{aff.affiliation_name}</li>
              ))
            }
          </ul>
        </Popup>
      </Marker>
    </React.Fragment>
  ));
  const paperLines = paper_graph.lines().map(kv => (
    <CollaborationLine key={kv[0]} kv={kv} searchIndex="Papers" />
  ));

  // locate patents on the map
  const patent_graph = useSelector((state) => state.results.patents.graph);
  const patentVertices = patent_graph.rects();
  const patentRects = patentVertices.map(bb => (
    <React.Fragment key={`f_${bb.hash}`}>
      <Polygon color={COLORS.Patents.contrast} key={bb.hash} positions={bb.pairs} />
      <Marker key={`m_${bb.hash}`} position={bb.latlong} >
        <Popup>
          <h3>Inventors in this Area</h3>
          <ul>
            {
              patent_graph.affiliationsInGeohash(bb.hash).map(inventor => (
                <li key={inventor.id}>{inventor.name}</li>
              ))
            }
          </ul>
        </Popup>
      </Marker>
    </React.Fragment>
  ));
  const patentLines = patent_graph.lines().map(kv => (
    <CollaborationLine key={kv[0]} kv={kv} searchIndex="Patents" />
  ))

  const services = useMapServices({
    names: [...new Set([defaultBaseMap, DEFAULT_MAP_SERVICE])],
  });
  const basemap = services.find(( service ) => service.name === defaultBaseMap );

  let mapClassName = `map`;

  if ( className ) {
    mapClassName = `${mapClassName} ${className}`;
  }
  
  if ( !isDomAvailable()) {
    return (
      <div className={mapClassName}>
        <p className="map-loading">Loading map...</p>
      </div>
    );
  }

  const mapSettings = {
    className: 'map-base',
    zoomControl: false,
    ...rest,
  };

  return (
    <div className={mapClassName}>
      <BaseMap ref={mapRef} {...mapSettings}>
        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Papers">
            <LayerGroup>
              {paperRects}
              {paperLines}
            </LayerGroup>
          </LayersControl.Overlay>
          <LayersControl.Overlay name="Patents">
            <LayerGroup>
              {patentRects}
              {patentLines}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
        
        { children }
        { basemap && <TileLayer {...basemap} /> }
        <ZoomControl position="bottomright" />
      </BaseMap>
    </div>
  );
});

Map.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  defaultBaseMap: PropTypes.string,
  mapEffect: PropTypes.func,
  ref: PropTypes.any,
};

export default Map;
