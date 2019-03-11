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
	Width?: number;
	Height?: number;
	ParentNode: HTMLElement;
	Data: IChartData;
	XAxis?: IYAxisConfig;
	Title?: string;
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
		this.config.ParentNode.appendChild(this.root);

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
		this.svg.setAttribute("viewBox", "0 0 " + this.config.Width + " " + this.config.Height);

		createNode('div', this.root, "chart__title").innerText = this.config.Title;
		this.root.appendChild(this.svg);

		this.chartArea = createSVGNode('g', this.svg, {type: "area"});


		this.Series = [];
		let min = Number.MAX_VALUE,
			 max = Number.MIN_VALUE;

		this.config.Data.columns.forEach((c: Array<string | number>) =>
		{
			let id = c[0] as string;
			if (this.config.Data.types[id] == "x")
			{
				//create categoryAxis
			}
			else
			{
				this.Series.push(new Series(c,
					 this.config.Data.types[id],
					 this.config.Data.names[id],
					 this.config.Data.colors[id]
				));

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

		this.yAxis = new YAxis({Min: min, Max: max, ...this.config.XAxis}, this.chartArea);
		this.setSize(this.config.Width, this.config.Height);
	}

	public setSize(width: number, height: number)
	{
		this.config.Width = width;
		this.config.Height = height;
		this.root.style.width = this.config.Width + 'px';
		this.root.style.height = this.config.Height + 'px';
		this.svg.style.width = this.config.Width + 'px';
		this.svg.style.height = this.config.Height + 'px';
		this.yAxis.update(this.config.Height - this.legendHeight, this.config.Width);
	}
}