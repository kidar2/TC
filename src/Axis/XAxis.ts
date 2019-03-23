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
	private labelsScale: ICategory[];  //labels scale сonsidering scroll position
	private allLabelsScale: ICategory[];
	public readonly LABEL_MARGIN_TOP: number;
	public allLabelsVisible: boolean;
	public labelWidth: number;
	private countView: number;     //calculated number of possible labels to display
	private labelMargin: number;
	DEFAULT_LABEL_MARGIN: number;  //default margin between labels
	private startCategoryIndex: number;
	private endCategoryIndex: number;


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
				this.labels[i - 1] = formatDate(d);
			}
			else
				this.labels[i - 1] = this.config.categories[i] as string;
		}
	}

	public prepare(width: number, marginLeft: number)
	{
		this.labelMargin = this.DEFAULT_LABEL_MARGIN;
		width -= this.config.marginRight + marginLeft;
		if (this.labelWidth == null)
			this.labelWidth = calcSize(this.labels, this.config.fontSize).width;
		this.countView = Math.round(width / (this.labelWidth + this.labelMargin));
		this.allLabelsVisible = this.calcStep() <= 1;
	}

	calcStep()
	{
		return Math.round((this.labels.length - 1) / this.countView);
	}


	public update(bottomPoint: number,
					  topPoint: number,
					  width: number,
					  marginLeft: number,
					  startScrollPosition: number,
					  endScrollPosition: number)
	{
		removeNode(this.group);
		this.group = createSVGNode("g", null, {type: "xAxis"});
		this.parentNode.insertBefore(this.group, this.parentNode.querySelector('g[type="area"]'));

		width -= this.config.marginRight + marginLeft;

		let fontSize = `font-size: ${this.config.fontSize}px`;

		this.startCategoryIndex = 0;
		this.endCategoryIndex = this.labels.length - 1;


		if (startScrollPosition || endScrollPosition)
		{
			if (startScrollPosition)
				this.startCategoryIndex = this.getIndexOfCategoryByPosition(startScrollPosition);

			if (endScrollPosition)
				this.endCategoryIndex = this.getIndexOfCategoryByPosition(endScrollPosition);
		}


		let labelScale = [],
			 stepScaleX = (width - this.labelWidth / 2) / (this.endCategoryIndex - this.startCategoryIndex),
			 sumXLabel = 0,
			 scaleX = 0;

		for (let i = this.startCategoryIndex; i <= this.endCategoryIndex; i++)
		{
			labelScale.push({x: scaleX, label: this.labels[i], index: i});

			// vertical line of the construction area
			if (this.config.showGrid)
				createSVGNode("line", this.group, {
					x1: scaleX,
					y1: topPoint,
					y2: bottomPoint,
					x2: scaleX,
					stroke: this.config.color,
					"stroke-width": 1,
					"shape-rendering": "crispEdges"
				});

			//let x = ;  // so that the labels is aligned in between the construction points

			if (scaleX >= sumXLabel)
			{
				createSVGNode("text", this.group, {
					x: scaleX + this.labelWidth / 2,
					y: bottomPoint + this.LABEL_MARGIN_TOP,
					style: fontSize
				}).textContent = this.labels[i];

				sumXLabel = scaleX + this.labelWidth + this.labelMargin + this.labelWidth / 2;
			}

			scaleX += stepScaleX;
		}

		this.labelsScale = labelScale;

		if (!this.allLabelsScale)
			this.allLabelsScale = this.labelsScale;
	}

	public getStartCategoryIndex()
	{
		return this.startCategoryIndex;
	}

	public getEndCategoryIndex()
	{
		return this.endCategoryIndex;
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
		index -= this.startCategoryIndex;
		return this.labelsScale[index].x;
	}

	public getCategory(x: number, labelsScale: ICategory[] = this.labelsScale)
	{
		if (labelsScale[0].x > x)
			return labelsScale[0];

		if (x > labelsScale[labelsScale.length - 1].x)
			return labelsScale[labelsScale.length - 1];

		for (let i = 1; i < labelsScale.length; i++)
		{
			if (x > labelsScale[i - 1].x && x <= labelsScale[i].x)
			{
				if (Math.abs(x - labelsScale[i - 1].x) < Math.abs(x - labelsScale[i].x))
				{
					return labelsScale[i - 1];
				}

				return labelsScale[i];
			}
		}
	}


	public getIndexOfCategory(x: ICategory)
	{
		let res = this.allLabelsScale.find(c => c.label == x.label);
		return res ? this.allLabelsScale.indexOf(res) : -1;
	}


	public getIndexOfCategoryByPosition(position: number)
	{
		return this.allLabelsScale.indexOf(this.getCategory(position, this.allLabelsScale));
	}

}