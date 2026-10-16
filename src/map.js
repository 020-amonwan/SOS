import L from 'leaflet';

let map = null;
let marker = null;

export function initMap(containerId, initialLat = 13.7563, initialLng = 100.5018, onPinMove) {
  if (map) return map;

  const container = document.getElementById(containerId);
  if (!container) return null;
  container.classList.remove('hidden');

  map = L.map(containerId, {
    center: [initialLat, initialLng],
    zoom: 15,
    zoomControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  const customIcon = L.divIcon({
    className: 'custom-pin',
    html: `<div style="background-color:#DC2626; width:20px; height:20px; border-radius:50%; border:3px solid #FFF; box-shadow:0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  marker = L.marker([initialLat, initialLng], {
    draggable: true,
    icon: customIcon
  }).addTo(map);

  marker.on('dragend', (e) => {
    const coords = e.target.getLatLng();
    if (onPinMove) onPinMove(coords.lat, coords.lng);
  });

  return map;
}

export function updateMapLocation(lat, lng) {
  if (!map || !marker) return;
  const newLatLng = new L.LatLng(lat, lng);
  marker.setLatLng(newLatLng);
  map.panTo(newLatLng);
}
