import YAxis from "./YAxis";
import {createSVGNode, removeNode} from "./Util";
import XAxis from "./XAxis";

interface ISeriesConfig {
	data: Array<string | number>;
	type: string;
	name: string;
	color: string;
}


export default class LineSeries {

	config: ISeriesConfig;
	parentNode: SVGElement;
	id: string;
	nodes: SVGElement[];


	public constructor(config: ISeriesConfig, parentNode: SVGElement)
	{
		this.config = config;
		this.parentNode = parentNode;
		this.id = config.data[0] as string;
	}

	public update(areaHeight: number, areaWidth: number, yAxis: YAxis, xAxis: XAxis)
	{
		if (this.nodes)
			this.nodes.forEach(n => removeNode(n));

		this.nodes = [];
		let points = "",
			 topValue = yAxis.getTopValue();

		for (let i = 1; i < this.config.data.length; i++)
		{
			let value = this.config.data[i] as number;
			if (value != null)
			{
				if (points)
					points += ', ';
				let perc = value / topValue,
					 y = areaHeight - perc * areaHeight;

				points += xAxis.getXByIndex(i - 1) + " " + y;
			}
			else if (points)
			{
				this.nodes.push(createSVGNode("polyline", this.parentNode, {
					points,
					fill: "transparent",
					stroke: this.config.color
				}));
				points = "";
			}
		}

		if (points)
			this.nodes.push(createSVGNode("polyline", this.parentNode, {
				points,
				fill: "transparent",
				stroke: this.config.color
			}));
	}
}