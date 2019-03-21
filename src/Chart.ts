import './chart.scss';
import YAxis, {IYAxisConfig} from "./Axis/YAxis";
import XAxis, {IXAxisConfig} from "./Axis/XAxis";
import {createNode, createSVGNode, formatValue, IHash} from "./Util";
import LineSeries from "./LineSeries";
import Tooltip from "./ToolTip/Tooltip";
import Legend from "./Legend/Legend";
import ScrollBox from "./ScrollBox/ScrollBox";


export interface IChartData {
	columns: [][],
	types: IHash<string>;
	names: IHash<string>;
	colors: IHash<string>;
}

export interface IChartConfig {
	width?: number;
	height?: number;
	parentNode: HTMLElement;
	data: IChartData;
	xAxis?: IXAxisConfig;
	yAxis?: IYAxisConfig;
	title?: string;
}


export default class Chart {

	private config: IChartConfig;
	private root: HTMLDivElement;
	private svg: SVGSVGElement;
	private chartArea: SVGElement;
	private titleNode: HTMLElement;
	private yAxis: YAxis;
	private xAxis: XAxis;
	private series: LineSeries[];

	private legendHeight: number;
	private scrollBoxHeight: number;
	private titleHeight: number;
	private tooltip: Tooltip;
	private legend: Legend;
	private min: number;
	private max: number;
	private scrollBox: ScrollBox;


	public constructor(config: IChartConfig)
	{
		this.config = config;
		this.legendHeight = 50;
		this.scrollBoxHeight = 50;
		this.titleHeight = 0;
		this.render();
	}

	private render()
	{
		this.root = document.createElement("div");
		this.root.classList.add('chart');
		this.config.parentNode.appendChild(this.root);

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;


		this.titleNode = createNode('div', this.root, "chart__title");
		this.titleNode.innerText = this.config.title;
		this.titleHeight = this.titleNode.offsetHeight;
		this.root.appendChild(this.svg);

		this.yAxis = new YAxis(this.config.yAxis, this.svg);
		this.chartArea = createSVGNode('g', this.svg, {type: "area"});

		this.series = [];


		this.config.data.columns.forEach((c: Array<string | number>) =>
		{
			let id = c[0] as string;
			if (this.config.data.types[id] == "x")
			{
				this.xAxis = new XAxis({categories: c, ...this.config.xAxis}, this.svg);
			}
			else
			{
				this.series.push(new LineSeries({
					data: c,
					type: this.config.data.types[id],
					name: this.config.data.names[id],
					color: this.config.data.colors[id]
				}, this.chartArea));
			}
		});

		this.updateMinMax();
		this.scrollBox = new ScrollBox(this.root, this.svg, () => this.onScrollChanged());

		this.setSize(this.config.width, this.config.height);
		this.svg.addEventListener("mousemove", (e: MouseEvent) => this._onMouseMove(e));
		this.svg.addEventListener("mouseout", () => this._hideToolTip());

		this.tooltip = new Tooltip(this.root);
		this.legend = new Legend(this.series, this.root, this.legendHeight, (serId: string) => this.onLegendItemClick(serId));
		this.legend.update();
	}

	private onScrollChanged()
	{
		this.updateMinMax();
		this.update(true);
	}

	public updateMinMax()
	{
		let min = Number.MAX_VALUE,
			 max = Number.MIN_VALUE,
			 startIndex = this.scrollBox && this.scrollBox.getLeftPosition() != null ? this.xAxis.getIndexOfCategoryByPosition(this.scrollBox.getLeftPosition()) : 0,
			 endIndex = this.scrollBox && this.scrollBox.getRightPosition() != null ? this.xAxis.getIndexOfCategoryByPosition(this.scrollBox.getRightPosition()) : this.config.data.columns[0].length - 1;

		for (let i = 0; i < this.series.length; i++)
		{
			if (this.series[i].visible)
			{
				let data = this.series[i].config.data;
				for (let j = startIndex; j <= endIndex; j++)
				{
					if (data[j] != null)
					{
						if (data[j] > max)
							max = data[j] as number;

						if (data[j] < min)
							min = data[j] as number;
					}
				}
			}
		}
		this.min = min;
		this.max = max;
	}

