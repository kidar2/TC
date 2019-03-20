import {calcSize, createSVGNode, formatValue, getTopValue} from "../Util";

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
	heightOfLabels: number;
	height: number;
	min: number;
	max: number;

	public constructor(config: IYAxisConfig, svgNode: SVGElement)
	{
		this.config = {...YAxisDefaultConfig, ...config};
		this.parentNode = svgNode;
		this.marginLeft = 40;
		this.group = createSVGNode("g", this.parentNode, {type: "yAxis"});
	}

	getTopValue()
	{
		return getTopValue(this.max);
	}

	/**
	 * Calculation Bottom value for YAxis based on min value of view data on chart
	 */
	public getBottomValue()
	{
		let countR = (this.min).toFixed(0).length - 1;

		let res = Math.pow(10, countR) / 2;

		if (this.min >= 0)
		{
			if (res < 10)
				return 0;
			else
				return res;
		}
		else
		{
			return -getTopValue(res);
		}
	}

	public calcHeightByValue(y: number, topValue: number, bottomValue: number)
	{
		if (bottomValue < 0)
		{
			y += Math.abs(bottomValue);
			topValue += Math.abs(bottomValue);
		}
		let perc = y / topValue;
		return perc * this.height;
	}

	public prepare(min: number, max: number)
	{
		this.min = min;
		this.max = max;
		if (this.widthOfLabels == null)
		{
			let topValue = this.getTopValue(),
				 bottomValue = this.getBottomValue(),
				 step = Math.round(Math.abs((topValue - bottomValue) / this.config.ticksCount)),
				 labels = [];

			for (let y = bottomValue; y <= topValue - step; y += step)
				labels.push(formatValue(y));

			this.widthOfLabels = calcSize(labels, this.config.fontSize).width;
			this.heightOfLabels = calcSize([formatValue(topValue)], this.config.fontSize).height
		}
	}

	public update(height: number, width: number)
	{
		this.group.innerHTML = "";
		this.height = height - this.heightOfLabels;


		let ticksCount = this.config.ticksCount,
			 topValue = this.getTopValue(),
			 bottomValue = this.getBottomValue(),
			 step = Math.round(Math.abs((topValue - bottomValue) / ticksCount)),
			 labels = [];


		for (let y = bottomValue; y <= topValue; y += step)
		{
			let h = this.calcHeightByValue(y, topValue, bottomValue) - this.heightOfLabels;

			if (this.config.showGrid)
				createSVGNode("line", this.group, {
					x1: 0,
					y1: this.height - h,
					y2: this.height - h,
					x2: width,
					stroke: this.config.color,
					"stroke-width": 1,
					"shape-rendering": "crispEdges"
				});

			let label = formatValue(y);
			createSVGNode("text", this.group, {
				x: 5,
				y: this.height - h - 4,
				style: `font-size: ${this.config.fontSize}px`
			}).textContent = label;

			labels.push(label);
		}


		if (this.config.lineVisible)
			createSVGNode("line", this.group, {
				x1: this.widthOfLabels + 5,
				y1: 0,
				y2: this.height,
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