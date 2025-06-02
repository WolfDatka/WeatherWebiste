var clientLocation;
var weather;
const chartLegendProperties = {
    "temperature_2m_max": {
        "color": "#c90000",
        "display": {
            "en": "Temperature max"
        }
    },
    "temperature_2m_min": {
        "color": "#910000",
        "display": {
            "en": "Temperature min"
        }
    },
    "uv_index_max": {
        "color": "#5200a5",
        "display": {
            "en": "UV index max"
        }
    },
    "precipitation_probability_max": {
        "color": "#001bd1",
        "display": {
            "en": "Precipitation probability max"
        }
    },
    "snowfall_sum": {
        "color": "#ffffff",
        "display": {
            "en": "Snow sum"
        }
    },
    "rain_sum": {
        "color": "#0095d1",
        "display": {
            "en": "Rain sum"
        }
    },
    "showers_sum": {
        "color": "#0065d1",
        "display": {
            "en": "Showers sum"
        }
    },
    "precipitation_hours": {
        "color": "#00d10d",
        "display": {
            "en": "Precipitation hours"
        }
    }
};


async function FetchWeather(lat, lng) {
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&daily=temperature_2m_max,uv_index_max,precipitation_probability_max,precipitation_hours,snowfall_sum,showers_sum,rain_sum,temperature_2m_min&hourly=temperature_2m,rain,snowfall,snow_depth,showers,uv_index,cloud_cover,relative_humidity_2m&current=temperature_2m,showers,rain,snowfall,wind_speed_10m,wind_direction_10m,cloud_cover&timezone=auto&forecast_days=16&forecast_hours=24`

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

async function RotateWindDir(direction) {
    document.getElementById("arrow").style = `rotate: ${(direction - 180)}deg`;
}

async function FillUIWithData_current(weather) {
    console.log(weather);


    const currentTempElement = document.getElementById("currentTemperature");
    currentTempElement.children[2].innerHTML = `${weather.current.temperature_2m}${weather.current_units.temperature_2m}`;
    if (weather.current.temperature_2m < 10) {
        currentTempElement.children[1].src = "/assets/icons/thermometers/thermometer-cold.svg";
    }
    else if (weather.current.temperature_2m > 25) {
        currentTempElement.children[1].src = "/assets/icons/thermometers/thermometer-hot.svg";
    }


    const currentPrecipitationElement = document.getElementById("currentPrecipitation");
    if (weather.current.rain > 0) {
        currentPrecipitationElement.children[2].innerHTML = `${weather.current.rain}${weather.current_units.rain}`;
        currentPrecipitationElement.children[1].src = "/assets/icons/umbrellas/umbrella-raining.svg";
    }
    else if (weather.current.showers > 0) {
        currentPrecipitationElement.children[2].innerHTML = `${weather.current.showers}${weather.current_units.showers}`;
        currentPrecipitationElement.children[1].src = "/assets/icons/umbrellas/umbrella-raining.svg";
    }
    else if (weather.current.showfall > 0) {
        currentPrecipitationElement.children[2].innerHTML = `${weather.current.snowfall}${weather.current_units.snowfall}`;
        currentPrecipitationElement.children[1].src = "/assets/icons/umbrellas/umbrella-snowing.svg";
    }
    else {
        currentPrecipitationElement.children[2].innerHTML = "There's no precipitation";
    }


    const currentCloudElement = document.getElementById("currentCloud");
    currentCloudElement.children[2].innerHTML = weather.current.cloud_cover == 0 ? "Almost no cloud cover" : `${weather.current.cloud_cover}${weather.current_units.cloud_cover}`;
    if (weather.current.cloud_cover > 60) {
        currentCloudElement.children[1].src = "/assets/icons/cloudCoverage/veryCloudy.svg";
    }
    else if (weather.current.cloud_cover > 20) {
        currentCloudElement.children[1].src = "/assets/icons/cloudCoverage/cloudy.svg";
    }


    const currentWindElement = document.getElementById("currentWind");
    currentWindElement.children[2].innerHTML = weather.current.wind_speed_10m == 0 ? "Almost no wind" : `${weather.current.wind_speed_10m}${weather.current_units.wind_speed_10m}<br>${weather.current.wind_direction_10m}${weather.current_units.wind_direction_10m}`;
    RotateWindDir(weather.current.wind_direction_10m);
}

async function FillUIWithData_daily(weather) {
    const dailyReportChart = document.getElementById("dailyReportChart");
    const ctx = dailyReportChart.getContext("2d");

    const dailyReportChartContainer = document.createElement("div");
    dailyReportChartContainer.className = "chart";
    dailyReportChart.parentNode.replaceChild(dailyReportChartContainer, dailyReportChart);
    dailyReportChartContainer.appendChild(dailyReportChart);

    const chartLegend = document.createElement("div");
    chartLegend.className = "chartLegend";
    dailyReportChartContainer.appendChild(chartLegend);

    Object.entries(weather.daily).forEach(([key, val]) => {
        if (key != "time") {
            const colorLegendElement = document.createElement("div");
            chartLegend.appendChild(colorLegendElement);

            const colorLegendColorElement = document.createElement("span");
            colorLegendColorElement.style.setProperty("background-color", chartLegendProperties[key].color);
            colorLegendColorElement.style.setProperty("color", chartLegendProperties[key].color);
            colorLegendColorElement.append("‎");
            colorLegendElement.appendChild(colorLegendColorElement);

            const colorLegendNamedisplayElement = document.createElement("p");
            colorLegendNamedisplayElement.innerHTML = chartLegendProperties[key].display.en;
            colorLegendElement.appendChild(colorLegendNamedisplayElement);
        }
    });

    let max = 0;
    Object.entries(weather.daily).forEach(([key, vals]) => {
        if (key != "time" && key != "precipitation_hours") {
            let localMax = Math.max(...vals.flat());
            if (localMax > max) { max = localMax; }
        }
    });

    Object.entries(weather.daily).forEach(([key, vals]) => {
        let i = 0;
        if (key != "time" && key != "precipitation_hours") {
            ctx.beginPath();
            ctx.moveTo(5, vals[0] + 40);
            vals.forEach(val => {
                ctx.lineTo(5 + (i * 19.25), val + 40);
                i += 1;
            });

            ctx.strokeStyle = chartLegendProperties[key].color;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.closePath();

            i = 0
            vals.forEach(val => {
                ctx.lineTo(5 + (i * 19.25), val + 40);

                ctx.beginPath();
                ctx.arc(5 + (i * 19.25), val + 40, 1, 0, Math.PI * 2);
                ctx.fillStyle = chartLegendProperties[key].color;
                ctx.fill();
                ctx.closePath();
                i += 1;
            });
        }
    });
}

async function FillUIWithData(weather) {
    FillUIWithData_current(weather);
    FillUIWithData_daily(weather);
}

function FetchDataAndRefillUI() {
    FetchWeather(clientLocation.lat, clientLocation.lng).then((result) => {
        weather = result;
        localStorage.setItem("weatherData", JSON.stringify(weather));
        FillUIWithData(weather);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    clientLocation = JSON.parse(localStorage.getItem("clientLocation"));

    weather = JSON.parse(localStorage.getItem("weatherData"));
    if (!weather) {
        FetchWeather(clientLocation.lat, clientLocation.lng).then((result) => {
            weather = result;
            localStorage.setItem("weatherData", JSON.stringify(weather));
            FillUIWithData(weather);
        });
    }
    else {
        const currentTime = new Date();
        let lastRequestedTimeInMins = (parseInt(weather.current.time.split('T')[1].split(':')[0], 10) * 60) + parseInt(weather.current.time.split('T')[1].split(':')[1], 10);
        let timeInMins = (currentTime.getHours() * 60) + currentTime.getMinutes();

        if (timeInMins - lastRequestedTimeInMins > 30) {
            FetchWeather(clientLocation.lat, clientLocation.lng).then((result) => {
                weather = result;
                localStorage.setItem("weatherData", JSON.stringify(weather));
                FillUIWithData(weather);
            });
        }

        FillUIWithData(weather);
    }

    setInterval(FetchDataAndRefillUI, (31 * 60) * 1000);
});
