var map;
var marker;
var currentlySelectedPos;

function OnMapClick(clickEvent) {
    if (marker) {
        map.removeLayer(marker);
    }

    marker = L.marker(clickEvent.latlng).addTo(map);
    map.setView(clickEvent.latlng, 10);
    currentlySelectedPos = clickEvent.latlng;
}

function SelectLocation() {
    if (currentlySelectedPos) {
        localStorage.setItem("clientLocation", JSON.stringify(currentlySelectedPos));
        window.location.pathname = "/html/en/index.html"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    currentlySelectedPos = JSON.parse(localStorage.getItem("clientLocation"));

    map = L.map("map").setView(currentlySelectedPos ? currentlySelectedPos : [46.253, 20.151], 3);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 15,
        attribution: "&copy; <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a>"
    }).addTo(map);


    map.on("click", OnMapClick);
});
