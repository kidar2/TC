import './Legend.scss';
import LineSeries from "./../LineSeries";


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
			item.innerHTML = `<span class="chart__legend__item__circle" style="background-color: ${series.config.color}; border-color:${series.config.color}"> 
<svg version="1.1" viewBox="0 0 512 512" xml:space="preserve"
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><style type="text/css">
	.st0{fill:white;}
</style>
    <g><path class="st0" d="M235.1,386.3c-5.7,0-11.1-2.4-14.9-6.6l-104.1-116c-7.4-8.2-6.7-20.9,1.5-28.2c8.2-7.4,20.9-6.7,28.2,1.5   l86.8,96.8l131.6-199.1c6.1-9.2,18.5-11.7,27.7-5.7c9.2,6.1,11.7,18.5,5.7,27.7L251.8,377.4c-3.4,5.2-9,8.5-15.2,8.9   C236.1,386.3,235.6,386.3,235.1,386.3z"/></g></svg>
</span> ${series.config.name}`;
			item.setAttribute("series-id", series.id);
			item.addEventListener('click', (e) => this.onClick(e));
			this.root.appendChild(item);
		}
	}

	onClick(e: MouseEvent)
	{
		let item = (e.currentTarget as HTMLElement);
		let id = item.getAttribute("series-id");
		let svgItem = item.querySelector("svg");
		let circle = item.querySelector(".chart__legend__item__circle");
		svgItem.style.display = svgItem.style.display ? '' : 'none';
		if (svgItem.style.display == 'none')
			circle.classList.add('chart__legend__item__circle--selected');
		else
			circle.classList.remove('chart__legend__item__circle--selected');
		if (id && this.itemClickCallback)
			this.itemClickCallback(id);
	}
}