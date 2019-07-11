'use strict';

const placesURL = 'https://nominatim.openstreetmap.org/search?';

// function to format query string
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
};

function tryAgain() {
    $('#results-courses').append(
        `<h3>Sorry we couldn't find a course from that search, please try again (maybe add more search values)</h3>`
    );
}

function displayCourses(responseJson) {
   console.log(responseJson);
   $('#courses-list').empty();

   if (responseJson.length === 0) {
       tryAgain();
   } else {
        $('#courses-list').append(
            `<h2>Search Results</h2>`
        );
   
   for (let i = 0; i < responseJson.length; i++) {
           $('#courses-list').append(
            `<label for="course${i}"><input type="radio" id="course${i}" name="course" value="${responseJson[i].display_name}">
            ${responseJson[i].display_name}</label>`
       );
    };
    $('#courses-list').append(
        `<label for="none"><input type="radio" id="none" name="course" value="none" checked>
        None of the above</label>`
    );
    $('#courses-list').append(
        `<input type="button" value="Select" class="select">`
    );
    $('#js-form').addClass('hidden');
    };
   
   $('#results-courses').removeClass('hidden');
   handleCourseSelect();
};

function handleCourseSelect() {
    $('#courses-list').on('click','.select',e => {
        let chosen = $('input:checked');
        console.log(chosen);
        let course = chosen.val();
        console.log(course);
        if (course === 'none') {
            tryAgain();
        } else {
        $('#courses-list').empty();
        $('#courses-list').append(
            `<h3>${course}</h3>`
        )
        // need to change this to just append html and remove from index.html
        $('#courses-list').append(
            `<label for="date" id="date-label">
            On what day will you be playing?:</label>
            <input type="date" name="date" id="js-date" required />
            <input type="button" role="button" class="search-time" value="Enter time">`
        );
    }
    })
}

// make http requests to find weather for location and time
function findWeather(query, time) {
    const paramsCourse = {
        q: query + ' golf',
        format: 'json',
        leisure: 'golf_course'
    };

    const courseQueryString = formatQueryParams(paramsCourse);
    const locationURL = placesURL + courseQueryString;

    console.log(locationURL);

    fetch(locationURL)
        .then(response => response.json())
        // display all possible locations and let user choose one or none of the above
        .then(responseJson => displayCourses(responseJson));
        // display one that is chosen or return to search if none of the above

        // pass long and lat and time info to weather api from chosen location to retrieve weather info for that location
        // display weather info to final results page
} 

function watchForm() {
    console.log("How's it looking outside?");

    $('#js-form').on('click',".search", e => {
        // e.preventDefault();
        const search = $('#js-search').val();
        const when = $('#js-date').val();
        findWeather(search, when);
    });
}

$(watchForm);