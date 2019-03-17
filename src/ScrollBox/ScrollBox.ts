import './ScrollBox.scss';
import {createNode} from "./../Util";


export default class ScrollBox {
	private parentNode: HTMLElement;
	private root: HTMLElement;
	private svg: SVGSVGElement;
	private originalSVGNode: SVGSVGElement;
	private seriesGroup: SVGElement;
	private scrollNode: HTMLElement;
	private leftResizer: HTMLElement;
	private rightResizer: HTMLElement;
	public leftPosition: number;
	public rightPosition: number;
	private leftNode: HTMLElement;
	private rightNode: HTMLElement;
	private resizingNode: HTMLElement;

	private mouseMoveBinded: any;
	private mouseUpBinded: any;
	private marginLeft: number;
	private rectSereies: ClientRect | DOMRect;
	private centerNode: HTMLElement;
	private centerOffsetX: number;
	private centerWidth: number;

	constructor(parentNode: HTMLElement, svgNode: SVGSVGElement)
	{
		this.originalSVGNode = svgNode;
		this.parentNode = parentNode;
		this.root = createNode('div', this.parentNode);
		this.root.classList.add("chart__scroll-box");
		this.root.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><g type="series"></g></svg>
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
		this.centerNode = this.root.querySelector('.chart__scroll-center');

		this.leftResizer.addEventListener("mousedown", (e: MouseEvent) =>
		{
			this.resizingNode = this.leftNode;
			this.resizerMouseDown(e);
		});
		this.rightResizer.addEventListener("mousedown", (e: MouseEvent) =>
		{
			this.resizingNode = this.rightNode;
			this.resizerMouseDown(e);
		});

		this.centerNode.addEventListener("mousedown", (e: MouseEvent) =>
		{
			this.resizingNode = null;
			this.resizerMouseDown(e);
		});
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


		this.scrollNode.style.height = height + 'px';

		this.rectSereies = (this.svg.firstChild as HTMLElement).getBoundingClientRect();
		let rootRect = (this.root as HTMLElement).getBoundingClientRect();

		this.marginLeft = this.rectSereies.left - rootRect.left;
		this.scrollNode.style.marginLeft = this.marginLeft + 'px';
		this.scrollNode.style.width = this.rectSereies.width + 'px';

		if (this.leftPosition == null)
			this.leftNode.style.width = '0px';
		else
			this.leftNode.style.width = this.leftPosition + 'px';

		if (this.rightPosition == null)
			this.rightNode.style.width = '0px';
		else
			this.rightNode.style.width = this.rightPosition + 'px';
	}

	private resizerMouseDown(e: MouseEvent)
	{
		this.centerOffsetX = e.offsetX;
		this.centerWidth = this.centerNode.offsetWidth;
		window.addEventListener("mouseup", this.mouseUpBinded = this.mouseUp.bind(this));
		window.addEventListener("mousemove", this.mouseMoveBinded = this.mouseMove.bind(this));
	}

	private mouseUp()
	{
		this.resizingNode = null;
		window.removeEventListener("mouseup", this.mouseUpBinded);
		window.removeEventListener("mousemove", this.mouseMoveBinded);
	}


	private mouseMove(e: MouseEvent)
	{
		let position = e.x - this.rectSereies.left;
		if (this.resizingNode == this.leftNode)
		{
			this.leftPosition = position;
			this.leftNode.style.width = position + 'px';
		}
		else if (this.resizingNode == this.rightNode)
		{
			this.rightPosition = this.rectSereies.width - position;
			this.rightNode.style.width = this.rightPosition + 'px';
		}
		else
		{
			//simple move of center node
			position -= this.centerOffsetX;
			this.leftPosition = position;
			this.rightPosition = this.rectSereies.width - position - this.centerWidth;
			this.leftNode.style.width = this.leftPosition + 'px';
			this.rightNode.style.width = this.rightPosition + 'px';
		}
	}

	hide()
	{
		this.root.style.display = 'none';
	}
}