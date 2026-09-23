import { SlideDeck } from './slidedeck.js';

const map = L.map('map', { scrollWheelZoom: false }).setView([21.316903, -157.858093], 11.5);

// ## The Base Tile Layer
const mapBoxStyle = 'mapbox/streets-v12';
const mapBoxKey = 'pk.eyJ1IjoidGF0YXIxOTAxIiwiYSI6ImNtdHVlOGxobjBqdjgzNG9pNWozd3Q1bTMifQ.KDlHQ6fNmwGfkW0ohUU_gA';

const baseLayer = L.tileLayer(
  `https://api.mapbox.com/styles/v1/${mapBoxStyle}/tiles/{z}/{x}/{y}{r}?access_token=${mapBoxKey}`,
  { 
    zoomOffset: -1, 
    tileSize: 512, 
    maxZoom: 16,
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
  }
).addTo(map);

// Set land cover colors and names
const landcoverColors = {
  // 1: Urban or Built-up Land (Red)
  11: '#cc0000', 12: '#cc0000', 13: '#cc0000', 14: '#cc0000', 15: '#cc0000', 16: '#cc0000', 17: '#cc0000',
  // 2: Agricultural Land (Yellow)
  21: '#e6e600', 22: '#e6e600', 23: '#e6e600', 24: '#e6e600',
  // 3: Rangeland (Tan/Khaki)
  31: '#d2b48c', 32: '#d2b48c', 33: '#d2b48c',
  // 4: Forest Land (Green)
  41: '#228b22', 42: '#228b22', 43: '#228b22',
  // 5: Water (Blue)
  51: '#1f78b4', 52: '#1f78b4', 53: '#1f78b4', 54: '#1f78b4',
  // 6: Wetland (Teal)
  61: '#008b8b', 62: '#008b8b',
  // 7: Barren Land (Gray)
  71: '#a9a9a9', 72: '#a9a9a9', 73: '#a9a9a9', 74: '#a9a9a9', 75: '#a9a9a9', 76: '#a9a9a9', 77: '#a9a9a9',
  // 8: Tundra (Powder Blue)
  81: '#b0e0e6', 82: '#b0e0e6', 83: '#b0e0e6', 84: '#b0e0e6', 85: '#b0e0e6',
  // 9: Perennial Snow (White)
  91: '#ffffff', 92: '#ffffff'
};
const landcoverNames = {
  11: 'Residential', 12: 'Commercial and Services', 13: 'Industrial', 14: 'Transportation, Communications and Utilities', 15: 'Industrial and Commercial Complexes', 16: 'Mixed Urban or Built-up Land', 17: 'Other Urban or Built-up Land',
  21: 'Cropland and Pasture', 22: 'Orchards, Groves, Vineyards, Nurseries and Horticultural', 23: 'Confined Feeding Operations', 24: 'Other Agricultural Land',
  31: 'Herbaceous Rangeland', 32: 'Shrub and Brush Rangeland', 33: 'Mixed Rangeland',
  41: 'Deciduous Forest Land', 42: 'Evergreen Forest Land', 43: 'Mixed Forest Land',
  51: 'Streams and Canals', 52: 'Lakes', 53: 'Reservoirs', 54: 'Bays and Estuaries',
  61: 'Forested Wetland', 62: 'Nonforested Wetland',
  71: 'Dry Salt Flats', 72: 'Beaches', 73: 'Sandy Areas Other than Beaches', 74: 'Bare Exposed Rock', 75: 'Strip Mines, Quarries, and Gravel Pits', 76: 'Transitional Areas', 77: 'Mixed Barren Land',
  81: 'Shrub and Brush Tundra', 82: 'Herbaceous Tundra', 83: 'Bare Ground', 84: 'Wet Tundra', 85: 'Mixed Tundra',
  91: 'Perennial Snowfields or Ice', 92: 'Glaciers'
};

function getLandcoverColor(id) {
  return landcoverColors[id]
}

