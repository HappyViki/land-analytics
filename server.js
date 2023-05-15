const fs = require('fs');
const https = require('https');
const {
	getLandData
} = require('./scraper.js');

const express = require('express');
const app = express();
const TEST_PORT = 3000;
const PORT = process.env.PORT || TEST_PORT;
let isScraping = false;

app.use(express.json());

app.all('/*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	next();
});

app.use(express.static(__dirname));

app.get('*', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

app.post('/getLandData', async function (req, res) {

	if (isScraping) {

		res.send({
			error: "currently scraping, please try again later"
		});
	} else {
		isScraping = true

		const landData = await getLandData(req.body.link);
		isScraping = false
		res.send({
			landData
		});
	}

})

if (PORT === TEST_PORT) {
	app.listen(PORT, () => {
		console.log(`HTTP server listening on port ${PORT}`)
	})
} else {
	const privateKey = fs.readFileSync(process.env.KEY, 'utf8');
	const certificate = fs.readFileSync(process.env.CERT, 'utf8');
	const credentials = {
		key: privateKey,
		cert: certificate
	};
	const httpsServer = https.createServer(credentials, app);

	httpsServer.listen(PORT, () => {
		console.log(`HTTPS server listening on port ${PORT}`)
	});
}