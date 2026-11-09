# Radar Vuelos

App móvil que muestra en un mapa los aviones que están volando en tiempo real.
Cada avión se puede tocar para ver su aerolínea, ruta, tipo de aeronave, altitud
y velocidad. También permite buscarlos, guardarlos en favoritos y avisar cuando
uno pasa cerca de tu ubicación.

Hecha con **Ionic + Angular** y empaquetada con **Capacitor**. Los datos salen de
**adsb.lol** (posiciones en vivo) y **adsbdb** (rutas y aerolíneas). Las requests
se hacen con **CapacitorHttp**, así que no necesita backend ni sufre problemas de
CORS en el celular. El mapa usa **Leaflet** con tiles de OpenStreetMap.

## Funcionalidades

- Mapa en vivo con aviones reales (posición, rumbo y altitud), refresco cada 10 s.
- Lista de vuelos cercanos ordenada por distancia, con buscador por callsign,
  matrícula o código hex.
- Detalle del vuelo con aerolínea, ruta (origen → destino) y tipo de avión.
- Favoritos guardados en el dispositivo.
- Aviso de "qué me sobrevuela" según tu ubicación.
- Modo oscuro y soporte offline con el último estado conocido.

## Stack

- Ionic 8 + Angular
- Capacitor 7 (`CapacitorHttp`, `Preferences`, `Geolocation`, `Haptics`)
- Leaflet + OpenStreetMap
- adsb.lol (datos en vivo) + adsbdb (rutas y aerolíneas)

## Requisitos

- Node.js 20+
- Ionic CLI (`npm install -g @ionic/cli`)
- Android Studio + JDK 21 (para compilar el APK)

## Cómo generar el proyecto

```bash
ionic start radar-vuelos tabs --type=angular --capacitor
cd radar-vuelos
npm i @capacitor/preferences @capacitor/geolocation @capacitor/haptics
npm i leaflet @types/leaflet
Habilitar CapacitorHttp en capacitor.config.ts:
plugins: {
  CapacitorHttp: { enabled: true }
}
Correr en el navegador
ionic serve
Compilar el APK
ionic build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
El APK queda en:
android/app/build/outputs/apk/debug/app-debug.apk
Instalarlo en el celular conectado por USB:
adb install -r app-debug.apk
Atribuciones
- Datos ADS-B: adsb.lol (https://adsb.lol) (ODbL 1.0)
- Rutas y aerolíneas: adsbdb (https://www.adsbdb.com)
- Mapa: OpenStreetMap (https://www.openstreetmap.org)
