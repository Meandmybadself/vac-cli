## Overview
Polls Vaccine finder endpoints every 30 seconds.

## Requirements

* Node.js 14+

## Installation

1. Ensure volume is turned up.
2. Clone project `git clone https://github.com/Meandmybadself/vac-cli.git`
3. Install dependencies `npm i`
4. Get your latitude and longitude from https://www.gps-coordinates.net/
5. Run script `node index.js --latlong [your latitude],[your longitude] --state [your state abbreviation] --dist [distance to check in miles]`

Script will play a horn sound on macOS and Linux/BSD when a vaccine appointment is available.

