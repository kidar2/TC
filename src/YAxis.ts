import {createSVGNode, formatValue} from "./Util";

export interface IYAxisConfig {
	Min?: number;
	Max?: number;
	Color?: string;
	TicksCount?: number;
	LineVisible?: boolean;
}


const YAxisDefaultConfig: IYAxisConfig = {
	Min: 0,
	Max: 100,
	Color: "black",
	TicksCount: 10,
	LineVisible: true
};

export default class YAxis {
	config: IYAxisConfig;
	svgNode: SVGSVGElement;
	group: SVGElement;
	marginLeft: number;

	public constructor(config: IYAxisConfig, svgNode: SVGSVGElement)
	{
		this.config = {...YAxisDefaultConfig, ...config};
		this.svgNode = svgNode;
		this.marginLeft = 40;
	}


	private getTopValue()
	{
		let countR = (this.config.Max).toFixed(0).length,
			 topValue = Math.pow(10, countR) / 2;

		return topValue;
	}

	private getBottomValue()
	{
		let countR = (this.config.Max).toFixed(0).length - 1;

		return Math.pow(10, countR) / 2;
	}

	public update(height: number)
	{
		if (this.group && this.group.parentNode)
			this.group.parentNode.removeChild(this.group);

		this.group = createSVGNode("g");
		this.svgNode.appendChild(this.group);

		if (this.config.LineVisible)
		{
			createSVGNode("line", this.group, {
				x1: this.marginLeft,
				y1: 0,
				y2: height,
				x2: this.marginLeft,
				stroke: this.config.Color,
				"stroke-width": 1,
				"shape-rendering": "crispEdges"
			});
		}


		let ticksCount = this.config.TicksCount,
			 topValue = this.getTopValue(),
			 bottomValue = this.getBottomValue(),
			 step = Math.round(Math.abs((topValue - bottomValue) / ticksCount));

		for (let y = topValue - step; y >= bottomValue; y -= step)
		{
			let perc = y / topValue,
				 h = perc * height;


			createSVGNode("line", this.group, {
				x1: this.marginLeft - 10,
				y1: height - h,
				y2: height - h,
				x2: this.marginLeft,
				stroke: this.config.Color,
				"stroke-width": 1,
				"shape-rendering": "crispEdges"
			});

			createSVGNode("text", this.group, {
				x: 0,
				y: height - h + 4,
				style: "font-size: 11px"
			}).textContent = formatValue(y);
		}
	}
}