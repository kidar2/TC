import {calcSize, createSVGNode, formatValue, removeNode} from "./Util";

export interface IYAxisConfig {
	min?: number;
	max?: number;
	color?: string;
	gridColor?: string;
	ticksCount?: number;
	lineVisible?: boolean;
	fontSize?: number;
}


const YAxisDefaultConfig: IYAxisConfig = {
	min: 0,
	max: 100,
	color: "#e0e0e0",
	gridColor: "#e0e0e0",
	ticksCount: 10,
	fontSize: 11,
	lineVisible: true
};

export default class YAxis {
	config: IYAxisConfig;
	parentNode: SVGElement;
	group: SVGElement;
	marginLeft: number;
	widthOfLabels: number;

	public constructor(config: IYAxisConfig, svgNode: SVGElement)
	{
		this.config = {...YAxisDefaultConfig, ...config};
		this.parentNode = svgNode;
		this.marginLeft = 40;
	}


	public getTopValue()
	{
		let countR = (this.config.max).toFixed(0).length,
			 topValue = Math.pow(10, countR) / 2;

		if (topValue < this.config.max)
			topValue *= 2;

		return topValue;
	}

	private getBottomValue()
	{
		let countR = (this.config.min).toFixed(0).length - 1;

		return Math.pow(10, countR) / 2;
	}

	public update(height: number, width: number)
	{
		removeNode(this.group);

		this.group = createSVGNode("g", this.parentNode, {type: "yAxis"});

		if (this.config.lineVisible)
		{
			createSVGNode("line", this.group, {
				x1: this.marginLeft,
				y1: 0,
				y2: height,
				x2: this.marginLeft,
				stroke: this.config.color,
				"stroke-width": 1,
				"shape-rendering": "crispEdges"
			});
		}


		let ticksCount = this.config.ticksCount,
			 topValue = this.getTopValue(),
			 bottomValue = this.getBottomValue(),
			 step = Math.round(Math.abs((topValue - bottomValue) / ticksCount)),
			 labels = [];

		for (let y = topValue - step; y >= bottomValue; y -= step)
		{
			let perc = y / topValue,
				 h = perc * height;

			createSVGNode("line", this.group, {
				x1: 0,
				y1: height - h,
				y2: height - h,
				x2: width,
				stroke: this.config.color,
				"stroke-width": 1,
				"shape-rendering": "crispEdges"
			});

			let label = formatValue(y);
			createSVGNode("text", this.group, {
				x: 0,
				y: height - h - 4,
				style: `font-size: ${this.config.fontSize}px`
			}).textContent = label;

			labels.push(label);
		}

		this.widthOfLabels = calcSize(labels, this.config.fontSize).width;
	}

	getWidth()
	{
		return this.widthOfLabels;
	}
}