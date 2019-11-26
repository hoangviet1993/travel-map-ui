import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Route } from "react-router-dom";
import { Query, withApollo } from "react-apollo";
import { GET_ALL_CITY_DETAILS } from "../../GraphQL";

import Sidebar from "./Sidebar";
import ProfileNav from "./ProfileNav";
import ProfileCities from "./subpages/Cities/ProfileCities";
import Settings from "./subpages/Settings";
import ProfileIndividualCity from "./subpages/Cities/ProfileIndividualCity";
import Loader from "../../components/common/Loader/Loader";

// if the username props is passed, it means the profile of a user that is not logged in will be shown.
export default function Profile({ user, urlUsername, refetch }) {
  const [loaded, handleLoaded] = useState(false);
  const [cityArray, handleCityArray] = useState([]);
  const [countryArray, handleCountryArray] = useState([]);
  const [searchText, handleSearchText] = useState("");
  const [userData, handleUserData] = useState(user);
  const [cityData, handleCityData] = useState();
  const [page, handlePageRender] = useState("settings");
  const [selectedCity, handleCity] = useState("none");
  const [cityReviews, handleCityReviews] = useState([]);
  function handleUserDataChange(data) {
    handleUserData(data);
    refetch();
  }

  function handleSelectedCity(selectedCityData, reviews) {
    handleCityReviews(reviews);
    handleCity(selectedCityData);
  }
  useEffect(() => {
    let userData = user;
    let cityArray = [0];
    let countryArray = [0];
    if (userData.Places_visited !== null) {
      userData.Places_visited.forEach(tripType => {
        if (cityArray.indexOf(tripType.cityId) === -1) {
          cityArray.push(tripType.cityId);
        }
        if (countryArray.indexOf(tripType.countryId) === -1) {
          countryArray.push(tripType.countryId);
        }
      });
    }
    if (userData.Places_visiting !== null) {
      userData.Places_visiting.forEach(tripType => {
        if (cityArray.indexOf(tripType.cityId) === -1) {
          cityArray.push(tripType.cityId);
        }
        if (countryArray.indexOf(tripType.countryId) === -1) {
          countryArray.push(tripType.countryId);
        }
      });
    }
    if (userData.Place_living !== null) {
      if (cityArray.indexOf(userData.Place_living) === -1) {
        cityArray.push(userData.Place_living.cityId);
      }
      if (countryArray.indexOf(userData.Place_living.countryId) === -1) {
        countryArray.push(userData.Place_living.countryId);
      }
    }
    handleCityArray(cityArray);
    handleCountryArray(countryArray);
  }, [user]);
  function handleFetch() {
    if (selectedCity !== "none") {
      if (selectedCity.timing === "past") {
        let newData = cityData.Places_visited.find(element => element.id === selectedCity.id);
        newData.timing = "past";
        handleSelectedCity(newData);
        handleCityReviews(newData.CityReviews)
      } else if (selectedCity.timing === "future") {
        let newData = cityData.Places_visiting.find(element => element.id === selectedCity.id);
        newData.timing = "future";
        handleSelectedCity(newData);
        handleCityReviews(newData.CityReviews)
      }  else if (selectedCity.timing === "live") {
        let newData = cityData.Place_living;
        newData.timing = "live";
        handleSelectedCity(newData);
        handleCityReviews(newData.CityReviews)
      }
    }
    handleLoaded(true);
  }
  return (
    <Query
      query={GET_ALL_CITY_DETAILS}
      notifyOnNetworkStatusChange
      fetchPolicy={"cache-and-network"}
      partialRefetch={true}
      onCompleted={() => handleFetch()}
    >
      {({ loading, error, data, refetch }) => {
        if (loading) return <Loader />;
        if (error) return `Error! ${error}`;
        handleCityData(data.user);
        if (!loaded) return null;
        return (
          <div className="page page-profile">
            <div className="container">
              <Sidebar
                urlUsername={urlUsername}
                userData={userData}
                city={
                  user.Place_living !== null ? user.Place_living.city : "City"
                }
                country={
                  user.Place_living !== null
                    ? user.Place_living.country
                    : "Country"
                }
                countryCount={countryArray.length - 1}
                cityCount={cityArray.length - 1}
                refetch={refetch}
              />
              <ProfileNav
                handleSearchText={handleSearchText}
                page={page}
                searchBar={page === "settings" ? false : true}
                urlUsername={urlUsername}
              />
              <Route
                exact
                path={
                  urlUsername
                    ? `profiles/${urlUsername}/cities`
                    : "/profile/cities"
                }
                render={() => (
                  <ProfileCities
                    user={user}
                    cityData={cityData}
                    searchText={searchText}
                    handleSelectedCity={handleSelectedCity}
                  />
                )}
              />
              <Route
                exact
                path={
                  urlUsername
                    ? `profiles/${urlUsername}/cities/${selectedCity.city}`
                    : `/profile/cities/${selectedCity.city}`
                }
                render={props => (
                  <ProfileIndividualCity
                    {...props}
                    city={selectedCity}
                    searchText={searchText}
                    cityReviews={cityReviews}
                    refetch={refetch}
                  />
                )}
              />
              <Route
                path={
                  urlUsername
                    ? `/profiles/${urlUsername}/settings`
                    : "/profile/settings"
                }
                render={props => (
                  <Settings
                    urlUsername={urlUsername}
                    {...props}
                    handlePageRender={handlePageRender}
                    userData={userData}
                    handleUserDataChange={handleUserDataChange}
                  />
                )}
              />
            </div>
          </div>
        );
      }}
    </Query>
  );
}

Profile.propTypes = {
  user: PropTypes.object,
  urlUsername: PropTypes.string,
  refetch: PropTypes.func
};
