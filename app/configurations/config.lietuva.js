const CONFIG = 'lietuva';
const APP_TITLE = 'Vintra | Lietuva';
const APP_DESCRIPTION = 'Digitransit-Lietuva';
const OTP_URL = process.env.OTP_URL || 'https://vintra.ciskauskas.lt/otp/';
const GEOCODING_BASE_URL = process.env.GEOCODING_BASE_URL || '/geocoder';

export default {
  CONFIG,
  title: APP_TITLE,
  OTPTimeout: process.env.OTP_TIMEOUT || 30000,

  feedIds: ['vintra'],

  URL: {
    OTP: OTP_URL,
    PELIAS: `${GEOCODING_BASE_URL}/search`,
    PELIAS_REVERSE_GEOCODER: `${GEOCODING_BASE_URL}/reverse`,
    PELIAS_PLACE: `${GEOCODING_BASE_URL}/place`,
  },

  hasAPISubscriptionQueryParameter: false,
  hasAPISubscriptionHeader: false,

  searchSources: ['oa', 'osm'],
  searchParams: {
    'boundary.country': 'LTU',
  },

  favicon: './app/configurations/images/default/default-favicon.png',
  textLogo: false,
  logo: 'lietuva/logo.png',
  meta: {
    description: APP_DESCRIPTION,
  },
  menu: {
    copyright: null,
    content: [
      {
        name: 'about-these-pages',
        route: '/tietoja-palvelusta',
      },
    ],
  },
  carBoardingModes: {
    FERRY: { showNotification: false },
  },
  transportModes: {
    citybike: {
      availableForSelection: false,
      default: false,
    },
    airplane: {
      availableForSelection: false,
      default: false,
    },
    walk: {
      availableForSelection: false,
      default: false,
    },
    car: {
      availableForSelection: true,
      default: false,
    },
  },
  suggestCarMinDistance: 0,
  showWeatherInformation: false,
  showDistanceBeforeDuration: true,
  hideItinerarySettings: true,
  showTransitLegDistance: true,
  showDistanceInItinerarySummary: false,
  hideWalkOption: true,
  alwaysShowDistanceInKm: true,
  defaultSettings: {
    accessibilityOption: false,
    optimize: 'GREENWAYS',
    bikeSpeed: 5.55,
    ticketTypes: 'none',
    walkBoardCost: 120,
    walkReluctance: 1.8,
    walkSpeed: 1.2,
    transferPenalty: 0,
    minTransferTime: 90,
    includeCarSuggestions: true,
    includeBikeSuggestions: false,
    includeParkAndRideSuggestions: false,
    showBikeAndParkItineraries: false,
    includeTaxiSuggestions: false,
  },
  mainMenu: {
    showDisruptions: false,
    stopMonitor: {
      show: false,
    },
    showEmbeddedSearch: false,
    countrySelection: [],
  },

  availableLanguages: ['lt', 'en'],
  defaultLanguage: 'lt',

  timeZone: 'Europe/Vilnius',

  socialMedia: {
    title: APP_TITLE,
    description: APP_DESCRIPTION,
    locale: 'lt_LT',
  },

  colors: {
    primary: '#1e0eac',
    tram: '#5E7921',
    rail: '#0c5183',
    ferry: '#3d8b85',
  },

  redirectReittiopasParams: true,

  map: {
    minZoom: 5,
    areaBounds: {
      corner1: [56.5, 26.9],
      corner2: [53.9, 20.9],
    },
  },

  defaultEndpoint: {
    address: 'Lietuva',
    lat: 55.17,
    lon: 23.95,
  },

  areaPolygon: [
    [20.9, 53.9],
    [20.9, 56.5],
    [26.9, 56.5],
    [26.9, 53.9],
    [20.9, 53.9],
  ],

  hideFavourites: true,
  hideStopRouteSearch: true,
  hideMapLayersByDefault: true,
  hideCarSuggestionDuration: true,
  hideWalkLegDurationSummary: true,
  emphasizeDistance: true,
  emphasizeOneWayJourney: true,

  terminalStopsMinZoom: 14,

  useRealtimeTravellerCapacities: false,

  aboutThisService: {
    lt: [
      {
        header: 'Apie paslaugą',
        paragraphs: [
          'Vintra yra viešojo transporto maršrutų planavimo paslauga Lietuvai. Paslauga apima autobusų, troleibusų, traukinių ir keltų maršrutus.',
          'Paslauga sukurta naudojant atvirojo kodo Digitransit platformą.',
        ],
      },
    ],

    en: [
      {
        header: 'About this service',
        paragraphs: [
          'Vintra is a public transit journey planning service for Lithuania. The service covers bus, trolleybus, rail, and ferry routes.',
          'The service is built on the open-source Digitransit platform.',
        ],
      },
    ],
  },

  includeCarSuggestions: true,
  useAssembledGeoJsonZones: 'isOnByDefault',
  locationSearchTargetsFromOTP: [],
  viaPointsEnabled: false,
};
