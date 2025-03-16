const socket = io();

// Generate a unique ID for each tab using sessionStorage
const tabId = sessionStorage.getItem("tabId") || Math.random().toString(36).substr(2, 9);
sessionStorage.setItem("tabId", tabId);

const map = L.map("map").setView([0, 0], 16);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);

const markers = {};

// Function to update user's location
function updateLocation(position) {
    const { latitude, longitude } = position.coords;
    socket.emit("send-location", { id: tabId, latitude, longitude });

    // Update the user's own marker on refresh or movement
    if (markers[tabId]) {
        markers[tabId].setLatLng([latitude, longitude]);
    } else {
        markers[tabId] = L.marker([latitude, longitude]).addTo(map);
    }

    // Center the map on the user's location
    map.setView([latitude, longitude], 16);
}

// Get user location on page load and update it
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        updateLocation,
        (error) => console.error(error),
        { enableHighAccuracy: true }
    );

    navigator.geolocation.watchPosition(
        updateLocation,
        (error) => console.error(error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
}

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
    }
});

// Handle tab closing and remove marker
window.addEventListener("beforeunload", () => {
    socket.emit("remove-marker", tabId);
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});
