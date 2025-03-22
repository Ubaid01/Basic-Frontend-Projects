document.addEventListener("DOMContentLoaded", () => {
    const getWeatherBtn = document.getElementById("get-weather-btn") ;
    const cityInput = document.getElementById("city-input") ;
    const weatherInfo = document.getElementById("weather-info") ;
    const errorMsg = document.getElementById("error-msg") ;
    const cityNameDisplay = document.getElementById("city") ;
    const temperatureDisplay = document.getElementById("temp") ;
    const descriptionDisplay = document.getElementById("description");
    const humidityDisplay = document.querySelector(".humidity-percent");
    const windSpeedDisplay = document.querySelector(".wind-speed");

    const API_KEY = "74b30bc27502ee384d52a9ff91d2d351" ; // env-variables.

    async function takeInput() {
        const city = cityInput.value.trim() ;
        cityInput.autocomplete = "off" ; // To prevent browser's auto-suggestion.
        // if( city === "" ) return ;
        if( !city ) return ;

        // It may throw an error ; Server / DB is always in another continent so mostly needed time to fetch.
        // JS alone is not capable of making webRequest. Either we need Node Environment OR Window Environment from browser. Earlier by XMLHttpRequest.
        try {
            const weatherData = await fetchWeatherData( city ) ; // So make the functions async() AND then use "await".
            displayWeatherData( weatherData ) ;
        }
        catch( error ) {
            console.log( error ) ;
            showError() ;
        }
        cityInput.value = "" ;
        cityInput.autocomplete = "on" ;
    }

    cityInput.addEventListener("keydown" , (event) => {
        if( event.key === "Enter" )
            takeInput() ;
    } ) ;

    getWeatherBtn.addEventListener("click", async () => {
        takeInput() ;
    } ) ;

    async function fetchWeatherData( city ) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}` ;
        const response = await fetch( url ) ;
        // console.log( typeof response ) ;
        // console.log( response ) ;
        if( !response.ok ) {
            // throw new Error(`Response status: ${response.status}`) ;
            throw new Error(`City not found`) ;
        }

        const data = await response.json() ; // Since it returns Promise so "await" OR Promise-chaining i.e. .then() & .catch()
        return data ;
    }

    function capitalizeFirstLetter(str) {
        return str.split(' ') // Split the string by spaces
        .map( word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() ) 
        .join(' '); // Join the array back into a string
    }

    function displayWeatherData( data ) {
        weatherInfo.classList.remove("hidden") ;
        errorMsg.classList.add("hidden") ;

        console.log( data ) ;
        const {name, main, weather, wind} = data ; // Destructuring
        cityNameDisplay.textContent = name ; // OR can do this like data.name AND below one like data.main.temp manually.So can check using JSON-Formatter.
        temperatureDisplay.innerHTML = `${Math.round(main.temp - 273.15)}&deg;c` ;
        humidityDisplay.textContent = `${main.humidity}%`;
        windSpeedDisplay.textContent = `${wind.speed} km/h`;

        descriptionDisplay.textContent = `Weather: ` + capitalizeFirstLetter( weather[0].description ) ;

        const weatherIcon = document.querySelector(".weather-icon"); // Set icon based on weather.
        weather[0].main = weather[0].main.toLowerCase() ; // It worked without lowerCasing on local() BUT NOT on git.
        // console.log( weather[0].main ) ;
        
        weatherIcon.src = `./imgs/${weather[0].main}.png` ;
        weatherIcon.alt = weather[0].description; // Alt text for accessibility.
    }

    function showError() {
        weatherInfo.classList.add("hidden") ;
        errorMsg.classList.remove("hidden") ;
    }
} ) ;