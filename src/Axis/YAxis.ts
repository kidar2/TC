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
	currentTopValue: number;
	currentBottomValue: number;
	animate_delta: number;

	public constructor(config: IYAxisConfig, svgNode: SVGElement)
	{
		this.config = {...YAxisDefaultConfig, ...config};
		this.parentNode = svgNode;
		this.marginLeft = 40;
		this.animate_delta = 50;
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
		if (this.min >= 0)
		{
			let countR = (this.min).toFixed(0).length - 1;
			let res = Math.pow(10, countR) / 2;

			if (res < 10)
				return 0;
			else
				return res;
		}
		else
		{
			return -getTopValue(Math.abs(this.min));
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

	shouldAnimate()
	{
		return (this.currentBottomValue != this.getBottomValue() || this.currentTopValue != this.getTopValue());
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

	private hideGroup(group: SVGElement, animateType: number)
	{
		if (group)
		{
			if (animateType != null)
			{
				let baseGroupProps = {
					begin: "DOMNodeInserted",
					dur: "0.33s",
					fill: "freeze",
					repeatCount: "1"
				};
				let animateOpacity = createSVGNode("animate", null, {
					attributeName: "opacity",
					attributeType: "CSS",
					"from": "1",
					to: "0",
					...baseGroupProps
				});

				let animateTransform = createSVGNode("animateTransform", null, {
					type: "translate",
					attributeName: "transform",
					"from": "0 0",
					to: "0 " + (animateType * this.animate_delta),
					...baseGroupProps
				});

				animateTransform.addEventListener('endEvent', () =>
				{
					this.parentNode.removeChild(group);
				}, false);


				group.appendChild(animateTransform);
				group.appendChild(animateOpacity);
			}
			else
				this.parentNode.removeChild(group);
		}
	}

	private showGroup(group: SVGElement, animateType: number)
	{
		if (animateType != null)
		{
			let baseGroupProps = {
				begin: "DOMNodeInserted",
				dur: "0.33s",
				fill: "freeze",
				repeatCount: "1"
			};
			let animateOpacity = createSVGNode("animate", null, {
				attributeName: "opacity",
				attributeType: "CSS",
				"from": "0",
				to: "1",
				...baseGroupProps
			});

			let animateTransform = createSVGNode("animateTransform", null, {
				type: "translate",
				attributeName: "transform",
				"from": "0 " + (animateType * this.animate_delta),
				to: "0 0",
				...baseGroupProps
			});

			animateTransform.addEventListener('endEvent', () =>
			{
				group.removeChild(animateTransform);
				group.removeChild(animateOpacity);
			}, false);


			group.appendChild(animateTransform);
			group.appendChild(animateOpacity);
		}

		this.parentNode.appendChild(group);
	}

	public update(height: number, width: number, animate: boolean)
	{
		let animateType = animate && this.shouldAnimate() ? (this.currentTopValue > this.getTopValue() ? 1 : -1) : null;
		this.hideGroup(this.group, animateType);
		this.group = createSVGNode("g", null, {type: "yAxis"});
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

		this.showGroup(this.group, animateType);

		this.currentTopValue = topValue;
		this.currentBottomValue = bottomValue;
	}

	getWidth()
	{
		return this.widthOfLabels;
	}
}