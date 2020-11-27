import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';

import Layout from 'components/Layout';
import Map from 'components/Map';
import SearchForm from 'components/SearchForm';
import SearchResults from 'components/SearchResults';
import { Provider } from 'react-redux';
import store from "../store"
// import Snippet from 'components/Snippet';

import 'leaflet/dist/leaflet.css'

// const LOCATION = {
//   lat: 38.9072,
//   lng: -77.0369,
// };
const HongKong = [22.283262, 114.160486];
// const CENTER = [LOCATION.lat, LOCATION.lng];
// const CENTER = [0,0]
const CENTER = HongKong;
const DEFAULT_ZOOM = 2;

const IndexPage = () => {
  const mapRef = useRef();

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
  };

  return (
    <Provider store={store}>
      <Layout pageName="home">
        <Helmet>
          <title>Home Page</title>
        </Helmet>
        <div className="main-row">
          <div className="res-col">
            <SearchForm />
            <SearchResults />
          </div>
          <div className="map-col">
            <Map ref={mapRef} {...mapSettings}>
            </Map>
          </div>
          
        </div>
      </Layout>
    </Provider>
  );
};

export default IndexPage;
