import {createSVGNode} from "./Util";

interface IYAxisConfig {
	Min: number;
	Max: number;
	Color?: string;
}


export default class YAxis {
	config: IYAxisConfig;
	svgNode: SVGSVGElement;

	marginLeft: number;

	public constructor(config: IYAxisConfig, svgNode: SVGSVGElement)
	{
		this.config = config;
		this.svgNode = svgNode;
		this.marginLeft = 40;
	}


	public update(height: number)
	{
		let min = 0,
			 max = 100;

		let line = createSVGNode("line", {
			x1: this.marginLeft,
			y1: 0,
			y2: height,
			x2: this.marginLeft,
			stroke: this.config.Color
		});
		this.svgNode.appendChild(line);

		let ticksCount = 10,
			 step = Math.abs((this.config.Max - this.config.Min) / ticksCount);

		for (let x = this.config.Min; x < this.config.Max; x += step)
		{
			let perc = x / this.config.Max,
				 h = perc * height;   //высота в реале

			//на высоте h надо рисовать tick и подпись

			let line = createSVGNode("line", {
				x1: this.marginLeft - 10,
				y1: h,
				y2: h,
				x2: this.marginLeft,
				stroke: this.config.Color
			});
			this.svgNode.appendChild(line);
		}
	}
}