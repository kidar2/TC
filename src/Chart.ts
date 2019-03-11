import './styles.scss';
import YAxis from "./YAxis";

interface IChartConfig {
	Width?: number;
	Height?: number;
	ParentNode: HTMLElement;
	Series: {
		Type?: string;
		Name?: string;
		Data?: { y: number }[]
	}[],
	XAxis: {
		Categories: string[];
	}
}


export default class Chart {

	config: IChartConfig;
	private root: HTMLDivElement;
	private svg: SVGSVGElement;
	private yAxis: YAxis;

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
		this.setSize(this.config.Width, this.config.Height);

		let min = 0, max = 100;

		this.yAxis = new YAxis({Min: min, Max: max, Color: "black"}, this.svg);
		this.yAxis.update(this.config.Height);
	}

	public setSize(width: number, height: number)
	{
		this.config.Width = width;
		this.config.Height = height;
		this.root.style.width = this.config.Width + 'px';
		this.root.style.height = this.config.Height + 'px';
		this.svg.style.width = this.config.Width + 'px';
		this.svg.style.height = this.config.Height + 'px';
	}
}