	_hideToolTip()
	{
		this.tooltip.hide();
		this.xAxis.hideTooltipLine();
		this.series.forEach(s => s.hideToolTipPoint());
	}

	_onMouseMove(e: MouseEvent)
	{
		let x = e.offsetX - this.getMarginLeft();
		let category = x >= 0 ? this.xAxis.getCategory(x) : null;

		if (!category)
		{
			this._hideToolTip();
		}
		else
		{
			let valueIndex = this.xAxis.getIndexOfCategory(category);
			category = {...category, x: category.x + this.getMarginLeft()};
			let seriesValues = [];
			for (let i = 1; i < this.config.data.columns.length; i++)  //first array is category axis
			{
				let serData = this.config.data.columns[i],
					 series = this.series.find(s => s.config.data == serData),   //todo improve search
					 value = this.config.data.columns[i][valueIndex];
				if (value != null && series.visible)
				{
					seriesValues.push({
						name: this.config.data.names[series.id],
						value: formatValue(value),
						color: this.config.data.colors[series.id]
					});
					series.showToolTipPoint(category);
				}
			}

			this.tooltip.show(e.offsetX, e.offsetY + this.titleHeight, seriesValues, category.label);
			this.xAxis.showTooltipLine(category, this.yAxis.heightOfLabels, this.getPlotAreaHeight());
		}
	}

	onLegendItemClick(serId: string)
	{
		let s = this.series.find(s => s.id == serId);
		s.setIsVisible(!s.visible);
		this.updateMinMax();
		this.update(true);
		this.scrollBox.updateSeriesVisible(s);
	}

	getPlotAreaHeight()
	{
		return this.config.height - this.legendHeight - this.titleHeight - this.xAxis.LABEL_MARGIN_TOP - (this.xAxis.allLabelsVisible ? 0 : this.scrollBoxHeight);
	}

	getSVGNodeHeight()
	{
		return this.config.height - this.legendHeight - this.titleHeight - (this.xAxis.allLabelsVisible ? 0 : this.scrollBoxHeight);
	}

	getPlotAreaWidth()
	{
		return this.config.width - this.yAxis.getWidth();
	}

	getMarginLeft()
	{
		return this.yAxis.getWidth() + this.xAxis.labelWidth / 2;
	}

	public setSize(width: number, height: number)
	{
		this.config.width = width;
		this.config.height = height;
		this.root.style.width = this.config.width + 'px';
		this.root.style.height = this.config.height + 'px';
		this.update(false);

		let svgHeight = this.getSVGNodeHeight();
		this.svg.setAttribute("viewBox", "0 0 " + this.config.width + " " + svgHeight);
		this.svg.style.width = this.config.width + 'px';
		this.svg.style.height = svgHeight + 'px';
	}

	public update(animate: boolean)
	{
		this.yAxis.prepare(this.min, this.max);
		this.xAxis.prepare(this.getPlotAreaWidth(), this.yAxis.getWidth());

		this.yAxis.update(this.getPlotAreaHeight(), this.config.width + 50, animate);
		this.xAxis.update(this.getPlotAreaHeight(), this.yAxis.heightOfLabels, this.getPlotAreaWidth(), this.yAxis.getWidth(), this.scrollBox.getLeftPosition(), this.scrollBox.getRightPosition());

		this.series.forEach(s => s.update(this.getPlotAreaHeight(), this.getPlotAreaWidth(), this.getMarginLeft(), this.yAxis, this.xAxis));
		if (!this.xAxis.allLabelsVisible)
			this.scrollBox.update(
				 this.config.width,
				 this.scrollBoxHeight,
				 "0 0 " + this.config.width + " " + this.getSVGNodeHeight());
		else
			this.scrollBox.hide();
	}
}