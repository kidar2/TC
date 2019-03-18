import {calcSize, createSVGNode, formatDate, removeNode} from "../Util";

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
	marginRight?: number;
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
	showGrid: true,
	marginRight: 30
};

export default class XAxis {
	config: IXAxisConfig;
	parentNode: SVGElement;
	public group: SVGElement;
	private tooltipLine: SVGElement;
	private labels: string[];
	private labelScale: ICategory[];
	public readonly LABEL_MARGIN_TOP: number;
	public allLabelsVisible: boolean;
	private labelWidth: number;
	private countView: number;     //calculated number of possible labels to display
	private labelMargin: number;
	DEFAULT_LABEL_MARGIN: number;  //default margin between labels

	public constructor(config: IXAxisConfig, svgNode: SVGElement)
	{
		this.DEFAULT_LABEL_MARGIN = 10;
		this.LABEL_MARGIN_TOP = 15;
		this.config = {...XAxisDefaultConfig, ...config};
		this.parentNode = svgNode;
		this.labels = new Array(this.config.categories.length - 1);
		this.tooltipLine = createSVGNode("line", null, {stroke: this.config.color});
		this.tooltipLine.classList.add('chart__tooltip-obj');
		this.labelMargin = this.DEFAULT_LABEL_MARGIN;
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

	public prepare(width: number, marginLeft: number)
	{
		this.labelMargin = this.DEFAULT_LABEL_MARGIN;
		width -= this.config.marginRight + marginLeft;
		if (this.labelWidth == null)
			this.labelWidth = calcSize(this.labels, this.config.fontSize).width;
		this.countView = width / (this.labelWidth + this.labelMargin);
		this.allLabelsVisible = this.calcStep() <= 1;
	}

	calcStep()
	{
		return Math.round(this.labels.length / this.countView);
	}


	public update(bottomPoint: number, topPoint: number, width: number, marginLeft: number)
	{
		removeNode(this.group);
		this.group = createSVGNode("g", this.parentNode, {type: "xAxis"});
		this.labelScale = [];


		width -= this.config.marginRight + marginLeft;

		let fontSize = `font-size: ${this.config.fontSize}px`,
			 step = this.calcStep();

		if (step <= 1)
		{
			//we can draw all the signatures
			step = 1;
			this.labelMargin = (width - this.labelWidth * this.labels.length) / (this.labels.length - 1);
		}


		let stepX = width / (this.labels.length - 1),
			 x = marginLeft + this.labelWidth / 2;

		for (let i = 1; i < this.labels.length; i++)
		{
			this.labelScale.push({x: x, label: this.labels[i], index: i});

			// vertical line of the construction area
			if (this.config.showGrid)
				createSVGNode("line", this.group, {
					x1: x,
					y1: topPoint,
					y2: bottomPoint,
					x2: x,
					stroke: this.config.color,
					"stroke-width": 1,
					"shape-rendering": "crispEdges"
				});

			if (step == 1)
			{
				createSVGNode("text", this.group, {
					x: x - this.labelWidth / 2,  // so that the labels is aligned in between the construction points
					y: bottomPoint + this.LABEL_MARGIN_TOP,
					style: fontSize
				}).textContent = this.labels[i];
			}
			x += stepX;
		}


		if (step > 1 && this.countView > 2)
		{
			this.labelMargin = (width + marginLeft - this.labelWidth * this.countView) / (this.countView - 1);
			//drawing not all labels
			for (let i = this.labels.length - 1, index = 0; i >= 0; i -= step, index++)
			{
				let label = this.labels[i],
					 x = width - index * (this.labelMargin + this.labelWidth);
				if (x < 0)
					break;
				createSVGNode("text", this.group, {
					x: x,
					y: bottomPoint + this.LABEL_MARGIN_TOP,
					style: fontSize
				}).textContent = label;
			}
		}
	}

	public showTooltipLine(category: ICategory, topPoint: number, bottomPoint: number)
	{
		if (!this.tooltipLine.parentNode)
			this.group.appendChild(this.tooltipLine);
		this.tooltipLine.setAttribute("x1", category.x + "");
		this.tooltipLine.setAttribute("x2", category.x + "");
		this.tooltipLine.setAttribute("y1", topPoint + "");
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
		return this.labelScale.indexOf(x) + 1;
	}
}