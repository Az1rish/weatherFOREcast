'use strict';

const placesURL = '   https://nominatim.openstreetmap.org/search?';

// function to format query string
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
};

// make http requests to find weather for location and time
function findWeather(query, time) {
    const paramsCourse = {
        q: query,
        format: 'json',
        leisure: 'golf_course'
    };

    const courseQueryString = formatQueryParams(paramsCourse);
    const locationURL = placesURL + courseQueryString;

    console.log(locationURL);

    fetch(locationURL)
        .then(response => response.json())
        .then(responseJson => console.log(responseJson));
} 

function watchForm() {
    console.log("How's it looking outside?");

    $('form').submit(e => {
        e.preventDefault();
        const search = $('#js-search').val();
        const when = $('#js-date').val();
        findWeather(search, when);
    });
}

$(watchForm);