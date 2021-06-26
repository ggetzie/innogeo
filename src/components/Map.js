import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Map as BaseMap, TileLayer, ZoomControl, Marker, Popup, Polyline, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useConfigureLeaflet, useMapServices } from 'hooks';
import { isDomAvailable, bbox_to_pairs } from 'lib/util';
import { useSelector } from "react-redux";

import { decode_bbox } from "ngeohash";

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

const Map = React.forwardRef(( props, ref ) => {
  const { children, className, defaultBaseMap = DEFAULT_MAP_SERVICE, ...rest } = props;

  useConfigureLeaflet();

  const backupRef = useRef();
  const mapRef = ref || backupRef;

  // locate papers on the map
  const papers = useSelector((state) => state.results.papers.hits)
  const paper_graph = useSelector((state) => state.results.papers.graph);

  const vertices = paper_graph.bboxes();
  
  const rects = vertices.map(bb => (
    <Polygon color="magenta" key={bb[0]} positions={bb[1]} />
  ));

  const lines = paper_graph.lines().map(kv => (
    <Polyline color="blue" key={kv[0]} positions={kv[1].map(p => [p.latitude, p.longitude])} />
  ));

  const affiliations = getAffiliations(papers)

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
  const affiliationMarkers = affiliations.map((aff) => (
    <Marker key={aff.id} position={aff.coordinates}>
      <Popup>
        {aff.name} - [{aff.coordinates[0]}, {aff.coordinates[1]}]
      </Popup>
    </Marker>
  ))

  const collaborationLines = papers
  .filter((paper) => (paper._source.locations.length > 1))
  .map((paper) => (
    <Polyline 
    key={paper._source.paper_id} 
    positions={paper._source.locations.map((l) => l.reverse())}
    color="magenta">
    </Polyline>
  ))

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
