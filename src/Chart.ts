import './chart.scss';
import YAxis, {IYAxisConfig} from "./YAxis";
import XAxis, {IXAxisConfig} from "./XAxis";
import {createNode, createSVGNode, IHash} from "./Util";
import LineSeries from "./LineSeries";
import Tooltip from "./Tooltip";
import Legend from "./Legend";


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
	private titleHeight: number;
	private tooltip: Tooltip;
	private legend: Legend;


	public constructor(config: IChartConfig)
	{
		this.config = config;
		this.legendHeight = 50;
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

		this.chartArea = createSVGNode('g', this.svg, {type: "area"});


		this.series = [];
		let min = Number.MAX_VALUE,
			 max = Number.MIN_VALUE;

		this.config.data.columns.forEach((c: Array<string | number>) =>
		{
			let id = c[0] as string;
			if (this.config.data.types[id] == "x")
			{
				this.xAxis = new XAxis({categories: c, ...this.config.xAxis}, this.chartArea);
			}
			else
			{
				this.series.push(new LineSeries({
					data: c,
					type: this.config.data.types[id],
					name: this.config.data.names[id],
					color: this.config.data.colors[id]
				}, this.chartArea));

				for (let i = 1; i < c.length; i++)
				{
					if (c[i] != null)
					{
						if (c[i] > max)
							max = c[i] as number;

						if (c[i] < min)
							min = c[i] as number;
					}
				}
			}
		});

		this.yAxis = new YAxis({min: min, max: max, ...this.config.yAxis}, this.chartArea);
		this.setSize(this.config.width, this.config.height);
		this.svg.addEventListener("mousemove", (e: MouseEvent) => this._onMouseMove(e));
		this.svg.addEventListener("mouseout", () => this._hideToolTip());

		this.tooltip = new Tooltip(this.root);
		this.legend = new Legend(this.series, this.root, this.legendHeight, (serId: string) => this.onLegendItemClick(serId));
		this.legend.update();
	}

	_hideToolTip()
	{
		this.tooltip.hide();
		this.xAxis.hideTooltipLine();
		this.series.forEach(s => s.hideToolTipPoint());
	}

	_onMouseMove(e: MouseEvent)
	{
		let category = this.xAxis.getCategory(e.offsetX);

		if (!category)
		{
			this._hideToolTip();
		}
		else
		{
			let valueIndex = this.xAxis.getIndexOfCategory(category);
			let seriesValues = [];
			for (let i = 1; i < this.config.data.columns.length; i++)  //first array is category axis
			{
				let id = (this.config.data.columns[i] as any)[0],
					 value = this.config.data.columns[i][valueIndex];
				if (value != null)
					seriesValues.push({
						name: this.config.data.names[id],
						value: value,
						color: this.config.data.colors[id]
					});
			}

			this.tooltip.show(e.offsetX, e.offsetY + this.titleHeight, seriesValues, category.label);
			this.xAxis.showTooltipLine(category, this.getPlotAreaHeight());
			this.series.forEach(s => s.showToolTipPoint(category));
		}
	}

	onLegendItemClick(serId: string)
	{
		let s = this.series.find(s => s.id == serId);
		s.setIsVisible(!s.visible);
		this.update();
	}

	getPlotAreaHeight()
	{
		return this.config.height - this.legendHeight - this.titleHeight - this.xAxis.LABEL_MARGIN_TOP;
	}

	getPlotAreaWidth()
	{
		return this.config.width - this.yAxis.getWidth();
	}

	public setSize(width: number, height: number)
	{
		this.config.width = width;
		this.config.height = height;
		this.root.style.width = this.config.width + 'px';
		this.root.style.height = this.config.height + 'px';
		let svgHeight = (this.config.height - this.legendHeight - this.titleHeight);
		this.svg.setAttribute("viewBox", "0 0 " + this.config.width + " " + svgHeight);
		this.svg.style.width = this.config.width + 'px';
		this.svg.style.height = svgHeight + 'px';
		this.update();
	}

	public update()
	{
		this.yAxis.update(this.getPlotAreaHeight(), this.config.width + 50);
		this.xAxis.update(this.getPlotAreaHeight(), this.getPlotAreaWidth(), this.yAxis.getWidth());
		this.series.forEach(s => s.update(this.getPlotAreaHeight(), this.getPlotAreaWidth(), this.yAxis, this.xAxis));
	}
}