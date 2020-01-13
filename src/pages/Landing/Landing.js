import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { NavLink, withRouter } from "react-router-dom";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapGL, { Marker } from "react-map-gl";

import FakeClickedCityContainer from "./subcomponents/FakeClickedCityContainer";
import FakeClickedFriendCityContainer from "./subcomponents/FakeClickedFriendCity";

let incomingCities = [
  {
    city: "Lagos",
    cityId: 8673,
    city_latitude: 6.45,
    city_longitude: 3.4,
    tripTiming: 0
  },
  {
    city: "Stockholm",
    cityId: 1754,
    city_latitude: 59.32944,
    city_longitude: 18.06861,
    tripTiming: 1
  },
  {
    city: "Brisbane",
    cityId: 34932,
    city_latitude: -27.469,
    city_longitude: 153.0235,
    tripTiming: 2
  },
  {
    city: "Shanghai",
    cityId: 8686,
    city_latitude: 31.16667,
    city_longitude: 121.46667,
    tripTiming: 1
  },
  {
    city: "New York City",
    cityId: 60,
    city_latitude: 40.7648,
    city_longitude: -73.9808,
    tripTiming: 0
  },
  {
    city: "Salzburg",
    cityId: 34713,
    city_latitude: 47.8,
    city_longitude: 13.03333,
    tripTiming: 0
  },
  {
    city: "Wellington",
    cityId: 23661,
    city_latitude: -41.28889,
    city_longitude: 174.77722,
    tripTiming: 1
  },
  {
    city: "Brasília",
    cityId: 2844,
    city_latitude: -15.7934,
    city_longitude: -47.8823,
    tripTiming: 0
  },
  {
    city: "Panama City",
    cityId: 3306,
    city_latitude: 9,
    city_longitude: -79.5,
    tripTiming: 1
  },
  {
    city: "Istanbul",
    cityId: 406,
    city_latitude: 41.01,
    city_longitude: 28.96028,
    tripTiming: 0
  },
  {}
];

function NewMarker(city) {
  let color;
  switch (city.city.tripTiming) {
    case 0:
      color = "(203, 118, 120, ";
      break;
    case 1:
      color = "(115, 167, 195, ";
      break;
    case 2:
      color = "(150, 177, 168,";
      break;
    default:
      break;
  }
  return (
    <Marker
      key={city.city.cityId}
      latitude={city.city.city_latitude}
      longitude={city.city.city_longitude}
      offsetLeft={-5}
      offsetTop={-10}
    >
      <div
        style={{
          backgroundColor: "rgba" + color + "0.25)"
        }}
        key={"circle" + city.cityId}
        className="dot"
      />
      <div
        style={{
          backgroundColor: "rgba" + color + "1)"
        }}
        key={"circle2" + city.cityId}
        className="dot-inner"
      />
      <div
        style={{ border: "10px solid rgba" + color + "1)" }}
        key={"circle3" + city.cityId}
        className="pulse"
      />
    </Marker>
  );
}

function LoadedMarker(city) {
  let color;
  switch (city.tripTiming) {
    case 0:
      color = "(203, 118, 120, ";
      break;
    case 1:
      color = "(115, 167, 195, ";
      break;
    case 2:
      color = "(150, 177, 168,";
      break;
    default:
      break;
  }
  return (
    <Marker
      key={city.cityId}
      latitude={city.city_latitude}
      longitude={city.city_longitude}
      offsetLeft={-5}
      offsetTop={-10}
    >
      <svg
        key={"svg" + city.cityId}
        height={20}
        width={20}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          style={{ fill: "rgba" + color + "0.25)" }}
          key={"circle" + city.cityId}
          cx="50"
          cy="50"
          r="50"
        />
        <circle
          style={{ fill: "rgba" + color + "1.0)" }}
          key={"circle2" + city.cityId}
          cx="50"
          cy="50"
          r="20"
        />
      </svg>
    </Marker>
  );
}

