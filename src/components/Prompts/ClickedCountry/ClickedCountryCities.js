import React, { Component } from "react";
import PropTypes from "prop-types";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import MapGL, { Marker, Popup } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";
import Swal from "sweetalert2";
import { Mutation } from "react-apollo";
import {
  ADD_PLACE_VISITING,
  ADD_PLACE_VISITED,
  ADD_PLACE_LIVING
} from "../../../GraphQL";
import { countryConsts } from "../../../CountryConsts";
import TrashIcon from "../../../icons/TrashIcon";
import CityLivedPopup from "./CityLivedPopup";

class ClickedCountryCities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: 400,
        height: 400,
        latitude: countryConsts[this.props.countryIndex].coordinates[0],
        longitude: countryConsts[this.props.countryIndex].coordinates[1],
        zoom: countryConsts[this.props.countryIndex].zoom
      },
      markerDisplay: null,
      markerIndex: null,
      mapCities: [],
      country: {
        country: this.props.country,
        countryId: this.props.countryId,
        countryISO: this.props.countryISO
      },
      style: {},
      gl: null,
      cityTooltip: null,
      swalNotFired: true,
      livePopup: false
    };
    this.mapRef = React.createRef();
    this.resize = this.resize.bind(this);
    this.handleViewportChange = this.handleViewportChange.bind(this);
    this.handleMapMovement = this.handleMapMovement.bind(this);
    this.handleOnResult = this.handleOnResult.bind(this);
    this._onWebGLInitialized = this._onWebGLInitialized.bind(this);
    this.handleNewMarkers = this.handleNewMarkers.bind(this);
    this._renderPopup = this._renderPopup.bind(this);
    this.deleteCity = this.deleteCity.bind(this);
    this.handleLivePopup = this.handleLivePopup.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.resize);
    this.resize();
    let style = "";
    switch (this.props.timing) {
      case 0:
        style = { color: "#cb7678", background: "#ecd7db" };
        break;
      case 1:
        style = { color: "#73a7c3", background: "#c2d7e5" };
        break;
      case 2:
        style = { color: "#96b1a8", background: "#d1dcdb" };
        break;
      default:
        break;
    }
    this.setState({
      style
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.countryIndex !== prevProps.countryIndex) {
      let viewport = this.state.viewport;
      viewport.latitude = countryConsts[this.props.countryIndex].coordinates[0];
      viewport.longitude =
        countryConsts[this.props.countryIndex].coordinates[1];
      viewport.zoom = countryConsts[this.props.countryIndex].zoom;
      this.setState({
        viewport: viewport
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
  }

  resize() {
    this.handleViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  handleViewportChange(viewport) {
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });
  }

  handleMapMovement(newBounds) {
    this.setState({
      bounds: newBounds
    });
  }

  handleNewMarkers(markers, type) {
    let fill = "";
    let fill2 = "";
    switch (this.props.timing) {
      case 0:
        fill = "rgba(203, 118, 120, 0.25)";
        fill2 = "rgba(203, 118, 120, 1.0)";
        break;
      case 1:
        fill = "rgba(115, 167, 195, 0.25)";
        fill2 = "rgba(115, 167, 195, 1.0)";
        break;
      case 2:
        fill = "rgba(150, 177, 168, 0.25)";
        fill2 = "rgba(150, 177, 168, 1.0)";
        break;
      default:
        break;
    }
    let markerDisplay = markers.map((city, i) => {
      return (
        <Marker
          key={city.cityId}
          offsetLeft={-5}
          offsetTop={-10}
          latitude={city.city_latitude}
          longitude={city.city_longitude}
          captureClick={false}
        >
          <svg
            key={"svg" + city.cityId}
            height={20}
            width={20}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              onMouseOver={() =>
                this.setState({ cityTooltip: city, markerIndex: i })
              }
              key={"circle" + city.cityId}
              cx="50"
              cy="50"
              r="50"
              style={{ fill: fill }}
            />
            <circle
              style={{ fill: fill2 }}
              key={"circle2" + city.cityId}
              cx="50"
              cy="50"
              r="20"
            />
          </svg>
        </Marker>
      );
    });
    this.setState({
      markerDisplay: markerDisplay
    });
    type ? this.props.handleTypedCity(1) : this.props.handleTypedCity(0);
  }

  handleOnResult(event) {
    let cities = this.state.mapCities;
    let cityArrayElement = {
      city: event.result.text,
      cityId: parseFloat(event.result.properties.wikidata.slice(1), 10),
      city_latitude: event.result.center[1],
      city_longitude: event.result.center[0]
    };

    cities.push(cityArrayElement);
    this.setState(
      {
        mapCities: cities
      },
      () => {
        this.handleLivePopup("city");
      }
    );
    this.handleNewMarkers(cities, 1);
  }

  handleLivePopup(type) {
    if (this.props.timing === 2 && this.props.tripData.Place_living !== null) {
      let popupText = "";
      switch (type) {
        case "city":
          popupText =
            "You currently live in " +
            this.props.tripData.Place_living.city +
            ", " +
            this.props.tripData.Place_living.countryISO +
            ". Would you like to update this to " +
            this.state.mapCities[0].city +
            "?";
          break;
        case "country":
          popupText =
            "You currently live in " +
            this.props.tripData.Place_living.country +
            ". Would you like to update this to " +
            this.props.country +
            "?";
          break;
        default:
          break;
      }
      const swalParams = {
        type: "question",
        customClass: {
          container: "live-swal-prompt"
        },
        text: popupText,
        showCancelButton: true,
        cancelButtonColor: "#cb7678"
      };
      Swal.fire(swalParams).then(result => {
        if (result.value) {
          this.props.showPopup();
          this.props.updateMap();
        }
      });
      this.setState({
        swalNotFired: false,
        livePopup: true
      });
    }
  }

  _onWebGLInitialized(gl) {
    this.setState({ gl: gl });
  }

  _renderPopup() {
    const { cityTooltip } = this.state;
    return (
      cityTooltip && (
        <Popup
          key={cityTooltip.cityId}
          className="city-map-tooltip"
          tipSize={5}
          anchor="top"
          longitude={cityTooltip.city_longitude}
          latitude={cityTooltip.city_latitude}
          closeOnClick={false}
          style={{
            background: "rgba(115, 167, 195, 0.75)",
            color: "rgb(248, 248, 252)"
          }}
        >
          {cityTooltip.city}
          <TrashIcon
            cityKey={cityTooltip.cityId}
            trashClicked={this.deleteCity}
          />
        </Popup>
      )
    );
  }

  deleteCity(cityId) {
    let cities = this.state.mapCities;
    let cityIndex = null;
    cities.find((city, i) => {
      if (city.cityId === cityId) {
        cityIndex = i;
        return true;
      } else {
        return false;
      }
    });
    cities.splice(cityIndex, 1);
    this.setState({ mapCities: cities, cityTooltip: null });
    this.handleNewMarkers(cities, 0);
  }

  render() {
    const { viewport, markerDisplay, country, mapCities, style } = this.state;
    let mutationType = "";
    let cities = "";
    switch (this.props.timing) {
      case 0:
        mutationType = ADD_PLACE_VISITED;
        cities = mapCities;
        break;
      case 1:
        mutationType = ADD_PLACE_VISITING;
        cities = mapCities;
        break;
      case 2:
        mutationType = ADD_PLACE_LIVING;
        cities = mapCities[0];
        break;
      default:
        break;
    }
    return (
      <div className="city-choosing-container">
        <Mutation
          mutation={mutationType}
          variables={{ country, cities }}
          onCompleted={this.props.updateMap}
        >
          {mutation => (
            <button
              className="submit-cities"
              style={style}
              onClick={(this.props.timing === 2 && this.props.tripData.Place_living !== null) ? () => this.handleLivePopup("country") :
                null}
            >
              Save
            </button>
          )}
        </Mutation>
        <MapGL
          mapStyle={"mapbox://styles/mvance43776/cjxtn4tww8i0l1cqmkui7xl32"}
          ref={this.mapRef}
          {...viewport}
          mapboxApiAccessToken={
            "pk.eyJ1IjoibXZhbmNlNDM3NzYiLCJhIjoiY2pwZ2wxMnJ5MDQzdzNzanNwOHhua3h6cyJ9.xOK4SCGMDE8C857WpCFjIQ"
          }
          onViewportChange={this.handleViewportChange}
        >
          {markerDisplay}
          {this._renderPopup()}
          <Geocoder
            mapRef={this.mapRef}
            onResult={this.handleOnResult}
            mapboxApiAccessToken={
              "pk.eyJ1IjoibXZhbmNlNDM3NzYiLCJhIjoiY2pwZ2wxMnJ5MDQzdzNzanNwOHhua3h6cyJ9.xOK4SCGMDE8C857WpCFjIQ"
            }
            position="top-right"
            types={"place"}
            placeholder={"Type a city..."}
            countries={this.props.countryISO}
          />
        </MapGL>
        <div className="city-lived-popup">
          {this.state.livePopup ? (
            <CityLivedPopup
            handleAddCity = {this.props.updateMap}
              country={this.state.country}
              cities={
                this.state.mapCities.length > 0
                  ? this.state.mapCities[0]
                  : { city: "", cityId: 0, city_latitude: 0, city_longitude: 0 }
              }
              id={this.props.tripData.Place_living.id}
            />
          ) : null}
        </div>
      </div>
    );
  }
}

ClickedCountryCities.propTypes = {
  country: PropTypes.string,
  countryId: PropTypes.number,
  countryISO: PropTypes.string,
  countryIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  handleTypedCity: PropTypes.func,
  timing: PropTypes.number,
  updateMap: PropTypes.func,
  tripData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  showPopup: PropTypes.func
};

export default ClickedCountryCities;
