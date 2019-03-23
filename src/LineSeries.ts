import YAxis from "./Axis/YAxis";
import {createSVGNode, IHash, removeNode} from "./Util";
import XAxis, {ICategory} from "./Axis/XAxis";

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
	private readonly hoverCircle: SVGElement;
	private indexToPoint: IHash<number>;
	visible: boolean;
	averageValueOnVisiblePart: number;
	private nodesPoints: { x: number, y: number }[][];

	public constructor(config: ISeriesConfig, parentNode: SVGElement)
	{
		this.visible = true;
		this.config = config;
		this.parentNode = parentNode;
		this.id = config.data[0] as string;
		config.data.shift();   //remove id item;
		this.hoverCircle = createSVGNode("circle", null, {
			r: 4,
			fill: "white",
			stroke: this.config.color
		});
		this.hoverCircle.classList.add('chart__tooltip-obj');
	}

	public update(areaHeight: number,
					  areaWidth: number,
					  marginLeft: number,
					  yAxis: YAxis,
					  xAxis: XAxis)
	{
		if (this.nodes)
			this.nodes.forEach(n => removeNode(n));

		let sum = 0, countNotNull = 0;
		this.nodes = [];
		this.nodesPoints = [];
		if (this.visible)
		{
			this.indexToPoint = {};
			let points = "",
				 pointsArr = [],
				 topValue = yAxis.getTopValue(),
				 bottomValue = yAxis.getBottomValue();

			for (let i = xAxis.getStartCategoryIndex(); i <= xAxis.getEndCategoryIndex(); i++)
			{
				let value = this.config.data[i] as number;

				if (value != null)
				{
					sum += value;
					countNotNull++;

					let y = areaHeight - yAxis.calcHeightByValue(value, topValue, bottomValue),
						 x = xAxis.getXByIndex(i) + marginLeft;
					if (points)
						points += ', ';
					points += x + " " + y;

					pointsArr.push({x, y});
					this.indexToPoint[i] = y;
				}
				else if (points)
				{
					this.nodesPoints.push(pointsArr);
					this.nodes.push(createSVGNode("polyline", this.parentNode, {
						points,
						"series-id": this.id,
						fill: "transparent",
						stroke: this.config.color,
						'stroke-width': '2'
					}));
					points = "";
					pointsArr = [];
				}
			}

			if (points)
			{
				this.nodes.push(createSVGNode("polyline", this.parentNode, {
					points,
					"series-id": this.id,
					fill: "transparent",
					stroke: this.config.color,
					'stroke-width': '2'
				}));
				this.nodesPoints.push(pointsArr);
			}
		}

		this.averageValueOnVisiblePart = sum / countNotNull;
	}

	getAverageValue()
	{
		return this.averageValueOnVisiblePart;
	}


	setIsVisible(value: boolean)
	{
		this.visible = value;
	}

	showToolTipPoint(category: ICategory)
	{
		if (this.indexToPoint[category.index] != null && this.visible)
		{
			if (!this.hoverCircle.parentNode)
				this.parentNode.appendChild(this.hoverCircle);
			this.hoverCircle.setAttribute("cx", category.x + '');
			this.hoverCircle.setAttribute("cy", this.indexToPoint[category.index] + "");
		}
	}

	hideToolTipPoint()
	{
		removeNode(this.hoverCircle);
	}
}