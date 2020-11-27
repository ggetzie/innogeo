import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Map as BaseMap, TileLayer, ZoomControl, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import { useConfigureLeaflet, useMapServices } from 'hooks';
import { isDomAvailable } from 'lib/util';
import { useSelector } from "react-redux";

const DEFAULT_MAP_SERVICE = 'OpenStreetMap';

// Hong Kong Lat Long
// const HongKong = [22.283262, 114.160486];
// const zoom = 4;

// class Map extends Component {
//   render() {
//     const {className} = this.props
//     return (
//       <div className={className}>
//         <BaseMap center={location} zoom={zoom}>
//           <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
//                     attribution="&copy; <a href=&quot;https://www.openstreetmap.org/copyright&quot;>OpenStreetMap</a> contributors" />
//         </BaseMap>
//       </div>
//     )
//   }
// }

function getAffiliations(papers) {
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
  const papers = useSelector((state) => state.results.papers)
  console.log("papers in map component")
  console.log(papers)

  const affiliations = getAffiliations(papers)
  console.log("affiliation set")
  console.log(affiliations)

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

  return (
    <div className={mapClassName}>
      <BaseMap ref={mapRef} {...mapSettings}>
        {affiliationMarkers}
        {collaborationLines}
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
