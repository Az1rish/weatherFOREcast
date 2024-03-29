'use strict';

const placesURL = 'https://nominatim.openstreetmap.org/search?';

const weatherURL = 'https://api.aerisapi.com/forecasts/';

let myLocation = [];

let course;

// format dates
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

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
        `<h3 class="text-center red">Sorry we couldn't find a course from that search, please try again (maybe add more search values)</h3>`
    );
    $('#js-form').removeClass('hidden');
}

// what to do with json from places api request to display search results page
function displayCourses(responseJson) {
   $('#courses-list').empty();
   $('#courses-list').addClass('left');

   if (responseJson.length === 0) {
       tryAgain();
   } else {
        $('#courses-list').append(
            `<h2 class="text-center">Search Results</h2>
            <p class="text-center">Please select the correct location</p>`
        );
   
   for (let i = 0; i < responseJson.length; i++) {
           $('#courses-list').append(
            `<label for="course${i}"><input type="radio" id="course${i}" name="course" value="${responseJson[i].display_name}" data-lon="${responseJson[i].lon}" data-lat="${responseJson[i].lat}">
            ${responseJson[i].display_name}</label>`
       );
}

    $('#courses-list').append(
        `<label for="none" class="block"><input type="radio" id="none" name="course" value="none" checked>
        None of the above</label>`
    );
    
    $('#courses-list').append(
        `<input type="button" value="Select" class="select btn btn-block btn-success">`
    );
    $('#js-form').addClass('hidden');
    };
   
    $('#results-courses').removeClass('hidden');

    handleCourseSelect();
};

// how to handle select button on search results page
function handleCourseSelect() {
    $('#courses-list').off().on('click','.select',e => {
        let chosen = $('input:checked');
        course = chosen.val();
        
        let now = formatDate(Date.now());
        let dateLimit = formatDate(Date.now() + 1296000000);

        if (course === 'none') {
            tryAgain();
        } else {
            course = course.substr(0, course.indexOf(','));
            
            $('#courses-list').empty();
            $('#courses-list').removeClass('left');
            $('#courses-list').append(
                `<h3>${course}</h3>`
            )
        
            $('#courses-list').append(
                `<label for="date" id="date-label">
                <p>At what date and time will you be playing?:</p>
                Notice: If the date you are looking for is not available, that means it is out of the range needed to get an accurate forecast. Please retry within 15 days prior to your tee time. Thanks!</label>
                <input type="date" name="date" id="js-date" min="${now}" max="${dateLimit}" value="${now}" />
                <input type="time" name="time" id="js-time" value="06:00" />
                <input type="submit" role="button" class="search-time btn btn-block btn-success" value="Enter tee time" />`
            )

            $("input").prop("required", true);
        }

        let lon = chosen[0].dataset.lon;
        let lat = chosen[0].dataset.lat; 
       
        myLocation = [];
        myLocation.push(lat,lon);
    })
    handleTimeSubmit();
}

// how to handle the enter tee time button
function handleTimeSubmit() {
    $('#courses-list').on('submit', e => {
        e.preventDefault();
        const date = $("#js-date").val();
        const time = $("#js-time").val();
    
        const when = date + " " + time;
    
        findWeather(when);
    });
}

// reusable fetch function
function goFetch(uri, options) {
    return fetch(uri, options)
      .then(response => {
          if (!response.ok) {
              const err = new Error(response.statusText);
              err.res = response;
              throw err;
          } else {
            $('#js-error-message').addClass('hidden');
              return response.json();
          }
      })
      .catch(err => {
          $('#js-error-message').removeClass('hidden');
          $('#js-error-message').text(`Something is wrong with the connection: ${err.message}`);
      });
};

// make first http request to nominatim.org api
async function findCourse(query) {
    
    const paramsCourse = {
        q: query + ' golf course',
        format: 'json',
        leisure: 'golf_course',
        limit: 50,
        class: 'leisure',
        type: 'golf_course'
    };
  

    const courseQueryString = formatQueryParams(paramsCourse);
    const myLocationURL = placesURL + courseQueryString;
    
    const someData = await goFetch(myLocationURL);
    await displayCourses(someData);
} 

// display results from aerisweather.com api response
function displayWeather(responseJson) {
    let inputDate = `${$("#js-date").val()}`;
    let inputTime = `${$("#js-time").val()}`;
    inputDate = inputDate.split('-');
    inputTime = inputTime.split(':');
    
    let inputArr = inputDate;
    for (let i=0; i < inputTime.length; i++) {
       inputArr.push(inputTime[i]);
    }
    let teeTime = new Date(inputArr[0],(inputArr[1]-1),inputArr[2],inputArr[3],inputArr[4]);

    let begin = teeTime.toString();
    begin = begin.substr(0, begin.indexOf('G'));
    
    $('#courses-list').empty();

    $('#courses-list').append(
        `<p>Your tee time is on ${begin} at ${course}</p>
        <p>The weather forecast for your game is as follows:</p>`
    )

    if (!responseJson.response[0]) {
        console.log('No results for responseJson.response[0]');
    }

    if (!responseJson.response[0].periods) {
        console.log('No results for responseJson.response[0].periods');
    }

    for (let i = 0; i < responseJson.response[0].periods.length; i++) {
        $('#js-weather').append(
            `<p class="bold">${responseJson.response[0].periods[i].validTime.substr(11,5)}</p>
            <li class="${[i]}>
                <p class="weather">${responseJson.response[0].periods[i].weather}</p>
                <p class="temp">${responseJson.response[0].periods[i].tempF} degrees Fahrenheit</p>
                <p class="wind">Wind blowing ${responseJson.response[0].periods[i].windDir} at ${responseJson.response[0].periods[i].windSpeedMPH}mph with gusts of ${responseJson.response[0].periods[i].windGustMPH}mph</p>
            </li>`
        )
    }    
    $('#js-weather').append(
        `<button type="button" class="restart btn btn-block btn-success">Try another search</button>`
    )  
    searchAgain();  
}

// function to try another search
function searchAgain() {
    $('#js-weather').on('click','.restart', function (event) {
        location.reload();
    });
}

// make http request to aerisweather.com api
async function findWeather(when) {

    const paramsWeather = {
        client_id: 'uMkXGJ4g2DJPLwihkeIr1',
        client_secret: 'S09d9zwEMNCOkIrptHixAvjwedBeZxKD5pRumKyG',
        filter: '1hr',
        from: when,
        to: '+5hr'
    };

    const weatherQueryString = formatQueryParams(paramsWeather);
    const forecastURL = weatherURL + `${myLocation[0]}` + ',' + `${myLocation[1]}` + '?' + weatherQueryString;

    const moreData = await goFetch(forecastURL);
    await displayWeather(moreData);
}


// what to do with find the course button
function watchForm() {
    $('#js-form').on('submit', e => {
        e.preventDefault();
        $('.explain').addClass('hidden');
        
        const search = $('#js-search').val();
        
        findCourse(search);
    });
}

$(watchForm);

