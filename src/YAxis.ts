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
			 step = Math.abs((this.config.Max - this.config.Min) / ticksCount);

		for (let x = this.config.Min; x < this.config.Max; x += step)
		{
			let perc = x / this.config.Max,
				 h = perc * height;   //высота в реале

			//на высоте h надо рисовать tick и подпись

			createSVGNode("line", this.group, {
				x1: this.marginLeft - 10,
				y1: h,
				y2: h,
				x2: this.marginLeft,
				stroke: this.config.Color,
				"stroke-width": 1,
				"shape-rendering": "crispEdges"
			});

			createSVGNode("text", this.group, {
				x: 0,
				y: h,
				style: "font-size: 11px"
			}).textContent = formatValue(h);
		}
	}
}