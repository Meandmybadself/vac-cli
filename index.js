const axios = require('axios')
const haversine = require('haversine')
const { execFile } = require('child_process');
const open = require('open')

// Change me - Minnetonka
// https://www.gps-coordinates.net/
const MY_LOCATION = {
    latitude: 44.9019313,
    longitude: -93.468875,
}

// Features we've already seen. In-memory store.
const SEEN_FEATURES = []

const checkForSpots = async () => {
    process.stdout.write('.')
    const {data} = await axios.get('https://www.vaccinespotter.org/api/v0/states/MN.json')
    const features = data.features
    .filter(({properties}) => properties.appointments_available)
    .map(feature => ({...feature, distance: haversine(MY_LOCATION, { latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] }, {unit: 'mile'})}))
    .filter(feature => feature.distance < 80)
    .filter(feature => !SEEN_FEATURES.includes(feature.properties.id))
    if (features.length) {
        execFile(process.platform === 'darwin' ? 'afplay' : 'aplay', ['horn.wav'])
        console.log(`\nFound ${features.length} vaccine appointment(s) in:`)
        features.forEach(({properties}) => {
            open(properties.url)
            console.log(`• ${properties.provider_brand_name} in ${properties.city} / ${properties.name} ${properties.postal_code}`)
            SEEN_FEATURES.push(properties.id)
        })
        // console.log(JSON.stringify(features, null, 2))
    } else {
        setTimeout(checkForSpots, 10000)
    }
}

checkForSpots()