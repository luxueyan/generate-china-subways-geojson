const glob = require('glob')
const path = require('path')
const fs = require('fs')
const chalk = require('chalk')

const lines = glob.sync(path.join(process.cwd(), 'data/*-line.json'))
const stations = glob.sync(path.join(process.cwd(), 'data/*-station.json'))

console.log(`There are ${lines.length} line files and ${stations.length} station files`)
const chinaLine = {
	type: 'FeatureCollection',
	features: [],
}

const chinaStation = {
	type: 'FeatureCollection',
	features: [],
}

lines.forEach((l) => {
	const data = require(l)
	chinaLine.features.push(...data.features)
})

stations.forEach((l) => {
	const data = require(l)
	chinaStation.features.push(...data.features)
})

fs.writeFileSync(path.join(process.cwd(), 'data/china-line.json'), JSON.stringify(chinaLine))
fs.writeFileSync(path.join(process.cwd(), 'data/china-station.json'), JSON.stringify(chinaStation))

console.log(chalk.green('combine done!'))
