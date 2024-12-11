// Inisialisasi Peta
var map = L.map("map").setView([-2.0833, 115.3667], 10);

// Layer Map (Peta Jalan)
var mapLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
    maxZoom: 19,
  }
);

// Layer Satellite (Google Satellite)
var satelliteLayer = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
  {
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "&copy; Google Maps",
    maxZoom: 20,
  }
);

// Layer Hybrid (Google Satellite dengan Label)
var hybridLayer = L.tileLayer(
  "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  {
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
    attribution: "&copy; Google Maps",
    maxZoom: 20,
  }
);

// Default Layer
mapLayer.addTo(map);

// Layer Labels (GeoJSON untuk wilayah)
var labelsLayer = L.geoJSON(null, {
  style: {
    color: "blue",
    weight: 1,
  },
});

// Inisialisasi Icon untuk Kategori
var icons = {
  Peternakan: L.icon({
    iconUrl: "images/peternakan-icon.png",
    iconSize: [40, 40], // Ukuran icon
    iconAnchor: [15, 30], // Posisi anchor
    popupAnchor: [0, -30], // Posisi popup relatif terhadap icon
  }),
  Perikanan: L.icon({
    iconUrl: "images/perikanan-icon.png",
    iconSize: [40, 40],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  Perkebunan: L.icon({
    iconUrl: "images/perkebunan-icon.png",
    iconSize: [40, 40],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  Kehutanan: L.icon({
    iconUrl: "images/kehutanan-icon.png",
    iconSize: [40, 40],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
  Perdagangan: L.icon({
    iconUrl: "images/perdagangan-icon.png",
    iconSize: [40, 40],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  }),
};

// Muat data wilayah (contoh GeoJSON)
fetch("data/labels.json")
  .then((response) => response.json())
  .then((data) => {
    labelsLayer.addData(data);
  });

// Muat file Shapefile dari URL
var shapefileUrl = "Kecamatan Tabalong.zip"; // Pastikan file ZIP ini ada
shp(shapefileUrl).then(function (geojson) {
  L.geoJSON(geojson, {
    style: function (feature) {
      return {
        color: "red",
        weight: 2,
        fillOpacity: 0,
      };
    },
    onEachFeature: function (feature, layer) {
      console.log(feature.properties); // Debugging
      layer.bindPopup(
        `<b>Kecamatan:</b> ${
          feature.properties.KECAMATAN || "Tidak tersedia"
        }<br>
          <b>Kabupaten:</b> ${feature.properties.KABUPATEN || "Tidak tersedia"}`
      );
    },
  }).addTo(map);
});

// Inisialisasi Layer Kategori
var categoryLayers = {
  Peternakan: L.layerGroup(),
  Perikanan: L.layerGroup(),
  Perkebunan: L.layerGroup(),
  Kehutanan: L.layerGroup(),
  Perdagangan: L.layerGroup(),
};

// Muat Data Marker
fetch("data/locations.json")
  .then((response) => response.json())
  .then((data) => {
    data.locations.forEach((location) => {
      if (!categoryLayers[location.category]) {
        categoryLayers[location.category] = L.layerGroup();
      }

      // Tambahkan marker dengan icon khusus
      var marker = L.marker(location.coords, {
        icon: icons[location.category], // Gunakan icon sesuai kategori
      }).bindPopup(`
        <h5>${location.name}</h5>
        <p><strong>Lokasi:</strong> ${location.additional_info}</p>
        <p><strong>Deskripsi:</strong> ${location.description}</p>
        <p><strong>Dinas Terkait:</strong> ${location.agency}</p>
        <img src="images/data/${location.image}" alt="${location.name}" width="100%">
      `);

      categoryLayers[location.category].addLayer(marker);
    });
  })
  .catch((error) => {
    console.error("Error loading location data:", error);
  });

// Fungsi Toggle Kategori
function toggleCategory(category, element) {
  if (map.hasLayer(categoryLayers[category])) {
    // Jika layer aktif, hapus dari peta
    map.removeLayer(categoryLayers[category]);
    element.classList.remove("active"); // Hapus highlight untuk kategori yang dinonaktifkan
  } else {
    // Tambahkan layer jika tidak kosong
    if (categoryLayers[category].getLayers().length > 0) {
      map.addLayer(categoryLayers[category]);
      element.classList.add("active"); // Tambahkan highlight untuk kategori yang diaktifkan
    } else {
      alert(`Kategori ${category} tidak memiliki data atau marker.`);
    }
  }
}

// Fungsi Highlight Tombol
function highlightButton(element) {
  // Hapus highlight dari semua tombol
  const buttons = document.querySelectorAll(".btn-category");
  buttons.forEach((btn) => btn.classList.remove("active")); // Hapus kelas .active

  // Tambahkan highlight ke tombol yang diklik
  element?.classList.add("active");
}

// Fungsi Reset Marker
function resetMarkers() {
  Object.values(categoryLayers).forEach((layer) => {
    if (map.hasLayer(layer)) {
      map.removeLayer(layer);
    }
  });

  // Hapus highlight dari semua tombol
  const buttons = document.querySelectorAll(".btn-category");
  buttons.forEach((btn) => btn.classList.remove("active"));
}

// Layer Control
var baseMaps = {
  Map: mapLayer,
  Satellite: satelliteLayer,
  Hybrid: hybridLayer,
};

var overlayMaps = {
  Labels: labelsLayer,
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
