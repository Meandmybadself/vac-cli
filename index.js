const axios = require('axios')
const haversine = require('haversine')
const { execFile } = require('child_process');

// Change me - Minnetonka
// https://www.gps-coordinates.net/
const MY_LOCATION = {
    latitude: 44.9019313,
    longitude: -93.468875,
}

const checkForSpots = async () => {
    process.stdout.write('.')
    const {data} = await axios.get('https://www.vaccinespotter.org/api/v0/states/MN.json')
    const features = data.features
    .filter(({properties}) => properties.appointments_available)
    .map(feature => ({...feature, distance: haversine(MY_LOCATION, { latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] }, {unit: 'mile'})}))
    .filter(feature => feature.distance < 20)
    if (features.length) {
        execFile('afplay', ['horn.mp3'])
        console.log(JSON.stringify(features, null, 2))
    } else {
        setTimeout(checkForSpots, 10000)
    }
}

checkForSpots()