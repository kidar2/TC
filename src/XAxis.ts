import {calcSize, createSVGNode, formatDate, removeNode} from "./Util";

export enum CategoriesType {
	date, string
}

export interface IXAxisConfig {
	color?: string;
	lineVisible?: boolean;
	categories?: Array<string | number>;
	type?: CategoriesType;
	fontSize?: number,
	showGrid?: boolean;
}

export interface ICategory {
	x: number,
	label: string,
	index: number
}

const XAxisDefaultConfig: IXAxisConfig = {
	color: "#e0e0e0",
	lineVisible: true,
	type: CategoriesType.string,
	fontSize: 11,
	showGrid: false
};

export default class XAxis {
	config: IXAxisConfig;
	parentNode: SVGElement;
	public group: SVGElement;
	private tooltipLine: SVGElement;
	private labels: string[];
	private labelScale: ICategory[];

	public constructor(config: IXAxisConfig, svgNode: SVGElement)
	{
		this.config = {...XAxisDefaultConfig, ...config};
		this.parentNode = svgNode;
		this.labels = new Array(this.config.categories.length - 1);
		this.tooltipLine = createSVGNode("line", null,{stroke: this.config.color});
		this.tooltipLine.classList.add('chart__tooltip-obj');

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

	public update(bottomPoint: number, width: number, marginLeft: number)
	{
		removeNode(this.group);
		this.group = createSVGNode("g", this.parentNode, {type: "xAxis"});
		this.labelScale = [];

		// //линия самой оси
		// createSVGNode("line", this.group, {
		// 	x1: marginLeft,
		// 	y1: top,
		// 	y2: top,
		// 	x2: width,
		// 	stroke: this.config.color,
		// 	"stroke-width": 1,
		// 	"shape-rendering": "crispEdges"
		// });

		let labelWidth = calcSize(this.labels).width,
			 labelMargin = 10,
			 fontSize = `font-size: ${this.config.fontSize}px`,
			 countView = width / (labelWidth + labelMargin);

		let step = Math.round(this.labels.length / countView);
		if (step <= 1)
		{
			//значит можно отрисовать все подписи
			step = 1;
			labelMargin = (width - labelWidth * this.labels.length) / (this.labels.length - 1);
		}


		let stepX = width / (this.labels.length - 1),
			 x = labelWidth / 2;

		for (let i = 1; i < this.labels.length; i++)
		{
			this.labelScale.push({x: x, label: this.labels[i], index: i});

			// вертикальная линия области построения
			if (this.config.showGrid)
				createSVGNode("line", this.group, {
					x1: x,
					y1: 0,
					y2: bottomPoint,
					x2: x,
					stroke: this.config.color,
					"stroke-width": 1,
					"shape-rendering": "crispEdges"
				});

			if (step == 1)
			{
				createSVGNode("text", this.group, {
					x: x - labelWidth / 2 + marginLeft,  // чтобы подпись была выровнена посередите точки построения
					y: bottomPoint + 15,
					style: fontSize
				}).textContent = this.labels[i];
			}
			x += stepX;
		}


		if (step > 1)
		{
			//drawing not all labels
			for (let i = this.labels.length - 1, index = 1; i >= 0; i -= step, index++)
			{
				let label = this.labels[i],
					 x = width - index * (labelMargin + labelWidth);
				if (x < 0)
					break;
				createSVGNode("text", this.group, {
					x: x,
					y: bottomPoint + 15,
					style: fontSize
				}).textContent = label;
			}
		}
	}

	public showTooltipLine(category: ICategory, bottomPoint: number)
	{
		if (!this.tooltipLine.parentNode)
			this.group.appendChild(this.tooltipLine);
		this.tooltipLine.setAttribute("x1", category.x + "");
		this.tooltipLine.setAttribute("x2", category.x + "");
		this.tooltipLine.setAttribute("y1", "0");
		this.tooltipLine.setAttribute("y2", bottomPoint + "");
	}

	public hideTooltipLine()
	{
		removeNode(this.tooltipLine);
	}

	public getXByIndex(index: number)
	{
		return this.labelScale[index].x;
	}

	public getCategory(x: number)
	{
		if (this.labelScale[0].x > x)
			return this.labelScale[0];

		if (x > this.labelScale[this.labelScale.length - 1].x)
			return this.labelScale[this.labelScale.length - 1];

		for (let i = 1; i < this.labelScale.length; i++)
		{
			if (x > this.labelScale[i - 1].x && x <= this.labelScale[i].x)
			{
				if (Math.abs(x - this.labelScale[i - 1].x) < Math.abs(x - this.labelScale[i].x))
				{
					return this.labelScale[i - 1];
				}

				return this.labelScale[i];
			}
		}
	}

	public getLabelByX(x: number)
	{
		let res = this.getCategory(x);
		return res && res.label;
	}

	public getIndexOfCategory(x: ICategory)
	{
		return this.labelScale.indexOf(x);
	}
}