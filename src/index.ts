import Chart from "./Chart";
import {CHARTS_DATA} from "./ChartData";

function main()
{
	new Chart({
		Data: CHARTS_DATA[0] as any,
		ParentNode: document.body,
		XAxis: {
			LineVisible: false
		},
		Title: "Telegram data",
		Width: Math.max(document.body.offsetWidth - 300, 300),
		Height: Math.max(document.body.offsetHeight - 300, 300)
	});
}


main();