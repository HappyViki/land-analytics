const getData = () => {
	const landData = JSON.parse(localStorage.getItem("landData") || '[]');

	const xAxis = "cost";
	const yAxis = "acres";

	return landData.map((set) => {

		const data = set.filter(item => {

			return !!item[xAxis] && !!item[yAxis]

		}).map(item => {

			return {
				...item,
				x: Number(item[xAxis].replace(/[^\d.-]+/g, '')),
				y: Number(item[yAxis].replace(/[^\d.-]+/g, ''))
			}

		});

		return {
			label: "Plot of Land",
			data
		}

	});
}

const createList = () => {
	const data = getData();

	document.querySelector("#list").innerHTML = `<ul class="list-group">${data.map(item=>`<li class="list-group-item">${item.data.length} ${item.label}</li>`).join('')}</ul>`;
}

const createChart = () => {


	const ctx = document.getElementById("chart");

	const datasets = getData();

	const config = {
		type: 'scatter',
		data: {
			datasets
		},
		options: {
			scales: {
				x: {
					type: 'linear',
					position: 'bottom'
				}
			},
			onClick: (evt) => {

				const points = evt.chart.getElementsAtEventForMode(evt, 'nearest', {
					intersect: true
				}, true);

				if (points.length) {

					const firstPoint = points[0];
					const value = evt.chart.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
					window.open(value.link)

				}
			},
			plugins: {
				zoom: {
					pan: {
						enabled: true
					},
					zoom: {
						wheel: {
							enabled: true
						}
					},
					limits: {
						x: {
							min: 'original',
							max: 'original'
						},
						y: {
							min: 'original',
							max: 'original'
						}
					}
				}
			}
		}
	};

	return new Chart(ctx, config);

}

const list = createList();
const chart = createChart();

const converter = (data) => {

	return data.map(({
		title,
		location,
		house,
		seller,
		company,
		link
	}) => {
		const titleThings = title?.match(/(.*) Acres • \$(.*)/);
		const acres = titleThings && titleThings[1];
		const cost = titleThings && titleThings[2];

		const houseThings = house?.match(/(.*) beds • (.*) baths • (.*) sqft/);
		const beds = houseThings && houseThings[1];
		const baths = houseThings && houseThings[2];
		const sqft = houseThings && houseThings[3];

		const locationThings = location?.split(',').map(x => x.trim());

		const address = locationThings && locationThings[0];
		const city = locationThings && locationThings[1];
		const state = locationThings && locationThings[2];
		const zip = locationThings && locationThings[3];
		const county = locationThings && locationThings[4];

		return {
			title,
			location,
			house,
			acres,
			cost,
			address,
			city,
			state,
			zip,
			county,
			beds,
			baths,
			sqft,
			seller,
			company,
			link
		};
	});
};

const fetchLandData = (link) => fetch('/getLandData', {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			link
		})
	})
	.then(response => response.json())
	.then(data => {

		loadingProgressMessage.innerText = data.error || "Data has been fetched!";

		if (!data.error) {
			let landData = JSON.parse(localStorage.getItem("landData") || '[]');
			landData.push(converter(data.landData));
				
			localStorage.setItem("landData", JSON.stringify(landData));
            chart.data.datasets = getData();
            chart.update();
			createList();
		}

	});

fetcherBtn.addEventListener("click", e => {

	loadingProgressMessage.innerText = "Fetching land data... please be patient... it may take up to a few minutes.";

	fetchLandData(linkInput.value);
})