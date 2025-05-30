var clientLocation;
var weather;

async function FetchWeather(lat, lng) {
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&timezone=Europe%2FBerlin&forecast_days=16&hourly=temperature_2m%2Crain%2Csnowfall%2Csnow_depth%2Cshowers%2Cuv_index%2Cuv_index_clear_sky&forecast_hours=24&current=temperature_2m%2Cshowers%2Crain%2Csnowfall%2Cwind_speed_10m%2Cwind_direction_10m&daily=temperature_2m_max%2Ctemperature_2m_min%2Cuv_index_max%2Cuv_index_clear_sky_max`;

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

    FetchWeather(clientLocation.lat, clientLocation.lng).then((result) => {
        weather = result
    });
});
