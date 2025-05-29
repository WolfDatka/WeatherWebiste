var clientLocation;

document.addEventListener("DOMContentLoaded", () => {
    clientLocation = localStorage.getItem("clientIRLLocation");
    if (!clientLocation) {
        window.location.pathname = "/"
    }
});
