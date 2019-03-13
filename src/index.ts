import './index.scss';
import Chart from "./Chart";
import {CHARTS_DATA} from "./ChartData";
import {CategoriesType} from "./XAxis";

function main()
{
	let w = Math.max(document.body.offsetWidth - 300, 300),
		 h = Math.max(document.body.offsetHeight - 300, 300);
	CHARTS_DATA.forEach(data =>
	{
		new Chart({
			data: data as any,
			parentNode: document.body,
			yAxis: {
				showGrid: true
			},
			xAxis: {
				type: CategoriesType.date
			},
			title: "Telegram data",
			width: w,
			height: h
		});
	});
}


main();