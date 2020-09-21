//function to build url
function buildQueryURL() {

    var city = $("#citySearch").val().trim();
    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=b7d465b8cab0cdf75326fd792466206b";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log("---first call---");
        console.log(response);

        var long = response.city.coord.lon;
        var lat = response.city.coord.lat;
        var newUrl = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + long + "&exclude=minutely,hourly,current&appid=7b42feb763bef4c699958a88c3c3a5df"
        
        return newUrl;
  });
}
//function to create 5 day forecast cards
function appendCards(obj) {

    var appendCardsHere = $("#appendCardsHere");
    appendCardsHere.empty();
    //for each day make a new card and append to the document
    for (let i = 0; i < 4; i++) {
        var newCol = $("<div class='col'>");

        var newCard = $("<div class='card text-white bg-secondary mb-3' style='max-width: 18rem;'>");
        var cardBody = $("<div class='card-body'>");

        var date = $("<div class='card-header'>");
        var icon = $("<div class='card-title'>");
        var temp = $("<div class='card-text'>");
        var humid = $("<div class='card-text'>");

        //convert kelvin to celsius
        var parsedTemp = obj.daily[i].temp.day - 273.15;
        temp.text('Temperature:' + parsedTemp + '°C');
        date.text(obj.daily[i].dt_txt);
        icon.text(obj.daily[i].weather.icon);
        humid.text('Humidity' + obj.list[i].main.humidity + '%');

        cardBody.append(icon);
        cardBody.append(temp);
        cardBody.append(humid);

        newCard.append(date);
        newCard.append(cardBody);

        newCol.append(newCard);
        appendCardsHere.append(newCol);
    }
}

//pull the information for the main display
function jumboDisplay(obj) {
    var date = new Date();
    var parsedTemp = obj.daily[0].temp.day - 273.15;

    var header = $("#header");
    var tempDisp = $("#tempDisp");
    var humidDisp = $("#humidDisp");
    var windDisp = $("#windDisp");
    var uvDisp = $("#uvDisp");

    header.text(obj.timezone + ',' + date.toDateString() + '' + obj.daily[0].weather[0].icon);
    tempDisp.text('Temperature:' + parsedTemp + '°C');
    humidDisp.text('Humidity' + obj.daily[0].main.humidity + '%');
    windDisp.text('Windspeed:' + obj.daily[0].wind_speed);
    uvDisp.text('UV Index:' + obj.daily[0].uvi);

}

// function to append previous search history 
function appendCityButton() {
    var appendHere = $("#appendCityHere");
    var cityButton = $("<div class='d-inline-flex p-2 bd-highlight'id='cityButtonNew'>");
    
    var cityText = $("#citySearch").val().trim();

    cityButton.text = cityText;

    appendHere.append(cityButton);

}

//function for second ajax call
function callAjax(){
    var url = buildQueryURL();
    console.log("new url = " + url);

    $.ajax({
        url: url,
        method: "GET"
    }).then(function(response){
        console.log("---second call---");
        console.log(response);
        var finalObj = response;
        return finalObj;
    });
}

//event listener for search button
$("#searchButton").on("click", function (event) {
    event.preventDefault();

    appendCityButton();

    //save to local storage function

    var WeatherData = callAjax();
    
    appendCards(WeatherData);
    jumboDisplay(WeatherData);
});


//event listener for search history buttons
$("#cityButtonNew").on("click", function (event) {
    event.preventDefault();

    var WeatherData = callAjax();
    
    appendCards(WeatherData);
    jumboDisplay(WeatherData);
});


