import Chart from "./Chart";
import {CHARTS_DATA} from "./ChartData";

function main()
{
	new Chart({
		data: CHARTS_DATA[0] as any,
		parentNode: document.body,
		xAxis: {
			lineVisible: false
		},
		title: "Telegram data",
		width: Math.max(document.body.offsetWidth - 300, 300),
		height: Math.max(document.body.offsetHeight - 300, 300)
	});
}


main();