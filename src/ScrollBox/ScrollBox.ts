import './ScrollBox.scss';
import {createNode} from "./../Util";
import LineSeries from "../LineSeries";


export default class ScrollBox {
	private readonly parentNode: HTMLElement;
	private root: HTMLElement;
	private svg: SVGSVGElement;
	private originalSVGNode: SVGSVGElement;
	private seriesGroup: SVGElement;
	private scrollNode: HTMLElement;
	private leftResizer: HTMLElement;
	private rightResizer: HTMLElement;
	private leftWidth: number;
	private rightWidth: number;
	private readonly leftNode: HTMLElement;
	private readonly rightNode: HTMLElement;
	private resizingNode: HTMLElement;

	private mouseMoveBinded: any;
	private mouseUpBinded: any;
	private marginLeft: number;
	private rectSereies: ClientRect | DOMRect;
	private centerNode: HTMLElement;
	private centerOffsetX: number;
	private centerWidth: number;
	private changedCallback: Function;

	private readonly RESIZER_WIDTH: number;

	private width: number;

	/**
	 *
	 * @param parentNode node for render
	 * @param svgNode  svg node with chart
	 * @param changedCallback call when scroll was changed
	 */
	constructor(parentNode: HTMLElement,
					svgNode: SVGSVGElement,
					changedCallback: Function)
	{
		this.RESIZER_WIDTH = 5;
		this.originalSVGNode = svgNode;
		this.parentNode = parentNode;
		this.changedCallback = changedCallback;
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

		if (this.seriesGroup.childNodes.length == 0)
		{
			let nodes = this.originalSVGNode.querySelectorAll('polyline');
			for (let i = 0; i < nodes.length; i++)
			{
				let polyline = nodes.item(i).cloneNode() as SVGElement;
				polyline.setAttribute('stroke-width', '1');
				polyline.setAttribute('fill', 'transparent');
				polyline.setAttribute("shape-rendering", "geometricPrecision");
				this.seriesGroup.appendChild(polyline);
			}
			this.svg.setAttribute("viewBox", viewBox);
		}
		this.svg.style.width = width + 'px';
		this.svg.style.height = height + 'px';


		this.scrollNode.style.height = height + 'px';

		this.rectSereies = (this.svg.firstChild as HTMLElement).getBoundingClientRect();
		let rootRect = (this.root as HTMLElement).getBoundingClientRect();

		this.marginLeft = this.rectSereies.left - rootRect.left;
		this.scrollNode.style.marginLeft = this.marginLeft + 'px';
		this.scrollNode.style.width = this.rectSereies.width + 'px';

		if (this.leftWidth == null)
			this.leftNode.style.width = '0px';
		else
		{
			if (this.width != width)
				this.leftWidth = this.leftWidth * width / this.width;
			this.leftNode.style.width = this.leftWidth + 'px';
		}

		if (this.rightWidth == null)
			this.rightNode.style.width = '0px';
		else
		{
			if (this.width != width)
				this.rightWidth = this.rightWidth * width / this.width;
			this.rightNode.style.width = this.rightWidth + 'px';
		}

		this.width = width;
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
		this.changedCallback();
	}


	private mouseMove(e: MouseEvent)
	{
		let position = e.x - this.rectSereies.left;
		if (this.resizingNode == this.leftNode)
		{
			if (position < 0)
				position = 0;
			if (this.checkMinSize(position, this.rightWidth))
			{
				this.leftWidth = position;
				this.leftNode.style.width = position + 'px';
			}
		}
		else if (this.resizingNode == this.rightNode)
		{
			let w = this.rectSereies.width - position;
			if (w < 0)
				w = 0;
			if (this.checkMinSize(this.leftWidth, w))
			{
				this.rightWidth = w;
				this.rightNode.style.width = this.rightWidth + 'px';
			}
		}
		else
		{
			//simple move of center node
			position -= this.centerOffsetX + this.RESIZER_WIDTH;
			if (position < 0)
				position = 0;

			let rightw = this.rectSereies.width - position - this.centerWidth - this.RESIZER_WIDTH * 2;

			if (rightw >= 0)
			{
				this.leftWidth = position;
				this.leftNode.style.width = this.leftWidth + 'px';
			}
			else
				rightw = 0;

			this.rightWidth = rightw;
			this.rightNode.style.width = this.rightWidth + 'px';
		}
		this.changedCallback();
	}

	private checkMinSize(newLeftWidth: number, newRightWidth: number)
	{
		if (!this.leftWidth || !this.rightWidth)
			return true;

		if (newLeftWidth < 0 || newRightWidth < 0)
			return false;

		return parseInt(this.scrollNode.style.width) - (newRightWidth + newLeftWidth) >= 50;
	}

	public getLeftPosition()
	{
		let sWidth = parseInt(this.leftNode.style.width);
		return isNaN(sWidth) || sWidth == 0 ? null : sWidth + this.RESIZER_WIDTH;
	}

	public getRightPosition()
	{
		let sWidth = parseInt(this.rightNode.style.width);
		return isNaN(sWidth) || sWidth == 0 ? null : parseInt(this.scrollNode.style.width) - sWidth - 2 * this.RESIZER_WIDTH;
	}

	public hide()
	{
		this.root.style.display = 'none';
	}

	public updateSeriesVisible(s: LineSeries)
	{
		let nodes = this.svg.querySelectorAll(`[series-id="${s.id}"]`);
		for (let i = 0; i < nodes.length; i++)
		{
			let polyline = nodes.item(i) as SVGElement;
			polyline.style.display = s.visible ? '' : 'none';
		}
	}
}