import getJson from '@digitransit-search-util/digitransit-search-util-get-json';

const axios = require('axios').default;

const DEFAULT_PELIAS_URL = 'https://api.digitransit.fi/geocoding/v1/search';

/**
 * Convert EPSG:3857 (Web Mercator) coordinates to WGS84 lon/lat.
 */
function webMercatorToWgs84(x, y) {
  const lon = (x / 20037508.34) * 180;
  let lat = (y / 20037508.34) * 180;
  lat =
    (180 / Math.PI) *
    (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return { lon, lat };
}

/**
 * Map visimarsrutai cls/type to a Pelias-compatible layer name.
 */
function mapLayer(cls, type) {
  if (cls === 'ADDRESS') {
    return 'address';
  }
  if (cls === 'STOP') {
    return 'stop';
  }
  if (type === 'CITY' || type === 'SETTLEMENT') {
    return 'localadmin';
  }
  if (type === 'STREET') {
    return 'street';
  }
  return 'venue';
}

/**
 * Transform a visimarsrutai geocoder response into Pelias GeoJSON features.
 */
function transformVisimarsrutaiResponse(data) {
  const docs = data && data.response && data.response.docs;
  if (!Array.isArray(docs)) {
    return [];
  }
  return docs.map(doc => {
    const { lon, lat } = webMercatorToWgs84(doc.x, doc.y);
    const layer = mapLayer(doc.cls, doc.type);
    const name = doc.name || '';
    const localadmin = doc.city || '';
    const label = localadmin ? `${name}, ${localadmin}` : name;

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat],
      },
      properties: {
        id: doc.id || `visimarsrutai:${name}`,
        gid: `visimarsrutai:${layer}:${doc.id || name}`,
        layer,
        source: 'visimarsrutai',
        name,
        label,
        localadmin,
        confidence: 1,
      },
    };
  });
}

/**
 * Fetch geocoding results from the visimarsrutai.lt API.
 * Uses axios directly to avoid URL-encoding commas in the skip parameter.
 */
function fetchVisimarsrutaiResults(baseUrl, text) {
  const url = `${baseUrl}?q=${encodeURIComponent(text)}&skip=stop,settlement`;
  return axios
    .get(url, {
      timeout: 10000,
      headers: { Accept: 'application/json' },
    })
    .then(res => transformVisimarsrutaiResponse(res.data));
}

/**
 * <DESCRIPTION>
 *
 * @name getGeocodingResults
 * @param {String} searchString
 * @param {String} searchParams (Optional) Parameters appended to url, basically box / polygon to restrict search area
 * @param {String} lang (Optional) search language
 * @param {Object} focusPoint (Optional) Own Position (PELIAS API)
 * @param {String} sources (Optional) search sources (e.g OSM, GTFS..)
 * @param {Object} minimalRegexp (Optional) Regexp for testing
 * @param {*} geocodingLayers (Optional) Array of strings that is used to determine which layers is searched, e.g. ['venue', 'address', 'stop']
 * @returns {String} Results in JSON form
 * @example
 * digitransit-search-util.getGeocodingResults("result");
 * //= e.g. {text:"result"}
 */
export default function getGeocodingResults(
  searchString,
  searchParams,
  lang,
  focusPoint,
  sources,
  peliasUrl,
  minimalRegexp,
  geocodingLayers,
) {
  const text = searchString ? searchString.trim() : null;
  if (
    text === undefined ||
    text === null ||
    text.length < 1 ||
    (minimalRegexp && !minimalRegexp.test(text))
  ) {
    return Promise.resolve([]);
  }
  const PELIAS_URL = peliasUrl || DEFAULT_PELIAS_URL;

  // Use visimarsrutai adapter when the URL points to visimarsrutai.lt
  if (PELIAS_URL.indexOf('visimarsrutai.lt') !== -1) {
    return fetchVisimarsrutaiResults(PELIAS_URL, text);
  }

  let opts = { text, ...searchParams, ...focusPoint, lang };
  if (sources) {
    opts = { ...opts, sources };
  }
  if (geocodingLayers) {
    const layers = geocodingLayers.toString();
    opts = { ...opts, layers };
  }
  return getJson(PELIAS_URL, opts).then(res => {
    return res.features;
  });
}
