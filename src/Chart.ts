import './styles.scss';
import YAxis, {IYAxisConfig} from "./YAxis";
import {IHash} from "./Util";
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
}


export default class Chart {

	config: IChartConfig;
	private root: HTMLDivElement;
	private svg: SVGSVGElement;
	private yAxis: YAxis;
	private Series: Series[];

	public constructor(config: IChartConfig)
	{
		this.config = config;
		this.render();
	}

	private render()
	{
		this.root = document.createElement("div");
		this.root.classList.add('chart');
		this.config.ParentNode.appendChild(this.root);

		this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement;
		this.svg.setAttribute("viewBox", "0 0 " + this.config.Width + " " + this.config.Height);

		this.root.appendChild(this.svg);


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
					if (c[i] > max)
						max = c[i] as number;

					if (c[i] < min)
						min = c[i] as number;
				}
			}
		});

		this.yAxis = new YAxis({Min: min, Max: max, ...this.config.XAxis}, this.svg);
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
		this.yAxis.update(this.config.Height);
	}
}