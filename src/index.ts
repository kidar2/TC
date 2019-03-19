import './index.scss';
import Chart from "./Chart";
import {CHARTS_DATA} from "./ChartData";
import {CategoriesType} from "./Axis/XAxis";

function main()
{
	let w = Math.max(document.body.offsetWidth - 300, 300),
		 charts: Chart[] = [];

	CHARTS_DATA.forEach((data, index) =>
	{
		charts.push(new Chart({
			data: data as any,
			parentNode: document.body,
			yAxis: {
				showGrid: true
			},
			xAxis: {
				type: CategoriesType.date,
				showGrid: false
			},
			title: `Chart ${index + 1}`,
			width: w,
			height: 400
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
			charts.forEach(c => c.setSize(document.body.offsetWidth - 300, 400));
		}, 100);
	});
}


main();