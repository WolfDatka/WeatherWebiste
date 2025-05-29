var clientLocation;

document.addEventListener("DOMContentLoaded", () => {
    clientLocation = localStorage.getItem("clientLocation");
    if (!clientLocation) {
        window.location.pathname = "/html/en/locationSelector.html"
    }
});
