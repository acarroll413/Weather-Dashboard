let searchFormEl = document.querySelector("#searchForm");
let uvCheckEl = document.querySelector("#uvCheck");
let forcastCardsEl = document.querySelector("#forcastCards");
let savedCitiesEl = document.querySelector("#savedSearches");
let cityStoredData = [];

const fConversion = (K) => {
    
    let F = Math.round((((K-273.15)*1.8)+32)*10.0)/10.0;
    return F;
}

const uviCheck = (uvi) => {
    
    if (uvi > 0) {
        uvCheckEl.classList = '';
        uvCheckEl.classList = 'bg-success rounded-lg p-1';
    } 
    if (uvi > 2) {
        uvCheckEl.classList = '';
        uvCheckEl.classList = 'bg-warning rounded-lg p-1';
    }
    if (uvi > 7) {
        uvCheckEl.classList = '';
        uvCheckEl.classList = 'btn-danger rounded-lg p-1';
    }
}

const createForcastCards = (temp, humidity, date, icon) => {
    
    let forcastCard = document.createElement("div");
    forcastCard.classList = 'card p-2 bg-primary text-center';
    
    let forcastCardHeader = document.createElement("h6");
    forcastCardHeader.textContent = date.format("MM/DD/YYYY");
    forcastCard.appendChild(forcastCardHeader);
    
    let forcastCardIcon = document.createElement("img");
    forcastCardIcon.setAttribute("src", `http://openweathermap.org/img/wn/${icon}@2x.png`);
    forcastCardIcon.setAttribute("style", "width: 75px;");
    forcastCard.appendChild(forcastCardIcon);
    
    let forcastCardTemp = document.createElement("p");
    forcastCardTemp.textContent = `Temp: ${temp} °F`;
    forcastCard.appendChild(forcastCardTemp);
    
    let forcastCardHumidity = document.createElement("p");
    forcastCardHumidity.textContent = `Humid: ${humidity} %`;
    forcastCard.appendChild(forcastCardHumidity);
    forcastCardsEl.appendChild(forcastCard);
}

const cityForcastPopulate = (data) => {
   
    forcastCardsEl.textContent = '';
    
    let forcastDate = moment();
    for (let i = 1; i < 6; ++i) {
        forcastDate = forcastDate.add( 1, 'days');        
        let forcastTemp = fConversion(data.daily[i].temp.day);
        let forcastHumidity = data.daily[i].humidity;
        let forcastIcon = data.daily[i].weather[0].icon;
        
        createForcastCards(forcastTemp, forcastHumidity, forcastDate, forcastIcon);
    }
}

const cityWeatherPopulate = (data, cityName) => {
    
    let tempK = data.current.temp; 
    let tempF = fConversion(tempK)
    let humidity = data.current.humidity;
    let wind = data.current.wind_speed;
    let uvIndex = data.current.uvi;
    let windDeg = data.current.wind_deg;
    let icon = data.current.weather[0].icon;
    let currentDate = moment();
    
    
    let citySpan = document.querySelector("#city");
    let dateSpan = document.querySelector("#date");
    let tempSpan = document.querySelector("#temp");
    let humiditySpan = document.querySelector("#humidity");
    let windSpan = document.querySelector("#windSpeed");
    let windDirectionSpan = document.querySelector("#windDirection");
    windDirectionSpan.classList = `wi wi-wind towards-${windDeg}-deg`;
    let uviSpan = document.querySelector("#uvIndex");
    let cityWeatherIconImg = document.querySelector("#currentWeatherIcon");
    cityWeatherIconImg.setAttribute("src", `https://openweathermap.org/img/wn/${icon}@2x.png`);

    
    citySpan.textContent = cityName;
    dateSpan.textContent = currentDate.format(" (MM/DD/YYYY) ");
    tempSpan.textContent = tempF;
    humiditySpan.textContent = humidity;
    windSpan.textContent = wind;
    uviSpan.textContent = uvIndex;
    
    uviCheck(uvIndex);
}

const cityOneCallFetch = (cityLat, cityLon, cityName) => {
    let apiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&appid=43457cfab621bccace2506c23d4ef384`
    
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                return response.json();                
            } else {
                alert(`Error: ${response.statusText}`);
            }            
        })
        .then(function(response) {
            cityWeatherPopulate(response, cityName);
            cityForcastPopulate(response);
        })
}

const cityLatLonFetch = (city) => {
    city = city.replace("-", " ");
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?APPID=43457cfab621bccace2506c23d4ef384&q=${city}`
    
    fetch(apiUrl)
        .then(function(response) {
            if (response.ok) {
                return response.json().then(function(response) {
                    let cityLat = response.coord.lat;
                    let cityLon = response.coord.lon;
                    let cityName = response.name;
                    
                    cityOneCallFetch(cityLat, cityLon, cityName);
                   
                    saveCity(cityName);
                });
            } else {
                alert(`Error: ${response.statusText}`);        
            }
        })
}

const createCityButton = (city, cityNoSpace) => {
    let savedCityEl = document.createElement("button");
    savedCityEl.classList = "card p-2";
    savedCityEl.setAttribute("value", cityNoSpace);
    savedCityEl.textContent = city;
    savedCitiesEl.appendChild(savedCityEl);
}

const saveCity = (city) => {
    cityNoSpace = city.replace(" ", "-");
    if (!document.querySelector(`button[value=${cityNoSpace}`)) {
        
        if (!cityStoredData) {
            cityStoredData = [{city}];
        } else {
            cityStoredData.push({city});
        }
        localStorage.setItem("cities", JSON.stringify(cityStoredData));
        createCityButton(city, cityNoSpace);
    } else {
        return;
    }
}

const collectUserCity = (event) => {
    
    event.preventDefault();
    
    if (!event.target[0].value) {
        alert("Input a city into the field!");
        return;
    };
    
    let cityInputEl = document.querySelector("#citySearch");
    let cityInput = cityInputEl.value
    
    cityInputEl.value = '';
    
    cityLatLonFetch(cityInput);
}

const populateFromButtons = (event) => {
    
    event.preventDefault();
    
    if(!event.target.value) {
        return;
    } else {
        cityLatLonFetch(event.target.value);
    }    
}

const loadData = () => {
    
    cityStoredData = JSON.parse(localStorage.getItem("cities"));
    
    if (!cityStoredData) {
        return;
    } else {
        for (let i = 0; i < cityStoredData.length; ++i) {
            cityNoSpace = cityStoredData[i].city.replace(" ", "-");
            createCityButton(cityStoredData[i].city, cityNoSpace);
        }
    }
}


loadData();

searchFormEl.addEventListener("submit", collectUserCity);

savedCitiesEl.addEventListener("click", populateFromButtons);