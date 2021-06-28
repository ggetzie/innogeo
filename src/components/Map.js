import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { 
  Map as BaseMap, TileLayer, ZoomControl, 
  Marker, Popup, Polyline, Polygon , Tooltip
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useConfigureLeaflet, useMapServices } from 'hooks';
import { isDomAvailable, bbox_to_pairs } from 'lib/util';
import { useSelector, useDispatch } from "react-redux";

import { SET_SELECTED, CLEAR_SELECTED } from "../actions/types"

const DEFAULT_MAP_SERVICE = 'OpenStreetMap';

// Hong Kong Lat Long
// const HongKong = [22.283262, 114.160486];

function getAffiliations(papers) {
  console.log("papers in getAffiliations");
  console.log(papers)
  let affIdSet = new Set();
  let affiliation_list = []
  for (let paper of papers) {
    for (let author of paper._source.authors) {
        if (author.affiliation && !(affIdSet.has(author.affiliation.affiliation_id))) {
          affiliation_list.push({
            type: "Point",
            coordinates: author.affiliation.location.reverse(),
            name: author.affiliation.affiliation_name,
            id: author.affiliation.affiliation_id
          })
          affIdSet.add(author.affiliation.affiliation_id)
      }
    }
  }
  return affiliation_list
}

function CollaborationLine(props) {
  const [selected, setSelected] = useState(false);
  const positions = props.kv[1].map(p => [p.latitude, p.longitude]);
  const dispatch = useDispatch();
  function clClick() {
    setSelected(!selected);
    // selected will still have previous value at this point
    if (!selected) {
      dispatch({
        type: SET_SELECTED,
        payload: props.kv[0]
      })
    } else {
      dispatch({
        type:CLEAR_SELECTED
      })
    }
  }

  return (
    <Polyline 
    positions={positions}
    color={selected?"yellow":"blue"}
    onclick={clClick}
    >
      <Tooltip>{props.kv[0]}</Tooltip>
    </Polyline>
  )
}

const Map = React.forwardRef(( props, ref ) => {
  const { children, className, defaultBaseMap = DEFAULT_MAP_SERVICE, ...rest } = props;

  useConfigureLeaflet();

  const backupRef = useRef();
  const mapRef = ref || backupRef;

  // locate papers on the map
  // const papers = useSelector((state) => state.results.papers.hits)
  const paper_graph = useSelector((state) => state.results.papers.graph);

  const vertices = paper_graph.rects();
  
  const rects = vertices.map(bb => (
    <React.Fragment key={`f_${bb.hash}`}>
      <Polygon color="magenta" key={bb.hash} positions={bb.pairs} />
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

  // const lines = paper_graph.lines().map(kv => (
  //   <Polyline 
  //   color={this.props.selected?"yellow":"blue"} 
  //   key={kv[0]} 
  //   selected={false}
  //   positions={kv[1].map(p => [p.latitude, p.longitude])} 
  //   onclick={(e) => (console.log(e.target))}
  //   />
  // ));
  console.log("paper_graph edgeMap")
  for (let [key, value] of paper_graph.edgeMap) {
    console.log(`${key}: ${value}`)
  }

    const lines = paper_graph.lines().map(kv => (
    <CollaborationLine key={kv[0]} kv={kv} />
  ));

  // const affiliations = getAffiliations(papers)

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
  // const affiliationMarkers = affiliations.map((aff) => (
  //   <Marker key={aff.id} position={aff.coordinates}>
  //     <Popup>
  //       {aff.name} - [{aff.coordinates[0]}, {aff.coordinates[1]}]
  //     </Popup>
  //   </Marker>
  // ))

  // const collaborationLines = papers
  // .filter((paper) => (paper._source.locations.length > 1))
  // .map((paper) => (
  //   <Polyline 
  //   key={paper._source.paper_id} 
  //   positions={paper._source.locations.map((l) => l.reverse())}
  //   color="magenta">
  //   </Polyline>
  // ))

  // const polygons = paper_buckets.map((bucket) => {
  //   let positions = bbox_to_pairs(decode_bbox(bucket.key));
  //   return (
  //     <Polygon positions={positions} color="red">
  //       <Popup>
  //         {bucket.doc_count} papers in this area
  //       </Popup>
  //     </Polygon>
  //   )
  // });

  return (
    <div className={mapClassName}>
      <BaseMap ref={mapRef} {...mapSettings}>
        {/* {affiliationMarkers} */}
        {/* {collaborationLines} */}
        {rects}
        {lines}
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
