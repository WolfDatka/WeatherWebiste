var map;
var userMarker;
var resultmarkers = [];
var currentlySelectedPos;
var locationInput;

function SearchForLocation(locationToSearchFor) {
    FetchLocation(locationToSearchFor).then((resultLocations) => {
        if (resultmarkers.length > 0) {
            resultmarkers.forEach(marker => {
                map.removeLayer(marker);
            })
        }

        let results = resultLocations.results;

        results.forEach(result => {
            resultmarkers.push(L.marker([result.latitude, result.longitude]).addTo(map).bindPopup(`${result.name}<br>(${result.latitude}, ${result.longitude})`).on("click", OnMapClick));
        });
    });
}

async function FetchLocation(locationToSearchFor) {
    const API_URL = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationToSearchFor)}&count=10&language=en&format=json`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        return data;
    }
    catch (err) {
        console.error("Error fetching location data: ", err);
    }

    return null;
}

function OnMapClick(clickEvent) {
    if (clickEvent.originalEvent.srcElement.id != "map") {
        map.setView(clickEvent.latlng, 9);
    }

    if (userMarker) {
        map.removeLayer(userMarker);
    }

    userMarker = L.marker(clickEvent.latlng).addTo(map);
    map.setView(clickEvent.latlng);
    currentlySelectedPos = clickEvent.latlng;
}

function SelectLocation() {
    let lastLocation = localStorage.getItem("clientLocation");
    if (!lastLocation) {
        if (currentlySelectedPos) {
            localStorage.setItem("clientLocation", JSON.stringify(currentlySelectedPos));
            window.location.pathname = "/html/en/index.html";
        }
    }
    else if(currentlySelectedPos == lastLocation) {
        window.location.pathname = "/html/en/index.html";
    }
    else {
        localStorage.removeItem("clientLocation");
        window.location.pathname = "/html/en/index.html";
    }
};

function GetLocationInput() {
    return locationInput.value;
}

document.addEventListener("DOMContentLoaded", () => {
    locationInput = document.getElementById("locationInput");
    currentlySelectedPos = JSON.parse(localStorage.getItem("clientLocation"));

    map = L.map("map").setView(currentlySelectedPos ? currentlySelectedPos : [46.253, 20.151], 3);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 15,
        attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
    }).addTo(map);


    map.on("click", OnMapClick);

    locationInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            SearchForLocation(GetLocationInput());
        }
    });
});
