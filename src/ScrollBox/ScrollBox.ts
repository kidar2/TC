import './ScrollBox.scss';
import {createNode, createSVGNode, removeNode} from "./../Util";
import LineSeries from "../LineSeries";
import YAxis from "../Axis/YAxis";
import XAxis from "../Axis/XAxis";

const IsTouch = !!('ontouchstart' in window);

export default class ScrollBox {
	private readonly parentNode: HTMLElement;
	private root: HTMLElement;
	private svg: SVGSVGElement;

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
	private centerNode: HTMLElement;
	private centerOffsetX: number;
	private centerWidth: number;
	private changedCallback: Function;

	private nodes: SVGElement[];

	private yAxis: YAxis;
	private xAxis: XAxis;
	private topValue: number;
	private bottomValue: number;

	private readonly RESIZER_WIDTH: number;

	private width: number;
	private scrollNodeRect: any;

	/**
	 *
	 * @param parentNode node for render
	 * @param svgNode  svg node with chart
	 * @param changedCallback call when scroll was changed
	 */
	constructor(parentNode: HTMLElement,
					yAxis: YAxis,
					xAxis: XAxis,
					changedCallback: Function)
	{
		this.RESIZER_WIDTH = 5;
		this.yAxis = yAxis;
		this.xAxis = xAxis;
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

		let eventName = IsTouch ? 'touchstart' : 'mousedown';
		this.leftResizer.addEventListener(eventName, (e: MouseEvent) =>
		{
			this.resizingNode = this.leftNode;
			this.resizerMouseDown(e);
		});
		this.rightResizer.addEventListener(eventName, (e: MouseEvent) =>
		{
			this.resizingNode = this.rightNode;
			this.resizerMouseDown(e);
		});

		this.centerNode.addEventListener(eventName, (e: MouseEvent) =>
		{
			this.resizingNode = null;
			this.resizerMouseDown(e);
		});
	}


	public update(areaWidth: number,
					  areaHeight: number,
					  series: LineSeries[],
					  marginLeft: number)
	{
		this.root.style.display = '';

		areaWidth -= this.xAxis.config.marginRight;

		if (this.nodes)
			this.nodes.forEach(n => removeNode(n));
		this.nodes = [];
		this.svg.setAttribute("viewBox", "0 0 " + areaWidth + " " + areaHeight);
		this.svg.style.width = areaWidth + 'px';
		this.svg.style.height = areaHeight + 'px';

		if (this.topValue == null)
			this.topValue = this.yAxis.getTopValue();
		if (this.bottomValue == null)
			this.bottomValue = this.yAxis.getBottomValue();

		let labelScale = this.xAxis.calcScaleX(series[0].config.data.length, areaWidth);

		for (let ser of series)
		{
			if (ser.visible)
			{
				let points = "";
				for (let i = 0; i < ser.config.data.length; i++)
				{
					let value = ser.config.data[i] as number;

					if (value != null)
					{
						let y = areaHeight - this.yAxis.calcHeightByValue(value, this.topValue, this.bottomValue, areaHeight),
							 x = labelScale[i].x + marginLeft;
						if (points)
							points += ', ';
						points += x + " " + y;
					}
					else if (points)
					{
						this.nodes.push(createSVGNode("polyline", this.svg, {
							points,
							fill: "transparent",
							"series-id": ser.id,
							stroke: ser.config.color,
							'stroke-width': '1'
						}));
						points = "";
					}
				}

				if (points)
					this.nodes.push(createSVGNode("polyline", this.svg, {
						points,
						"series-id": ser.id,
						fill: "transparent",
						stroke: ser.config.color,
						'stroke-width': '1'
					}));
			}
		}


		this.scrollNode.style.height = areaHeight + 'px';

		this.marginLeft = marginLeft;
		this.scrollNode.style.marginLeft = this.marginLeft + 'px';
		this.scrollNode.style.width = areaWidth - this.marginLeft + 'px';

		if (this.leftWidth == null)
			this.leftNode.style.width = '0px';
		else
		{
			if (this.width != areaWidth)
				this.leftWidth = this.leftWidth * areaWidth / this.width;
			this.leftNode.style.width = this.leftWidth + 'px';
		}

		if (this.rightWidth == null)
			this.rightNode.style.width = '0px';
		else
		{
			if (this.width != areaWidth)
				this.rightWidth = this.rightWidth * areaWidth / this.width;
			this.rightNode.style.width = this.rightWidth + 'px';
		}

		this.width = areaWidth;
	}

	private resizerMouseDown(e: MouseEvent)
	{
		this.centerOffsetX = IsTouch ? (e as any).changedTouches[0].clientX - this.leftWidth : e.offsetX;
		this.centerWidth = this.centerNode.offsetWidth;
		window.addEventListener(IsTouch ? 'touchend' : "mouseup", this.mouseUpBinded = this.mouseUp.bind(this));
		window.addEventListener(IsTouch ? 'touchmove' : "mousemove", this.mouseMoveBinded = this.mouseMove.bind(this));
		this.scrollNodeRect = this.scrollNode.getBoundingClientRect();
	}

	private mouseUp()
	{
		this.resizingNode = null;
		window.removeEventListener(IsTouch ? 'touchend' : "mouseup", this.mouseUpBinded);
		window.removeEventListener(IsTouch ? 'touchmove' : "mousemove", this.mouseMoveBinded);
		this.changedCallback();
	}


	private mouseMove(e: MouseEvent)
	{
		let position = (IsTouch ? (e as any).changedTouches[0].clientX : e.clientX) - this.scrollNodeRect.x;
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
			let w = this.width - position - this.marginLeft;
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
			if (IsTouch)
				position = position + this.marginLeft - this.centerOffsetX + this.RESIZER_WIDTH;
			else
				position = position - this.centerOffsetX - this.RESIZER_WIDTH;

			if (position < 0)
				position = 0;

			let rightw = this.width - position - this.centerWidth - this.RESIZER_WIDTH * 2 - this.marginLeft;

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