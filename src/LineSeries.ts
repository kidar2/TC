import YAxis from "./YAxis";
import {createSVGNode, IHash, removeNode} from "./Util";
import XAxis, {ICategory} from "./XAxis";

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
	private hoverCircle: SVGElement;
	private indexToPoint: IHash<number>;


	public constructor(config: ISeriesConfig, parentNode: SVGElement)
	{
		this.config = config;
		this.parentNode = parentNode;
		this.id = config.data[0] as string;
		this.hoverCircle = createSVGNode("circle", null, {
			r: 4,
			fill: "white",
			stroke: this.config.color
		});
		this.hoverCircle.classList.add('chart__tooltip-obj');
	}

	public update(areaHeight: number, areaWidth: number, yAxis: YAxis, xAxis: XAxis)
	{
		if (this.nodes)
			this.nodes.forEach(n => removeNode(n));

		this.nodes = [];
		this.indexToPoint = {};
		let points = "",
			 topValue = yAxis.getTopValue();

		for (let i = 1; i < this.config.data.length; i++)
		{
			let value = this.config.data[i] as number;

			if (value != null)
			{
				if (points)
					points += ', ';

				let y = areaHeight - yAxis.calcHeightByValue(value, topValue);
				points += xAxis.getXByIndex(i - 1) + " " + y;

				this.indexToPoint[i] = y;
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

	showToolTipPoint(category: ICategory)
	{
		if (!this.hoverCircle.parentNode)
			this.parentNode.appendChild(this.hoverCircle);
		this.hoverCircle.setAttribute("cx", category.x + "");
		this.hoverCircle.setAttribute("cy", this.indexToPoint[category.index] + "");
	}

	hideToolTipPoint()
	{
		removeNode(this.hoverCircle);
	}
}