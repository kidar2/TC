import Chart from "./Chart";
import {CHARTS_DATA} from "./ChartData";
import {CategoriesType} from "./XAxis";

function main()
{
	new Chart({
		data: CHARTS_DATA[0] as any,
		parentNode: document.body,
		yAxis: {
			lineVisible: false
		},
		xAxis: {
			type: CategoriesType.date
		},
		title: "Telegram data",
		width: Math.max(document.body.offsetWidth - 300, 300),
		height: Math.max(document.body.offsetHeight - 300, 300)
	});
}


main();