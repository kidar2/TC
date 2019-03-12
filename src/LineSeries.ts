import YAxis from "./YAxis";
import {createSVGNode, removeNode} from "./Util";

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

	public update(areaHeight: number, areaWidth: number, yAxis: YAxis, marginLeft: number = 0)
	{
		if (this.nodes)
			this.nodes.forEach(n => removeNode(n));

		this.nodes = [];
		let points = "",
			 x = marginLeft,
			 topValue = yAxis.getTopValue(),
			 stepX = areaWidth / (this.config.data.length - 1);

		for (let i = 1; i < this.config.data.length; i++)
		{
			let value = this.config.data[i] as number;
			if (value != null)
			{
				if (points)
					points += ', ';
				let perc = value / topValue,
					 y = areaHeight - perc * areaHeight;

				points += x + " " + y;
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
			x += stepX;
		}

		if (points)
			this.nodes.push(createSVGNode("polyline", this.parentNode, {
				points,
				fill: "transparent",
				stroke: this.config.color
			}));
	}
}