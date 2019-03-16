import {calcSize, createSVGNode, formatValue, removeNode} from "./Util";

export interface IYAxisConfig {
	color?: string;
	gridColor?: string;
	ticksCount?: number;
	fontSize?: number;
	showGrid?: boolean;
	lineVisible?: boolean;
}


const YAxisDefaultConfig: IYAxisConfig = {
	color: "#e0e0e0",
	gridColor: "#e0e0e0",
	ticksCount: 5,
	fontSize: 11,
	showGrid: true,
	lineVisible: false
};

export default class YAxis {
	config: IYAxisConfig;
	parentNode: SVGElement;
	group: SVGElement;
	marginLeft: number;
	widthOfLabels: number;
	height: number;
	min: number;
	max: number;

	public constructor(config: IYAxisConfig, svgNode: SVGElement)
	{
		this.config = {...YAxisDefaultConfig, ...config};
		this.parentNode = svgNode;
		this.marginLeft = 40;
	}


	public getTopValue()
	{
		let countR = (this.max).toFixed(0).length,
			 topValue = Math.pow(10, countR) / 2;

		if (topValue < this.max)
			topValue *= 2;

		return topValue;
	}

	private getBottomValue()
	{
		let countR = (this.min).toFixed(0).length - 1;

		let res = Math.pow(10, countR) / 2;
		if (res < 10)
			return 0;
		else
			return res;
	}

	public calcHeightByValue(y: number, topValue: number)
	{
		let perc = y / topValue;
		return perc * this.height;
	}

	public update(height: number, width: number, min: number, max: number)
	{
		removeNode(this.group);
		this.height = height;
		this.min = min;
		this.max = max;
		this.group = createSVGNode("g", this.parentNode, {type: "yAxis"});


		let ticksCount = this.config.ticksCount,
			 topValue = this.getTopValue(),
			 bottomValue = this.getBottomValue(),
			 step = Math.round(Math.abs((topValue - bottomValue) / ticksCount)),
			 labels = [];

		if (this.config.showGrid)
			for (let y = bottomValue; y <= topValue - step; y += step)
			{
				let h = this.calcHeightByValue(y, topValue);

				if (this.config.showGrid)
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
					x: 5,
					y: height - h - 4,
					style: `font-size: ${this.config.fontSize}px`
				}).textContent = label;

				labels.push(label);
			}

		this.widthOfLabels = calcSize(labels, this.config.fontSize).width;

		if (this.config.lineVisible)
			createSVGNode("line", this.group, {
				x1: this.widthOfLabels + 5,
				y1: 0,
				y2: height,
				x2: this.widthOfLabels + 5,
				stroke: this.config.color,
				"stroke-width": 1,
				"shape-rendering": "crispEdges"
			});
	}

	getWidth()
	{
		return this.widthOfLabels;
	}
}