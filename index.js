'use strict';

const placesURL = 'https://nominatim.openstreetmap.org/search?';

const weatherURL = 'https://api.aerisapi.com/forecasts/';

// format query string
function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
};

// display if no results or if none of the above is selected
function tryAgain() {
    $('#courses-list').empty();
    $('#courses-list').append(
        `<h3>Sorry we couldn't find a course from that search, please try again (maybe add more search values)</h3>`
    );
    $('#js-form').removeClass('hidden');
}

// what to do with json from places api request to display search results page
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
            `<label for="course${i}"><input type="radio" id="course${i}" name="course" value="${responseJson[i].display_name}" data-lon="${responseJson[i].lon}" data-lat="${responseJson[i].lat}">
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
    handleTimeSubmit();

     const dataObj = {
        latitude: latitude,
        longitude: longitude,
        date: date,
        time: time
    };
    console.log(dataObj);
    
    return dataObj; 
};

// how to handle select button on search results page
function handleCourseSelect() {
    $('#courses-list').off().on('click','.select',e => {
        let chosen = $('input:checked');
        console.log(chosen);
        
        let course = chosen.val();
        
        console.log(course);
        console.log(chosen[0].dataset.lon);

        if (course === 'none') {
            tryAgain();
        } else {
        $('#courses-list').empty();
        $('#courses-list').append(
            `<h3>${course}</h3>`
        )
        
        $('#courses-list').append(
            `<label for="date" id="date-label">
            At what date and time will you be playing?:</label>
            <input type="date" name="date" id="js-date" required />
            <input type="time" name="time" id="js-time" required />
            <input type="button" role="button" class="search-time" value="Enter tee time" />`
        );
        }
        const longitude = chosen[0].dataset.lon;
        const latitude = chosen[0].dataset.lat; 
        console.log('Course selected');
    })
   
}

// how to handle the enter tee time button
function handleTimeSubmit() {
    $('#courses-list').on('click','.search-time',e => {
        const date = $("#js-date").val();
        const time = $("#js-time").val();
        console.log("Time submitted");
    }); 
    
}

// make http requests to find weather for location and time
function findWeather(query) {
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
        .then(responseJson => displayCourses(responseJson))
        // display one that is chosen or return to search if none of the above
       /* .then(data => {
            console.log(data);
            const paramsWeather = {
                client_id: 'uMkXGJ4g2DJPLwihkeIr1',
                client_secret: 'S09d9zwEMNCOkIrptHixAvjwedBeZxKD5pRumKyG',
                from: *time entered*,
                to: +6hr,
                filter: 1hr
            };
        
            const weatherQueryString = formatQueryParams(paramsWeather);
            const forecastURL = weatherURL + *lon,lat* + weatherQueryString;
        
            console.log(forecastURL);

            return fetch(forecastURL)
        })
        .then(response => response.json()) 
        .then(responseJson => console.log(responseJson))*/
        // pass long and lat and time info to weather api from chosen location to retrieve weather info for that location
        // display weather info to final results page
} 

// what to do with find the course button
function watchForm() {
    console.log("How's it looking outside?");

    $('#js-form').on('click',".search", e => {
        $('.explain').addClass('hidden');
        
        const search = $('#js-search').val();
        
        findWeather(search);
    });
}

$(watchForm);

/*aeris = {
    Access_ID: uMkXGJ4g2DJPLwihkeIr1,
    Secret_Key: S09d9zwEMNCOkIrptHixAvjwedBeZxKD5pRumKyG
}*/