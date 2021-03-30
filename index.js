const axios = require('axios')
const haversine = require('haversine')
const { execFile } = require('child_process');
const yargs = require('yargs/yargs')
const fs = require('fs')

const argv = yargs(process.argv.slice(2))
    .usage('Usage example: -latlong 44.03031,-55.1100 -state CA --dist 20')
    .demandOption(['latlong', 'state' ])
    .argv

const latLong = argv.latlong.split(',')

// https://www.gps-coordinates.net/
const MY_LOCATION = {
    latitude: latLong[0],
    longitude: latLong[1],
    state: argv.state,
    distance: argv.dist || 20
}

// Features we've already seen. In-memory store.
let lastResults = []

const checkForSpots = async () => {
    const {data} = await axios.get(`https://www.vaccinespotter.org/api/v0/states/${MY_LOCATION.state}.json`)
    const features = data.features
    .map(feature => ({...feature, distance: haversine(MY_LOCATION, { latitude: feature.geometry.coordinates[1], longitude: feature.geometry.coordinates[0] }, {unit: 'mile'})}))
    .filter(feature => feature.distance < MY_LOCATION.distance)

    // Added location count in case you don't actually have locations near you
    const locationCount = features.length
    const apptAvail = features.filter(({properties}) => properties.appointments_available)

    console.clear()
    console.log(`Last check: ${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}`)
    console.log(`${locationCount} location(s) found within ${MY_LOCATION.distance} mile(s): ${apptAvail.length} appointment(s) available\n`)

    let newResults = []

    if (apptAvail.length) {
        apptAvail.forEach(({properties}) => {
            console.log(`• ${properties.provider_brand_name} in ${properties.city} / ${properties.name} ${properties.postal_code} / ${properties.url}`)
            newResults.push(properties.id)
        })

    } 

    if(apptAvail.length && newResults.join() !== lastResults.join()) {
        execFile(process.platform === 'darwin' ? 'afplay' : 'aplay', ['horn.wav'])
    } else {
        console.log(`\nNo location updates.`)
    }

    lastResults = newResults
    
    console.log(`\nChecking again in 10 seconds...`)
    setTimeout(checkForSpots, 10000)

}

checkForSpots()