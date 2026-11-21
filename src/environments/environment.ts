export const environment = {
  production: false,
  api: {
    // Posiciones en vivo (principal y respaldo) y datos de rutas/aeronaves.
    adsbfi: 'https://opendata.adsb.fi/api/v3',
    adsbLol: 'https://api.adsb.lol/v2',
    adsbdb: 'https://api.adsbdb.com/v0',
  },
  // En el navegador se usa el proxy de desarrollo (proxy.conf.json) por CORS.
  proxy: {
    adsbfi: '/adsbfi/api/v3',
    adsbLol: '/adsb/v2',
    adsbdb: '/adsbdb/v0',
  },
};
