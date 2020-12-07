const axios = require('axios')
const subwayList = require('./subway-list')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const argv = require('minimist')(process.argv.slice(2))
const gcoord = require('gcoord')

const promiseArr = []
const totalLength = subwayList.length
let argSubwayList = []
let percent = 0
let index = 0

console.log(argv)
if (argv.c) {
	argSubwayList = argv.c.split(',')
	console.log('custom list', argSubwayList)
}
subwayList.map((v, i) => {
	if (argSubwayList.length && !argSubwayList.includes(v.city)) {
		index++
		percent = Math.min((index * 100) / totalLength, 100)
		return
	}

	const req = axios.get(`http://map.amap.com/service/subway`, {
		params: {
			_r: Math.random(),
			srhdata: `${v.code}_drw_${v.city}.json`,
		},
	})
	console.log(`${v.city} processing...`)

	req.then((res) => {
		const point = {
			type: 'FeatureCollection',
			features: [],
		}

		const line = {
			type: 'FeatureCollection',
			features: [],
		}
		index++
		percent = Math.min((index * 100) / totalLength, 100)

		if (!res.data || res.data.code === 'E0' || !res.data.l) {
			console.log(chalk.red(`${v.city} response err${res.data ? res.data.msg : ''}...${percent.toFixed(2)}%`))
			return
		}

		const stations = {}
		res = res.data.l
		res.forEach((g) => {
			const coords_g = []
			g.st.forEach((s) => {
				let coords = s.sl.split(',').map(Number)
				coords = gcoord.transform(coords, gcoord.GCJ02, gcoord.WGS84)
				coords_g.push(coords)
				if (!stations[s.poiid]) {
					stations[s.poiid] = true
					point.features.push({
						type: 'Feature',
						geometry: {
							type: 'Point',
							coordinates: coords,
						},
						properties: {
							pname: g.kn,
							pshort: g.ln,
							color: g.cl,
							ls: g.ls,
							name: s.n,
							en: s.sp,
						},
					})
				}
			})
			line.features.push({
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: coords_g,
				},
				properties: {
					name: g.kn,
					short: g.ln,
					color: g.cl,
					ls: g.ls,
				},
			})
		})

		fs.writeFileSync(path.join(process.cwd(), `data/${v.city}-station.json`), JSON.stringify(point))
		fs.writeFileSync(path.join(process.cwd(), `data/${v.city}-line.json`), JSON.stringify(line))
		console.log(`${v.city} done....${chalk.green(`${percent.toFixed(2)}%`)}`)
	})
	promiseArr.push(req)
})
