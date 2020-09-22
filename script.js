//retrieve any data stored in local storage
$(document).ready(function () {

    let retrievedObject
    if (localStorage.getItem('city')) {
        retrievedObject = JSON.parse(localStorage.getItem('city'));
    } else {
        retrievedObject = [];
    }

    console.log(retrievedObject);
    for (var i = 0; i < retrievedObject.length; i++) {
        if (retrievedObject == null) { continue; }
        var li = $("<li>");
        var cityButton = $("<button type='button' class='btn btn-outline-info btn-lge cityButtonNew'>");
        var Capitalised = capitalizeFirstLetter(retrievedObject[i]);
        cityButton.text(Capitalised);

        li.append(cityButton);
        $("#appendCityHere").append(li);
    }

    //function to build the weather object with ajax based on user input
    function buildObject(string) {

        var city = string;
        var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=b7d465b8cab0cdf75326fd792466206b";
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
            temp.text('Temperature: ' + roundedTemp + '°C');
            dateDisp.text(date);
            icon.attr("src", iconurl);
            humid.text('Humidity: ' + obj.daily[i].humidity + '%');

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
        var date = parseDate(obj.daily[0].dt);
        var parsedTemp = obj.daily[0].temp.day - 273.15;
        var roundedTemp = round(parsedTemp, 1);

        var header = $("#header");
        var tempDisp = $("#tempDisp");
        var humidDisp = $("#humidDisp");
        var windDisp = $("#windDisp");
        var uvDisp = $("#uvDisp");
        var iconcode = obj.daily[0].weather[0].icon;
        var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";
        var icon = $("#wiconMain");
        icon.attr("src", iconurl);

        header.text(obj.timezone + ',' + date.toDateString());
        tempDisp.text('Temperature: ' + roundedTemp + '°C');
        humidDisp.text('Humidity: ' + obj.daily[0].humidity + '%');
        windDisp.text('Windspeed: ' + obj.daily[0].wind_speed);
        uvDisp.text('UV Index: ' + obj.daily[0].uvi);

        //set colour of uv index
        if (obj.daily[0].uvi < 3) {
            uvDisp.attr("class", "alert alert-success d-inline-flex");
        } else if (obj.daily[0].uvi > 3 && obj.daily[0].uvi < 6) {
            uvDisp.attr("class", "alert alert-warning d-inline-flex");
        } else {
            uvDisp.attr("class", "alert alert-danger d-inline-flex");
        }

    }

    // function to append previous search history 
    function prependCityButton() {
        var li = $("<li>");
        var cityButton = $("<button type='button' class='btn btn-outline-info btn-lge cityButtonNew'>");
        var cityText = $("#citySearch").val().trim();
        var Capitalised = capitalizeFirstLetter(cityText)

        cityButton.text(Capitalised);

        li.append(cityButton);
        $("#appendCityHere").append(li);

        saveLocalData();
    }

    // function to save data to local storage
    function saveLocalData() {
        var city = $("#citySearch").val();
        var cityObj = [];
        cityObj.push(city);
        localStorage.setItem("City", JSON.stringify(cityObj));
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
        prependCityButton();
        buildObject(userInput);

        console.log(localStorage);

        //save to local storage function
    });

    //event listener for search history buttons
    $("#appendCityHere").on("click", function (event) {
        event.preventDefault();

        var target = $(event.target);
        if (target.is("button")) {
            console.log(target);

            var userInput = target.text();
            buildObject(userInput);
        }
    });

    //event listener for clear button
    $("#clear").on("click", function () {
        localStorage.clear();
        console.log(localStorage);
        $("#appendCityHere").empty();
    });
});