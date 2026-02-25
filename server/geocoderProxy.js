/* eslint-disable no-console */
const express = require('express');
const axios = require('axios');

const router = express.Router();

const PHOTON_BASE = 'https://photon.komoot.io';

// Lithuania bounding box (minLon,minLat,maxLon,maxLat)
const LT_BBOX = '20.9,53.9,26.8,56.5';

// Photon type → Pelias layer
const PHOTON_TO_PELIAS = {
  house: 'address',
  street: 'street',
  locality: 'localadmin',
  district: 'neighbourhood',
  city: 'localadmin',
  county: 'county',
  state: 'region',
  country: 'country',
  other: 'venue',
};

// Pelias layer → Photon layer (for request translation)
const PELIAS_TO_PHOTON = {
  address: 'house',
  street: 'street',
  localadmin: ['locality', 'city'],
  neighbourhood: 'district',
  venue: 'other',
  county: 'county',
  region: 'state',
  country: 'country',
};

function buildLabel(p) {
  const parts = [];
  if (p.name) {
    parts.push(p.name);
  }
  if (p.street) {
    const streetPart = p.housenumber
      ? `${p.street} ${p.housenumber}`
      : p.street;
    if (streetPart !== p.name) {
      parts.push(streetPart);
    }
  }
  if (p.city && p.city !== p.name) {
    parts.push(p.city);
  }
  return parts.join(', ');
}

function translateLayers(peliasLayers) {
  if (!peliasLayers) {
    return [];
  }
  const photonLayers = [];
  peliasLayers.split(',').forEach(l => {
    const mapped = PELIAS_TO_PHOTON[l.trim()];
    if (Array.isArray(mapped)) {
      photonLayers.push(...mapped);
    } else if (mapped) {
      photonLayers.push(mapped);
    }
  });
  return photonLayers;
}

function transformFeatures(features, peliasLayers) {
  const allowedLayers = peliasLayers
    ? new Set(peliasLayers.split(',').map(l => l.trim()))
    : null;

  return features
    .filter(f => f.properties.countrycode === 'LT')
    .map(f => {
      const p = f.properties;
      const layer = PHOTON_TO_PELIAS[p.type] || 'venue';
      if (allowedLayers && !allowedLayers.has(layer)) {
        return null;
      }
      return {
        ...f,
        properties: {
          ...p,
          id: `${p.osm_type}${p.osm_id}`,
          gid: `openstreetmap:${layer}:${p.osm_type}${p.osm_id}`,
          layer,
          source: 'openstreetmap',
          label: buildLabel(p),
          localadmin: p.county || p.city || '',
        },
      };
    })
    .filter(Boolean);
}

router.get('/search', async (req, res) => {
  const { text, size = 10, layers } = req.query;
  const focusLat = req.query['focus.point.lat'];
  const focusLon = req.query['focus.point.lon'];

  if (!text || !text.trim()) {
    res.json({ type: 'FeatureCollection', features: [] });
    return;
  }

  const params = {
    q: text.trim(),
    limit: size,
    bbox: LT_BBOX,
  };
  // Photon only supports: default, de, en, fr — omit lang for Lithuanian
  if (focusLat) {
    params.lat = focusLat;
  }
  if (focusLon) {
    params.lon = focusLon;
  }

  // Translate Pelias layers to Photon layers
  const photonLayers = translateLayers(layers);

  const sp = new URLSearchParams(params);
  photonLayers.forEach(l => sp.append('layer', l));
  try {
    const response = await axios.get(`${PHOTON_BASE}/api?${sp.toString()}`, {
      timeout: 10000,
    });
    const features = transformFeatures(response.data.features || [], layers);
    res.json({ type: 'FeatureCollection', features });
  } catch (err) {
    console.error('Geocoder proxy error:', err.message);
    res.json({ type: 'FeatureCollection', features: [] });
  }
});

router.get('/reverse', async (req, res) => {
  const lat = req.query['point.lat'];
  const lon = req.query['point.lon'];

  if (!lat || !lon) {
    res.json({ type: 'FeatureCollection', features: [] });
    return;
  }

  try {
    const response = await axios.get(`${PHOTON_BASE}/reverse`, {
      params: { lat, lon, limit: 1 },
      timeout: 10000,
    });
    const features = transformFeatures(response.data.features || [], null);
    res.json({ type: 'FeatureCollection', features });
  } catch (err) {
    console.error('Reverse geocoder proxy error:', err.message);
    res.json({ type: 'FeatureCollection', features: [] });
  }
});

// Place lookup not supported
router.get('/place', (_req, res) => {
  res.json({ type: 'FeatureCollection', features: [] });
});

module.exports = router;
