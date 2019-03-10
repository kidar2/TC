import './styles.scss';

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

	public constructor(config: IChartConfig)
	{
		this.config = config;
		this.render();
	}

	private render()
	{
		this.root = document.createElement("div");
		this.root.classList.add('chart');
		this.root.style.width = this.config.Width + 'px';
		this.root.style.height = this.config.Height + 'px';
		this.config.ParentNode.appendChild(this.root);
	}
}