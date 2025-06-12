var clientLocation;
var vw;
var weather;
const chartLegendProperties = {
    "temperature_2m_max": {
        "color": "#c90000",
        "display": {
            "en": "Temperature max"
        }
    },
    "temperature_2m_min": {
        "color": "#990000",
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

async function FillUIWithData_current() {
    const currentTempElement = document.getElementById("currentTemperature");
    currentTempElement.children[2].textContent = `${weather.current.temperature_2m}${weather.current_units.temperature_2m}`;
    if (weather.current.temperature_2m < 10) {
        currentTempElement.children[1].src = "/assets/icons/thermometers/thermometer-cold.svg";
    }
    else if (weather.current.temperature_2m > 25) {
        currentTempElement.children[1].src = "/assets/icons/thermometers/thermometer-hot.svg";
    }


    const currentPrecipitationElement = document.getElementById("currentPrecipitation");
    if (weather.current.rain > 0) {
        currentPrecipitationElement.children[1].src = "/assets/icons/umbrellas/umbrella-raining.svg";
        currentPrecipitationElement.children[2].textContent = `${weather.current.rain}${weather.current_units.rain}`;
    }
    else if (weather.current.showers > 0) {
        currentPrecipitationElement.children[1].src = "/assets/icons/umbrellas/umbrella-raining.svg";
        currentPrecipitationElement.children[2].textContent = `${weather.current.showers}${weather.current_units.showers}`;
    }
    else if (weather.current.showfall > 0) {
        currentPrecipitationElement.children[1].src = "/assets/icons/umbrellas/umbrella-snowing.svg";
        currentPrecipitationElement.children[2].textContent = `${weather.current.snowfall}${weather.current_units.snowfall}`;
    }
    else {
        currentPrecipitationElement.children[2].textContent = "No precipitation";
    }

    const currentWindElement = document.getElementById("currentWind");
    currentWindElement.children[2].innerHTML = weather.current.wind_speed_10m == 0 ? "Almost no wind" : `${weather.current.wind_speed_10m}${weather.current_units.wind_speed_10m}<br>${weather.current.wind_direction_10m}${weather.current_units.wind_direction_10m}`;
    RotateWindDir(weather.current.wind_direction_10m);
}

async function FillUIWithData_daily() {
    const cardsContainer = document.getElementsByClassName("dailyWeatherCard")[0].parentNode;
    for (let i = 0; i < weather.daily.time.length - 1; i++) {
        cardsContainer.appendChild(cardsContainer.firstElementChild.cloneNode(true));
    }

    const cards = document.getElementsByClassName("dailyWeatherCard");
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];

        /* Set date */ {
            const cardDate = new Date(weather.daily.time[i]);

            const fullDate = card.getElementsByClassName("fullDate");
            fullDate[0].textContent = cardDate.toLocaleDateString("en", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            });

            const maxTemp = card.getElementsByClassName("maxTemp");
            maxTemp[0].textContent = `${weather.daily.temperature_2m_max[i]}${weather.daily_units.temperature_2m_max}`;
            const maxTempTypeNode = document.createElement("sub");
            maxTempTypeNode.textContent = "max";
            maxTemp[0].appendChild(maxTempTypeNode);

            const minTemp = card.getElementsByClassName("minTemp");
            minTemp[0].textContent = `${weather.daily.temperature_2m_min[i]}${weather.daily_units.temperature_2m_min}`;
            const minTempTypeNode = document.createElement("sub");
            minTempTypeNode.textContent = "min";
            minTemp[0].appendChild(minTempTypeNode);
        }

        /* Set precipitation probability */ {
            card.getElementsByClassName("precipitation")[0].getElementsByTagName("span")[0].textContent = `${weather.daily.precipitation_probability_max[0]}%`;
        }

        /* Set UV index */ {
            card.getElementsByClassName("uvIndex")[0].getElementsByTagName("span")[0].textContent = `${weather.daily.uv_index_max[i]} UV`;
        }

        /* Set precipitation sum (rain, shower, snow) */ {
            const precipSumSpan = card.getElementsByClassName("precipSum")[0].getElementsByTagName("span")[0];
            if (weather.daily.rain_sum[i] > 0) {
                precipSumSpan.textContent = `${weather.daily.rain_sum[i]}${weather.daily_units.rain_sum}`;
            }
            else if (weather.daily.showers_sum[i] > 0) {
                precipSumSpan.textContent = `${weather.daily.showers_sum[i]}${weather.daily_units.showers_sum}`;
            }
            else if (weather.daily.snowfall_sum[i] > 0) {
                precipSumSpan.textContent = `${weather.daily.snowfall_sum[i]}${weather.daily_units.snowfall_sum}`;
            }
            else {
                precipSumSpan.textContent = "0 mm";
            }
        }
    }

    cards[0].firstElementChild.firstElementChild.textContent = "Today";
    cards[0].firstElementChild.firstElementChild.style.setProperty("font-weight", "900");
    cards[1].firstElementChild.firstElementChild.textContent = "Tomorrow";
    cards[1].firstElementChild.firstElementChild.style.setProperty("font-weight", "900");

    /*
    const todayElement = cards[0];
    const todayDateElement = document.createElement("p");
    todayDateElement.innerText = todayElement.firstElementChild.firstElementChild.textContent;
    todayElement.firstElementChild.firstElementChild.remove();
    const todayTextElement = document.createElement("h5");
    todayTextElement.innerText = "Today";
    todayTextElement.style.setProperty("font-size","clamp(1.7rem, 0.61vw + 1.505rem, 2.2rem)");
    todayElement.firstElementChild.appendChild(todayTextElement);
    todayElement.firstElementChild.appendChild(todayDateElement);

    const tomorrowElement = cards[1];
    const tomorrowDateElement = document.createElement("p");
    tomorrowDateElement.innerText = tomorrowElement.firstElementChild.firstElementChild.textContent;
    tomorrowElement.firstElementChild.firstElementChild.remove();
    const tomorrowTextElement = document.createElement("h5");
    tomorrowTextElement.innerText = "Tomorrow";
    tomorrowTextElement.style.setProperty("font-size","clamp(1.7rem, 0.61vw + 1.505rem, 2.2rem)");
    tomorrowElement.firstElementChild.appendChild(tomorrowTextElement);
    tomorrowElement.firstElementChild.appendChild(tomorrowDateElement);
    */
}

