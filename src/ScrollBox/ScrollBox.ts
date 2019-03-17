import './ScrollBox.scss';
import {createNode} from "./../Util";


export default class ScrollBox {
	parentNode: HTMLElement;
	root: HTMLElement;
	svg: SVGSVGElement;
	originalSVGNode: SVGSVGElement;
	seriesGroup: SVGElement;
	private scrollNode: HTMLElement;
	private leftResizer: HTMLElement;
	private rightResizer: HTMLElement;
	private leftPosition: number;
	private rightPosition: number;
	private leftNode: HTMLElement;
	private rightNode: HTMLElement;

	constructor(parentNode: HTMLElement, svgNode: SVGSVGElement)
	{
		this.originalSVGNode = svgNode;
		this.parentNode = parentNode;
		this.root = createNode('div', this.parentNode);
		this.root.classList.add("chart__scroll-box");
		this.root.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><g type="series"></g></svg>
<div class="chart__scroll">
<div class="chart__scroll-left"></div>
<div class="chart__scroll-left-resizer"></div>
<div class="chart__scroll-center"></div>
<div class="chart__scroll-right-resizer"></div>
<div class="chart__scroll-right"></div>
</div>`;

		this.svg = this.root.querySelector('svg');
		this.seriesGroup = this.svg.querySelector('g');
		this.scrollNode = this.root.querySelector('.chart__scroll');
		this.leftResizer = this.root.querySelector('.chart__scroll-left-resizer');
		this.rightResizer = this.root.querySelector('.chart__scroll-right-resizer');
		this.leftNode = this.root.querySelector('.chart__scroll-left');
		this.rightNode = this.root.querySelector('.chart__scroll-right');
	}

	update(width: number, height: number, viewBox: string)
	{
		this.root.style.display = '';
		this.seriesGroup.innerHTML = '';
		let nodes = this.originalSVGNode.querySelectorAll('polyline');
		for (let i = 0; i < nodes.length; i++)
			this.seriesGroup.appendChild(nodes.item(i).cloneNode());

		this.svg.style.width = width + 'px';
		this.svg.style.height = height + 'px';
		this.svg.setAttribute("viewBox", viewBox);

		this.scrollNode.style.width = width + 'px';
		this.scrollNode.style.height = height + 'px';

		if (this.leftPosition == null)
		{
			this.leftNode.style.width = '0px';
		}

		if (this.rightPosition == null)
		{
			this.rightNode.style.width = '0px';
		}
	}


	hide()
	{
		this.root.style.display = 'none';
	}
}