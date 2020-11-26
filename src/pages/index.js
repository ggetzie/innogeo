import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

import { promiseToFlyTo, getCurrentLocation } from 'lib/map';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';
import SearchForm from 'components/SearchForm';
import SearchResults from 'components/SearchResults';
import { Provider } from 'react-redux';
import store from "../store"
// import Snippet from 'components/Snippet';

import gatsby_astronaut from 'assets/images/gatsby-astronaut.jpg';

const LOCATION = {
  lat: 38.9072,
  lng: -77.0369,
};

const HongKong = [22.283262, 114.160486];
// const CENTER = [LOCATION.lat, LOCATION.lng];
const CENTER = [0,0]
const DEFAULT_ZOOM = 2;
const ZOOM = 10;

const timeToZoom = 2000;
const timeToOpenPopupAfterZoom = 4000;
const timeToUpdatePopupAfterZoom = timeToOpenPopupAfterZoom + 3000;

const popupContentHello = `<p>Hello 👋</p>`;
const popupContentGatsby = `
  <div class="popup-gatsby">
    <div class="popup-gatsby-image">
      <img class="gatsby-astronaut" src=${gatsby_astronaut} />
    </div>
    <div class="popup-gatsby-content">
      <h1>Innovative Geography</h1>
      <p>Search below to find areas of research and show them on the map.</p>
    </div>
  </div>
`;

const IndexPage = () => {
  const markerRef = useRef();
  const mapRef = useRef();

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement } = {}) {
    if ( !leafletElement ) return;

    const popup = L.popup({
      maxWidth: 800,
    });

    const location = await getCurrentLocation().catch(() => LOCATION );

    const { current = {} } = markerRef || {};
    const { leafletElement: marker } = current;

    marker.setLatLng( location );
    popup.setLatLng( location );
    popup.setContent( popupContentHello );

    setTimeout( async () => {
      await promiseToFlyTo( leafletElement, {
        zoom: ZOOM,
        center: location,
      });

      marker.bindPopup( popup );

      setTimeout(() => marker.openPopup(), timeToOpenPopupAfterZoom );
      setTimeout(() => marker.setPopupContent( popupContentGatsby ), timeToUpdatePopupAfterZoom );
    }, timeToZoom );
  }
  

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect,
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
