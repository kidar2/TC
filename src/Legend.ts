import './Legend.scss';
import LineSeries from "./LineSeries";


export default class Legend {

	parentNode: HTMLElement;
	series: LineSeries[];
	root: HTMLDivElement;
	itemClickCallback: Function;

	constructor(series: LineSeries[],
					parentNode: HTMLElement,
					height: number,
					itemClick: Function)
	{
		this.itemClickCallback = itemClick;
		this.series = series;
		this.parentNode = parentNode;
		this.root = document.createElement("div");
		this.root.classList.add('chart__legend');
		this.root.style.height = height + 'px';
		this.parentNode.appendChild(this.root);
	}

	public update()
	{
		this.root.innerHTML = '';
		for (let series of this.series)
		{
			let item = document.createElement("div");
			item.classList.add('chart__legend__item');
			item.innerText = series.config.name;
			item.setAttribute("series-id", series.id);
			item.addEventListener('click', (e) => this.onClick(e));
			this.root.appendChild(item);
		}
	}

	onClick(e: MouseEvent)
	{
		let id = (e.target as HTMLElement).getAttribute("series-id");
		if (this.itemClickCallback)
			this.itemClickCallback(id);
	}
}