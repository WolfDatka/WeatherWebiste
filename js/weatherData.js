var clientLocation;
var weather;

async function FetchWeather(lat, lng) {
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&daily=temperature_2m_max,temperature_2m_min,uv_index_max,weather_code&hourly=temperature_2m,rain,snowfall,snow_depth,showers,uv_index,cloud_cover&current=temperature_2m,showers,rain,snowfall,wind_speed_10m,wind_direction_10m,cloud_cover&timezone=auto&forecast_days=16&forecast_hours=24`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        return data;
    }
    catch (err) {
        console.error("Error fetching weather data: ", err);
    }

    return null;
}

document.addEventListener("DOMContentLoaded", () => {
    clientLocation = JSON.parse(localStorage.getItem("clientLocation"));

    weather = JSON.parse(localStorage.getItem("weatherData"));
    if (!weather) {
        FetchWeather(clientLocation.lat, clientLocation.lng).then((result) => {
            localStorage.setItem("weatherData", JSON.stringify(result));
        });
    }
    else {
        const currentTime = new Date();
        let lastRequestedTimeInMins = (parseInt(weather.current.time.split('T')[1].split(':')[0], 10) * 60) + parseInt(weather.current.time.split('T')[1].split(':')[1], 10);
        let timeInMins = (currentTime.getHours() * 60) + currentTime.getMinutes();

        if (timeInMins - lastRequestedTimeInMins > 30) {
            FetchWeather(clientLocation.lat, clientLocation.lng).then((result) => {
                localStorage.setItem("weatherData", JSON.stringify(result));
            });
        }
    }

    console.log(weather);
});
