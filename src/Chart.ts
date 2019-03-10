import 'styles.scss';

interface IChartConfig {
	Width?: number;
	Height?: number;
	ParentNode: HTMLElement;
	Series: [{
		Type?: string;
		Name?: string;
		Data?: [{ y?: number }]
	}],
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
	}
}