function Landing() {
  const [activeTab, handleActiveTab] = useState("loginTab");
  const [windowWidth, handleWindowWidth] = useState(undefined);
  const [viewport, handleViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    latitude: 0,
    longitude: 0,
    zoom: setInitialZoom()
  });
  const [markers, handleMarkers] = useState([]);
  const [markerPastDisplay, handleMarkerPastDisplay] = useState([]);
  const [markerFutureDisplay, handleMarkerFutureDisplay] = useState([]);
  const [markerLiveDisplay, handleMarkerLiveDisplay] = useState([]);
  const [loading, handleLoaded] = useState(true);
  const mapRef = useRef();

  useEffect(() => {
    handleWindowWidth(window.innerWidth);
    window.addEventListener("resize", resize);
    resize();
    if (incomingCities.length > 0) {
      let newMarkers = setInterval(() => {
        addMarker();
        if (incomingCities.length < 1) {
          clearInterval(newMarkers);
        }
      }, 2000);
    }
    return function cleanup() {
      window.removeEventListener("resize", resize);
    };
  }, []);

  function addMarker() {
    let index = Math.floor(Math.random() * incomingCities.length);
    let newMarkers = [...markers];
    markers.push(
      <NewMarker key={incomingCities[0].cityId} city={incomingCities[0]} />
    );
    handleMarkers(newMarkers);
    incomingCities.splice(0, 1);
  }

  function setActive(event) {
    handleActiveTab(event.target.id);
  }

  function isActive(tab) {
    return tab === activeTab ? "activeTab" : "";
  }

  function resize() {
    handleWindowWidth(window.innerWidth);
    handleViewportChange({
      width: window.innerWidth,
      height: window.innerHeight,
      zoom: setInitialZoom()
    });
  }

  function handleViewportChange(newViewport) {
    handleViewport({ ...viewport, ...newViewport });
  }
  function setInitialZoom() {
    let zoom;
    if (window.innerWidth >= 2400) {
      zoom = 2.2;
    } else if (window.innerWidth >= 1750) {
      zoom = 1.75;
    } else if (window.innerWidth <= 900) {
      zoom = 0.75;
    } else if (window.innerWidth <= 1200) {
      zoom = 1.0;
    } else if (window.innerWidth <= 1400) {
      zoom = 1.25;
    } else if (window.innerWidth < 1750) {
      zoom = 1.5;
    }
    return zoom;
  }

  return (
    <>
      <div className="landing-container">
        <div
          className="city-map-container"
          id="landing-map"
          style={{ "z-index": "-1" }}
        >
          <MapGL
            mapStyle={"mapbox://styles/mvance43776/ck5btmnmw3ieg1dmrl61syi6q"}
            ref={mapRef}
            width="100%"
            height="100%"
            {...viewport}
            mapboxApiAccessToken={
              "pk.eyJ1IjoibXZhbmNlNDM3NzYiLCJhIjoiY2pwZ2wxMnJ5MDQzdzNzanNwOHhua3h6cyJ9.xOK4SCGMDE8C857WpCFjIQ"
            }
            onViewportChange={handleViewportChange}
            minZoom={0.25}
            style={{
              width: "100vw",
              minHeight: "calc(100% - 120px)",
              maxHeight: "calc(100%)",
              position: "relative"
            }}
          >
            <LoadedMarker
              city="Fremont"
              cityId={49220}
              city_latitude={37.5483}
              city_longitude={-121.9886}
              tripTiming={0}
            />
            <LoadedMarker
              city="Copenhagen"
              cityId={1748}
              city_latitude={55.67611}
              city_longitude={12.56889}
              tripTiming={0}
            />
            <LoadedMarker
              city="Rome"
              cityId={220}
              city_latitude={41.89306}
              city_longitude={12.48278}
              tripTiming={0}
            />
            {markers}
          </MapGL>
        </div>
        <div className="landing-motto-container">
          <div className="landing-motto">
            <span>Save travel memories.</span>
            <span>Help friends make their own.</span>
          </div>
          <div className="landing-motto-sub">
            <p>
              All of us are world travelers and none of us have seen the whole
              world. <br />
              We can all learn from each other to improve our own trips.
            </p>
            <p>
              Use Geornal to showcase your personal travel map, write reviews of
              your most memorable experiences, and see where your friends have
              been to help guide decisions on where to go next.
            </p>
          </div>
          <NavLink exact to={`/new`}>
            <button className="button new-map-button">Make my map</button>
          </NavLink>
          <div className="border-bar-container">
            <span className="landing-green-bar" />
            <span className="landing-red-bar" />
            <span className="landing-blue-bar" />
            <span className="landing-yellow-bar" />
          </div>
        </div>
        {/* <div className="landing-form-container">
          <LandingForm handleUserLogin={() => this.props.handleUserLogin(1)} />
        </div> */}
      </div>
      <div className="landing-second-page">
        <div className="landing-additional-info-container">
          <subheader>
            <span>1</span>
            <span>add cities to your travel map</span>
          </subheader>
          <div className="map-search-container" id="landing-search-container">
            <input
              className="map-search"
              id="map-search-bar"
              type="text"
              list="country-choice"
              name="country-search"
              value={"Auckland, NZ"}
            />
            <span>----></span>
          </div>
          <div>
            <FakeClickedCityContainer />
          </div>
        </div>
      </div>
      <div className="landing-third-page">
        <div className="landing-additional-info-container">
          <subheader>
            <span>2</span>
            <span>make geornal entries for your trips</span>
          </subheader>
        </div>
        <div></div>
      </div>
      <div className="landing-fourth-page">
        <div className="landing-additional-info-container">
          <subheader>
            <span>3</span>
            <span>discover where friends have been</span>
          </subheader>
          <div className="map-search-container" id="landing-search-container">
            <input
              className="map-search"
              id="map-search-bar"
              type="text"
              list="country-choice"
              name="country-search"
              value={"Auckland, NZ"}
            />
            <span>----></span>
          </div>
          <div>
            <FakeClickedFriendCityContainer />
          </div>
        </div>
      </div>
    </>
  );
}

Landing.propTypes = {
  handleUserLogin: PropTypes.func
};

export default withRouter(Landing);
