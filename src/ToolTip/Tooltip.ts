import './tooltip.scss';
import {removeNode} from "./../Util";

export default class Tooltip {

	node: HTMLElement;
	parentNode: HTMLElement;
	currentLabel: string;

	constructor(parentNode: HTMLElement)
	{
		this.node = document.createElement("div");
		this.node.classList.add("chart__tooltip");
		this.parentNode = parentNode;
	}


	hide()
	{
		removeNode(this.node);
		this.currentLabel = null;
	}

	show(x: number,
		  y: number,
		  seriesValues: { name: string, value: number, color: string }[],
		  pointLabel: string)
	{
		this.node.style.left = x + 10 + 'px';  //+10 for move left from cursor
		this.node.style.top = y + 'px';

		if (this.currentLabel == pointLabel)
			return;

		this.currentLabel = pointLabel;

		if (!this.node.parentNode)
			this.parentNode.appendChild(this.node);

		let str = seriesValues.map(ser => `<div style="color:${ser.color}" class="chart__tooltip__ser_item"> 
<span class="chart__tooltip__ser-value">${ser.value}</span> 
<br/>
<span class="chart__tooltip__ser-name">${ser.name}</span>
</div>`).join('');


		this.node.innerHTML = `<div class="chart__tooltip__label">${pointLabel}</div><div >${str}</div>`;   //todo xss
	}
}