// Set zoning colors and names
const zoningColors = {
  // Preservation/Agricultural/Country (Green)
  'P-1': '#228b22', 'P-2': '#228b22', 'AG-1': '#228b22', 'AG-2': '#228b22', 'Country': '#228b22',
  // Residential (Yellow)
  'R-20': '#ffd700', 'R-10': '#ffd700', 'R-7.5': '#ffd700', 'R-5': '#ffd700', 'R-3.5': '#ffd700',
  // Apartment (Orange)
  'A-1': '#ff8c00', 'A-2': '#ff8c00', 'A-3': '#ff8c00',
  // Apartment Mixed-Use/Resort (Magenta)
  'AMX-1': '#c71585', 'AMX-2': '#c71585', 'AMX-3': '#c71585', 'Resort': '#f99ad6',
  // Business/Business Mixed-Use (Red)
  'B-1': '#ea0f3b', 'B-2': '#ea0f3b', 'BMX-3': '#6b061b', 'BMX-4': '#6b061b',
  // Industrial, Industrial Commercial Mixed-Use (Blue)
  'I-1': '#6799ff', 'I-2': '#006d80', 'I-3': '#000280', 'IMX-1': '#09e5e9',
  // Federal and Military Preservation District (White)
  'F-1': '#f7f6f0'
};
const zoningNames = {
  'P-1': 'Preservation/Agricultural/Country', 'P-2': 'Preservation/Agricultural/Country','AG-1': 'Preservation/Agricultural/Country', 'AG-2': 'Preservation/Agricultural/Country','Country': 'Preservation/Agricultural/Country',
  'R-20': 'Residential', 'R-10': 'Residential', 'R-7.5': 'Residential', 'R-5': 'Residential', 'R-3.5': 'Residential',
  'A-1': 'Apartment', 'A-2': 'Apartment', 'A-3': 'Apartment',
  'AMX-1': 'Apartment Mixed-Use', 'AMX-2': 'Apartment Mixed-Use', 'AMX-3': 'Apartment Mixed-Use','Resort': 'Resort',
  'B-1': 'Business', 'B-2': 'Business', 'BMX-3': 'Business Mixed-Use', 'BMX-4': 'Business Mixed-Use',
  'I-1': 'Limited Industrial District', 
  'I-2': 'Intensive Industrial District', 
  'I-3': 'Waterfront Industrial District',
  'IMX-1': 'Industrial-Commercial Mixed-Use District',
  'F-1': 'Federal and Military'
};

function getZoningColor(id) {
  return zoningColors[id]
}

// ## Interface Elements
const container = document.querySelector('.slide-section');
const slides = document.querySelectorAll('.slide');

const slideOptions = {
  '2020_Census_Tracts': {
    filter: (feature) => {
      if (feature.properties.county) return feature.properties.county === "Honolulu"
      return false;
    },
    style: (feature) => {
      const pop = feature.properties.pop20;
      return {
        color: '#ffffff',
        weight: 1,
        fillColor: pop > 5000 ? '#cc0000' : '#476ba0',
        fillOpacity: 0.8,
      };
    },
    onEachFeature: (feature, layer) => {
      const tract = feature.properties.tractname;
      const pop = feature.properties.pop20;
      
      layer.bindTooltip(`
        <dl>
          <dt>Census Tract</dt>
          <dd>${tract}</dd>
          
          <dt>Population</dt>
          <dd>${Number(pop).toLocaleString()}</dd>
        </dl>
      `, { sticky: true, direction: 'auto' });
    },
  },
  
  'LULC': {
    style: (feature) => {
      return {
        color: '#ffffff',
        weight: 1,
        fillColor: getLandcoverColor(feature.properties.landcover), 
        fillOpacity: 0.8,
      };
    },
    onEachFeature: (feature, layer) => {
      const id = feature.properties.landcover;
      const name = landcoverNames[id];

      layer.bindTooltip(`
        <dl>
          <dt>Land Cover ID</dt>
          <dd>${id}</dd>
          
          <dt>Classification</dt>
          <dd>${name}</dd>
        </dl>
      `, { sticky: true, direction: 'auto' });
    },
  },

  'zoning': {
    style: (feature) => {
      return {
        color: '#ffffff',
        weight: 1,
        fillColor: getZoningColor(feature.properties.zone_class), 
        fillOpacity: 0.8,
      };
    },
    onEachFeature: (feature, layer) => {
      const id = feature.properties.zone_class;
      const name = zoningNames[id];

      layer.bindTooltip(`
        <dl>
          <dt>Land Cover ID</dt>
          <dd>${id}</dd>
          
          <dt>Classification</dt>
          <dd>${name}</dd>
        </dl>
      `, { sticky: true, direction: 'auto' });
    },
  },
};

// Store loaded erosion layers
const activeHazardLayers = {};

// Listen for checkbox toggles
document.querySelectorAll('#erosion-panel input[type="checkbox"]').forEach(checkbox => {
  checkbox.addEventListener('change', async (e) => {
    const scenarioId = e.target.value;
    
    if (e.target.checked) {
      if (!activeHazardLayers[scenarioId]) {
        const resp = await fetch(`data/${scenarioId}.geojson`);
        const data = await resp.json();
        
        activeHazardLayers[scenarioId] = L.geoJSON(data, {
          filter: (feature) => {
            if (feature.properties.island) return feature.properties.island === "Oahu";
            return false;
          },
          style: (feature) => {
            return {
              color: 'purple', 
              weight: 5,
              fillOpacity: 1
            };
          }
        });
      }
      activeHazardLayers[scenarioId].addTo(map);
      activeHazardLayers[scenarioId].bringToFront();
    } else {
      if (activeHazardLayers[scenarioId]) {
        map.removeLayer(activeHazardLayers[scenarioId]);
      }
    }
  });
});


// ## The SlideDeck object
const deck = new SlideDeck(container, slides, map, slideOptions);

document.addEventListener('scroll', () => deck.calcCurrentSlideIndex());

deck.preloadFeatureCollections();
deck.syncMapToCurrentSlide();