function ChangeResponsiveIcons() {
    const icons = Array.from(document.getElementsByClassName("responsivePrecipitationIcons"));
    icons.forEach(element => {
        if (weather.current.rain > 0 || weather.current.showers > 0) {
            element.src = "/assets/icons/umbrellas/umbrella-raining.svg";
        }
        else if (weather.current.showfall > 0) {
            element.src = "/assets/icons/umbrellas/umbrella-snowing.svg";
        }
    });
}

async function FillUIWithData() {
    console.log(weather);
    FillUIWithData_current();
    FillUIWithData_daily();
}

function FetchDataAndFillUI() {
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
        FetchDataAndFillUI();
    }
    else {
        const currentTime = new Date();
        let lastRequestedTimeInMins = (parseInt(weather.current.time.split('T')[1].split(':')[0], 10) * 60) + parseInt(weather.current.time.split('T')[1].split(':')[1], 10);
        let timeInMins = (currentTime.getHours() * 60) + currentTime.getMinutes();
        let todayDate = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')}`;

        if (timeInMins - lastRequestedTimeInMins > 30 || weather.current.time.split("T")[0] != todayDate) { FetchDataAndFillUI(); }
    }

    setInterval(() => {
        const currentTime = new Date();
        let lastRequestedTimeInMins = (parseInt(weather.current.time.split('T')[1].split(':')[0], 10) * 60) + parseInt(weather.current.time.split('T')[1].split(':')[1], 10);
        let timeInMins = (currentTime.getHours() * 60) + currentTime.getMinutes();
        if (timeInMins - lastRequestedTimeInMins > 30) {
            FetchDataAndFillUI();
        }

    }, (3 * 60) * 1000);

    window.addEventListener("resize", () => {
        vw = window.innerWidth / 100;
    });

    FillUIWithData();
});
