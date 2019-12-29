import React, { useState } from "react";
import PropTypes from "prop-types";
import { Mutation } from "react-apollo";
import Swal from "sweetalert2";

import {
  ADD_PLACE_LIVING,
  ADD_PLACE_VISITED,
  ADD_PLACE_VISITING
} from "../../../GraphQL";
import CityLivedPopup from "../ClickedCountry/CityLivedPopup";

function ClickedCityTiming(props) {
  const [livePopup, handleLivePopup] = useState(false);
  const {
    clickedCountry,
    latitude,
    longitude,
    city,
    countryISO,
    countryId,
    cityId,
    tripData
  } = props;
  let country = {
    country: clickedCountry,
    countryId: countryId,
    countryISO: countryISO
  };
  let cities = {
    city: city,
    cityId: cityId,
    city_latitude: latitude,
    city_longitude: longitude
  };
  function handleAddCity(data, timing) {
    switch (timing) {
      case 0:
        props.handleTripTiming(data.addPlaceVisited[0], timing);
        break;
      case 1:
        props.handleTripTiming(data.addPlaceVisiting[0], timing);
        break;
      case 2:
        if (data.addPlaceLiving === undefined) {
          props.handleTripTiming(data.updatePlaceLiving, timing);
        } else {
          props.handleTripTiming(data.addPlaceLiving, timing);
        }
        break;
      default:
        break;
    }
    props.refetch();
  }
  function evalLiveClick() {
    if (tripData.Place_living !== null) {
      let popupText =
        "You currently live in " +
        tripData.Place_living.city +
        ", " +
        tripData.Place_living.countryISO +
        ". Would you like to update this to " +
        city +
        "?";

      const swalParams = {
        type: "question",
        customClass: {
          container: "live-swal-prompt"
        },
        text: popupText
      };
      Swal.fire(swalParams).then(result => {
        if (result.value) {
          handleLivePopup(true);
        }
      });
    }
  }

  return (
    <div className="clicked-country-timing-container">
      {!props.previousTimings[0] ? (
        <Mutation
          mutation={ADD_PLACE_VISITED}
          variables={{ country, cities }}
          onCompleted={data => handleAddCity(data, 0)}
        >
          {mutation => (
            <span className="past-timing" onClick={mutation}>
              I visited here
            </span>
          )}
        </Mutation>
      ) : (
        <span className="past-timing unclickable-timing">I visited here</span>
      )}
      {!props.previousTimings[1] ? (
        <Mutation
          mutation={ADD_PLACE_VISITING}
          variables={{ country, cities }}
          onCompleted={data => handleAddCity(data, 1)}
        >
          {mutation => (
            <span className="future-timing" onClick={mutation}>
              I plan to visit here
            </span>
          )}
        </Mutation>
      ) : (
        <span className="future-timing unclickable-timing">I plan to visit here</span>
      )}
      {!props.previousTimings[2] ? (
        tripData.Place_living === null ? (
          <Mutation
            mutation={ADD_PLACE_LIVING}
            variables={{ country, cities }}
            onCompleted={data => handleAddCity(data, 2)}
          >
            {mutation => (
              <span className="live-timing" onClick={mutation}>
                I live here currently
              </span>
            )}
          </Mutation>
        ) : (
          <span className="live-timing" onClick={() => evalLiveClick()}>I live here currently</span>
        )
      ) : (
        <span className="live-timing unclickable-timing">I live here currently</span>
      )}
      {props.previousTrips ? (
        <div className="previous-trips-button">delete trips</div>
      ) : null}
      {livePopup ? (
        <CityLivedPopup
          country={country}
          cities={cities}
          id={tripData.Place_living.id}
          handleAddCity={handleAddCity}
        />
      ) : null}
    </div>
  );
}

ClickedCityTiming.propTypes = {
  handleTripTiming: PropTypes.func,
  previousTrips: PropTypes.bool,
  clickedCountry: PropTypes.string,
  city: PropTypes.string,
  countryId: PropTypes.number,
  longitude: PropTypes.number,
  latitude: PropTypes.number,
  cityId: PropTypes.number,
  countryISO: PropTypes.string,
  refetch: PropTypes.func,
  tripData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  previousTimings: PropTypes.array
};

export default ClickedCityTiming;
