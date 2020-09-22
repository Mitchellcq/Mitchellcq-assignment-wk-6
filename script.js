var cities = [];

init();

//function to initialise page with local storage data if it exists
function init() {
    var mainDisplay = $("#mainDisplay");
    var header = $("<h1 class='display-4'>");
    header.text("Enter a city and press search!");
    mainDisplay.append(header);

    var retrievedObject = JSON.parse(localStorage.getItem('cities'));
    if (retrievedObject !== null) {
        cities = retrievedObject;
    }
    renderCitiesFromLocal();
}

//function to render city buttons from local storage
function renderCitiesFromLocal() {
    for (var i = 0; i < cities.length; i++) {
        var cityName = cities[i];
        renderCities(cityName);
    }
}

//function to render cities
function renderCities(string) {
    var li = $("<li>");
    var cityButton = $("<button type='button' class='btn btn-outline-info btn-lge cityButtonNew'>");
    var Capitalised = capitalizeFirstLetter(string);

    cityButton.text(Capitalised);
    li.append(cityButton);
    $("#appendCityHere").prepend(li);
};

//function to build the weather object with ajax based on user input
function buildObject(string) {

    var city = string;
    var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=b7d465b8cab0cdf75326fd792466206b";
    //first ajax call
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log("---first call---");
        console.log(response);

        var long = response.city.coord.lon;
        var lat = response.city.coord.lat;
        var newUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&exclude=minutely,hourly,current&appid=b7d465b8cab0cdf75326fd792466206b";
        //second ajax call
        $.ajax({
            url: newUrl,
            method: "GET"
        }).then(function (response2) {
            console.log("---second call---");
            console.log(response2);

            appendCards(response2);
            jumboDisplay(response2);

        });
    });
}
//function to create 5 day forecast cards
function appendCards(obj) {

    var appendCardsHere = $("#appendCardsHere");
    appendCardsHere.empty();
    //for each day make a new card and append to the document
    for (let i = 0; i < 5; i++) {
        var newCol = $("<div class='col'>");

        var newCard = $("<div class='card text-white bg-primary mb-3 d-inline-flex' style='max-width: 18rem;'>");
        var cardBody = $("<div class='card-body'>");

        var dateDisp = $("<div class='card-header'>");
        var icon = $("<img id='wicon' alt='Weather icon'>");
        var iconcode = obj.daily[i].weather[0].icon;
        var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
        var temp = $("<div class='card-text'>");
        var humid = $("<div class='card-text'>");
        var date = parseDate(obj.daily[i].dt).toDateString()

        //convert kelvin to celsius
        var parsedTemp = obj.daily[i].temp.day - 273.15;
        var roundedTemp = round(parsedTemp, 1);

        //display data on cards
        temp.html('Temperature: ' + '<strong>' + roundedTemp + '</strong>' + '°C');
        dateDisp.text(date);
        icon.attr("src", iconurl);
        humid.html('Humidity: ' + '<strong>' + obj.daily[i].humidity + '</strong>' + '%');

        cardBody.append(icon);
        cardBody.append(temp);
        cardBody.append(humid);
        cardBody.prepend(date);

        newCard.append(cardBody);

        newCol.append(newCard);
        appendCardsHere.append(newCol);
    }
}

//pull the information for the main display
function jumboDisplay(obj) {
    $("#mainDisplay").empty();
    var date = parseDate(obj.daily[0].dt);
    var parsedTemp = obj.daily[0].temp.day - 273.15;
    var roundedTemp = round(parsedTemp, 1);

    var mainDisplay = $("#mainDisplay");

    var header = $("<h1 class='display-4'>");
    var tempDisp = $("<p>");
    var humidDisp = $("<p>");
    var windDisp = $("<p>");
    var uvDisp = $("<p role='alert'>");
    var iconcode = obj.daily[0].weather[0].icon;
    var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
    var icon = $("<img id='wiconMain' alt='Weather icon'>");
    icon.attr("src", iconurl);

    header.text(obj.timezone + ',' + date.toDateString());
    tempDisp.html('Temperature: ' + '<strong>' + roundedTemp + '</strong>' + '°C');
    humidDisp.html('Humidity: ' + '<strong>' + obj.daily[0].humidity + '</strong>' + '%');
    windDisp.html('Windspeed: ' + '<strong>' + obj.daily[0].wind_speed + '</strong>');
    uvDisp.html('UV Index: ' + '<strong>' + obj.daily[0].uvi + '</strong>');

    //set colour of uv index
    if (obj.daily[0].uvi < 3) {
        uvDisp.attr("class", "alert alert-success d-inline-flex");
    } else if (obj.daily[0].uvi > 3 && obj.daily[0].uvi < 6) {
        uvDisp.attr("class", "alert alert-warning d-inline-flex");
    } else {
        uvDisp.attr("class", "alert alert-danger d-inline-flex");
    }

    mainDisplay.append(header);
    mainDisplay.append(icon);
    mainDisplay.append(tempDisp);
    mainDisplay.append(humidDisp);
    mainDisplay.append(windDisp);
    mainDisplay.append(uvDisp);
}

// function to save data to local storage
function saveLocalData() {
    localStorage.setItem("cities", JSON.stringify(cities));
}

//function to capitalise the first letter of the city input when saving to local storage
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//function to round temperaturse to 1 decimal place
function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

//function to parse date
function parseDate(integer) {
    var parsedDate = new Date(integer * 1000);
    return parsedDate;
}

//event listener for search button
$("#searchButton").on("click", function (event) {
    event.preventDefault();

    var userInput = $("#citySearch").val().trim();
    if (userInput === "") {
        return;
    }

    let duplicateExists = false
    for (i = 0; i < cities.length; i++) {
        if (userInput == cities[i]) {
            duplicateExists = true
            break
        }
    }
    if (!duplicateExists) cities.push(userInput), renderCities(userInput);

    userInput.value = "";

    saveLocalData();
    buildObject(userInput);

    console.log(localStorage);

    //save to local storage function
});

//event listener for search history buttons
$("#appendCityHere").on("click", function (event) {
    event.preventDefault();

    var target = $(event.target);
    if (target.is("button")) {

        var userInput = target.text();
        buildObject(userInput);
    }
});

//event listener for clear button
$("#clear").on("click", function () {
    localStorage.clear();
    console.log(localStorage);
    $("#appendCityHere").empty();
    $("#appendCardsHere").empty();
    $("#mainDisplay").empty();

    init();
});
