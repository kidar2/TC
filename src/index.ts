import './index.scss';
import Chart from "./Chart";
import {CHARTS_DATA} from "./ChartData";
import {CategoriesType} from "./XAxis";

function main()
{
	let w = Math.max(document.body.offsetWidth - 300, 300),
		 h = Math.max(document.body.offsetHeight - 300, 300),
		 charts: Chart[] = [];

	CHARTS_DATA.forEach(data =>
	{
		charts.push(new Chart({
			data: data as any,
			parentNode: document.body,
			yAxis: {
				showGrid: true
			},
			xAxis: {
				type: CategoriesType.date,
				showGrid: true
			},
			title: "Telegram data",
			width: w,
			height: h
		}));
	});

	let id: any;
	window.addEventListener('resize', () =>
	{
		if (id)
			clearTimeout(id);

		id = setTimeout(() =>
		{
			id = null;
			charts.forEach(c => c.setSize(document.body.offsetWidth - 300, document.body.offsetHeight - 300));
		}, 100);
	});
}


main();