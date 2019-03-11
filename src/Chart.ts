import './styles.scss';
import YAxis, {IYAxisConfig} from "./YAxis";
import {createNode, createSVGNode, IHash} from "./Util";
import Series from "./Series";


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
	xAxis?: IYAxisConfig;
	title?: string;
}


export default class Chart {

	config: IChartConfig;
	private root: HTMLDivElement;
	private svg: SVGSVGElement;
	private chartArea: SVGElement;
	private legendNode: SVGElement;
	private yAxis: YAxis;
	private Series: Series[];

	private legendHeight: number;
	private titleHeight: number;

	public constructor(config: IChartConfig)
	{
		this.config = config;
		this.legendHeight = 50;
		this.render();
	}

	private render()
	{
		this.root = document.createElement("div");
		this.root.classList.add('chart');
		this.config.parentNode.appendChild(this.root);

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
		this.svg.setAttribute("viewBox", "0 0 " + this.config.width + " " + this.config.height);

		createNode('div', this.root, "chart__title").innerText = this.config.title;
		this.root.appendChild(this.svg);

		this.chartArea = createSVGNode('g', this.svg, {type: "area"});


		this.Series = [];
		let min = Number.MAX_VALUE,
			 max = Number.MIN_VALUE;

		this.config.data.columns.forEach((c: Array<string | number>) =>
		{
			let id = c[0] as string;
			if (this.config.data.types[id] == "x")
			{
				//create categoryAxis
			}
			else
			{
				this.Series.push(new Series({
					data: c,
					type: this.config.data.types[id],
					name: this.config.data.names[id],
					color: this.config.data.colors[id],
					parentNode: this.chartArea
				}));

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

		this.yAxis = new YAxis({min: min, max: max, ...this.config.xAxis}, this.chartArea);
		this.setSize(this.config.width, this.config.height);
		this.Series.forEach(s => s.update());
	}

	public setSize(width: number, height: number)
	{
		this.config.width = width;
		this.config.height = height;
		this.root.style.width = this.config.width + 'px';
		this.root.style.height = this.config.height + 'px';
		this.svg.style.width = this.config.width + 'px';
		this.svg.style.height = this.config.height + 'px';
		this.yAxis.update(this.config.height - this.legendHeight, this.config.width);
	}
}