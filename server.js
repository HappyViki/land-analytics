const {
	getLandData
} = require('./scraper.js');

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
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

app.listen(PORT, () => {
	console.log(`server listening on port ${PORT}`)
})
