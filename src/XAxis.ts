import {calcSize, createSVGNode, formatDate, formatValue, removeNode} from "./Util";

export enum CategoriesType {
	date, string
}

export interface IXAxisConfig {
	color?: string;
	lineVisible?: boolean;
	categories?: Array<string | number>;
	type?: CategoriesType;
}

const XAxisDefaultConfig: IXAxisConfig = {
	color: "#e0e0e0",
	lineVisible: true,
	type: CategoriesType.string
};

export default class XAxis {
	config: IXAxisConfig;
	parentNode: SVGElement;
	group: SVGElement;
	private labels: string[];
	private labelScale: { x: number, label: string }[];

	public constructor(config: IXAxisConfig, svgNode: SVGElement)
	{
		this.config = {...XAxisDefaultConfig, ...config};
		this.parentNode = svgNode;
		this.labels = new Array(this.config.categories.length - 1);

		for (let i = 1; i < this.config.categories.length; i++)
		{
			if (this.config.type == CategoriesType.date)
			{
				let d = new Date(this.config.categories[i]);
				this.labels[i] = formatDate(d);
			}
			else
				this.labels[i] = this.config.categories[i] as string;
		}
	}

	public update(top: number, width: number)
	{
		removeNode(this.group);
		this.group = createSVGNode("g", this.parentNode, {type: "xAxis"});
		this.labelScale = [];
		createSVGNode("line", this.group, {
			x1: 0,
			y1: top,
			y2: top,
			x2: width,
			stroke: this.config.color,
			"stroke-width": 1,
			"shape-rendering": "crispEdges"
		});

		const labelWidth = calcSize(this.labels).width,
			 labelMargin = 10,
			 countView = width / (labelWidth + labelMargin);

		let step = Math.round(this.labels.length / countView);

		for (let i = this.labels.length - 1, index = 1; i >= 0; i -= step, index++)
		{
			let label = this.labels[i],
				 x = width - index * (labelMargin + labelWidth);
			if (x < 0)
				break;
			createSVGNode("text", this.group, {
				x: x,
				y: top + 15,
				style: "font-size: 11px"
			}).textContent = label;

			this.labelScale.push({x, label});
		}
	}

	public getLabelByX(x: number)
	{
		for (let i = 1; i < this.labelScale.length - 1; i++)
		{
			if (this.labelScale[i].x >= x && this.labelScale[i - 1].x < x)
				return this.labelScale[i].label;
		}
	}
}