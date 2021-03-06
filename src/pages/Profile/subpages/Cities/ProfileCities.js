import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

import MenuIcon from "../../../../icons/MenuIcon";
import AllTimingsIcon from "../../../../icons/AllTimingsIcon";
import PastIcon from "../../../../icons/PastIcon";
import FutureIcon from "../../../../icons/FutureIcon";
import LiveIcon from "../../../../icons/LiveIcon";
import ProfileCityCard from "./ProfileCityCard";
import Loader from '../../../../components/common/Loader/Loader';

export default function ProfileCities({
  searchText,
  handleSelectedCity,
  cityData,
  urlUsername,
  location,
  handleOriginalSearch,
  refetch
}) {
  const [loaded, handleLoaded] = useState(false);
  const [expanded, handleToggle] = useState(false);
  const [results, setResults] = useState();
  const [timing, handleTiming] = useState("");
  useEffect(() => {
    if (location.state !== null) {
      handleOriginalSearch(location.state.searchText);
    } else {
      handleOriginalSearch("");
    }
  }, [location, handleOriginalSearch]);
  useEffect(() => {
    let combinedResults = [];
    for (let i in cityData.Places_visited) {
      if (cityData.Places_visited[i].city !== "") {
        cityData.Places_visited[i].timing = "past";
        combinedResults.push(cityData.Places_visited[i]);
      }
    }
    for (let i in cityData.Places_visiting) {
      if (cityData.Places_visiting[i].city !== "") {
        cityData.Places_visiting[i].timing = "future";
        combinedResults.push(cityData.Places_visiting[i]);
      }
    }
    if (cityData.Place_living !== null && cityData.Place_living.city !== "") {
      cityData.Place_living.timing = "live";
      combinedResults.push(cityData.Place_living);
    }
    setResults(combinedResults);
    let filteredArray = combinedResults.filter(
      city =>
        (city.city.toLowerCase().indexOf(searchText.toLowerCase()) > -1 ||
          city.country.toLowerCase().indexOf(searchText.toLowerCase()) > -1) &&
        city.timing.indexOf(timing) > -1
    );
    setResults(filteredArray);
    handleLoaded(true);
  }, [searchText, timing, cityData]);

  if (!loaded) return <Loader />;
  return (
    <div className="profile-cities content">
      <div
        className={
          expanded ? "sidebar-filter sidebar-filter-active" : "sidebar-filter"
        }
      >
        <a onClick={() => handleToggle(!expanded)}>
          {expanded ? <div></div> : null}
          <MenuIcon />
        </a>
        <button
          onClick={() => handleTiming("")}
          className={!timing ? "active" : ""}
        >
          {expanded ? "all" : null}
          <AllTimingsIcon />
        </button>
        <button
          onClick={() => handleTiming("past")}
          className={timing === "past" ? "active" : ""}
        >
          {expanded ? "past" : null}
          <PastIcon />
        </button>
        <button
          onClick={() => handleTiming("future")}
          className={timing === "future" ? "active" : ""}
        >
          {expanded ? "future" : null}
          <FutureIcon />
        </button>
        <button
          onClick={() => handleTiming("live")}
          className={timing === "live" ? "active" : ""}
        >
          {expanded ? "live" : null}
          <LiveIcon />
        </button>
      </div>
      <div className="content-results">
        {results.length  < 1 ? <span className = 'no-cities-text'>No cities recorded yet!</span> : null}
        {results.map((city, index) => (
          <ProfileCityCard
            key={city.city + city.timing + index}
            urlUsername={urlUsername}
            cityData={city}
            refetch={refetch}
            color={
              city.timing === "past"
                ? "#CB7678"
                : city.timing === "future"
                ? "#73A7C3"
                : "#96B1A8"
            }
            handleSelectedCity={handleSelectedCity}
          />
        ))}
      </div>
    </div>
  );
}

ProfileCities.propTypes = {
  searchText: PropTypes.string,
  handleSelectedCity: PropTypes.func,
  user: PropTypes.object,
  cityData: PropTypes.object,
  urlUsername: PropTypes.string,
  location: PropTypes.object,
  handleOriginalSearch: PropTypes.func,
  refetch: PropTypes.func
};
