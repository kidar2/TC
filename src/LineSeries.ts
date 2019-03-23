import YAxis from "./Axis/YAxis";
import {createSVGNode, IHash, removeNode} from "./Util";
import XAxis, {ICategory} from "./Axis/XAxis";

interface ISeriesConfig {
	data: Array<string | number>;
	name: string;
	color: string;
}


export default class LineSeries {

	config: ISeriesConfig;
	parentNode: SVGElement;
	id: string;
	nodes: SVGElement[];
	private readonly hoverCircle: SVGElement;
	private indexToPoint: IHash<number>;
	visible: boolean;
	maxOnVisiblePart: number;
	private axisMax: number;
	private axisMin: number;
	private yAxis: YAxis;
	private xAxis: XAxis;
	private nodesPoints: { x: number, y: number }[][];


	public constructor(config: ISeriesConfig,
							 yAxis: YAxis,
							 xAxis: XAxis,
							 parentNode: SVGElement)
	{
		this.yAxis = yAxis;
		this.xAxis = xAxis;
		this.visible = true;
		this.config = config;
		this.parentNode = parentNode;
		this.id = config.data[0] as string;
		config.data.shift();   //remove id item;
		this.hoverCircle = createSVGNode("circle", null, {
			r: 4,
			fill: "white",
			stroke: this.config.color
		});
		this.hoverCircle.classList.add('chart__tooltip-obj');
	}

	public update(areaHeight: number,
					  areaWidth: number,
					  marginLeft: number,
					  animateVisible: boolean,
					  animateSize: boolean)
	{

		this.axisMax = this.yAxis.getTopValue();
		this.axisMin = this.yAxis.getBottomValue();

		if (this.visible)
		{
			this.hideNodes(this.nodes, false, areaHeight);
			this.nodes = [];
			let nodesPoints: { x: number, y: number }[][] = [];
			this.maxOnVisiblePart = Number.MIN_VALUE;
			this.indexToPoint = {};
			let points = "",
				 pointsArr = [],
				 topValue = this.yAxis.getTopValue(),
				 bottomValue = this.yAxis.getBottomValue();

			for (let i = this.xAxis.getStartCategoryIndex(); i <= this.xAxis.getEndCategoryIndex(); i++)
			{
				let value = this.config.data[i] as number;

				if (value != null)
				{
					if (value > this.maxOnVisiblePart)
						this.maxOnVisiblePart = value;

					let y = areaHeight - this.yAxis.calcHeightByValue(value, topValue, bottomValue),
						 x = this.xAxis.getXByIndex(i) + marginLeft;
					if (points)
						points += ', ';
					points += x + " " + y;

					pointsArr.push({x, y});
					this.indexToPoint[i] = y;
				}
				else if (points)
				{
					nodesPoints.push(pointsArr);
					this.nodes.push(createSVGNode("polyline", null, {
						points,
						"series-id": this.id,
						fill: "transparent",
						stroke: this.config.color,
						'stroke-width': '2'
					}));
					points = "";
					pointsArr = [];
				}
			}

			if (points)
			{
				nodesPoints.push(pointsArr);
				this.nodes.push(createSVGNode("polyline", null, {
					points,
					"series-id": this.id,
					fill: "transparent",
					stroke: this.config.color,
					'stroke-width': '2'
				}));
			}

			if (animateSize && this.nodesPoints)
			{
				this.nodes.forEach((n, index) =>
				{
					let fromPoints = this.nodesPoints[index].map(p => p.x + " " + p.y).join(','),
						 toPoints = nodesPoints[index].map(p => p.x + " " + p.y).join(',');
					let animatePoints = createSVGNode("animate", n, {
						attributeName: "points",
						dur: "0.3s",
						"from": fromPoints,
						"to": toPoints,
						begin: "DOMNodeInserted",
						fill: "freeze",
						repeatCount: "1"
					});
					n.setAttribute("points", fromPoints);

					this.parentNode.appendChild(n);

					animatePoints.addEventListener('end', () =>
					{
						n.setAttribute("points", toPoints);
						removeNode(animatePoints);
					}, false);
				});
			}
			else
				this.showNodes(this.nodes, animateVisible, areaHeight);

			this.nodesPoints = nodesPoints;
		}
		else
			this.hideNodes(this.nodes, animateVisible, areaHeight);
	}

	private showNodes(nodes: SVGElement[], animate: boolean, areaHeight: number)
	{
		if (!nodes || !nodes.length)
			return;

		if (!animate)
			nodes.forEach(n => this.parentNode.appendChild(n));
		else
		{
			nodes.forEach(n =>
			{
				let animateFromTop = (this.maxOnVisiblePart > (this.axisMax + this.axisMin) / 2),
					 fromAttr = "0 " + (animateFromTop ? -areaHeight : areaHeight);

				n.setAttribute("transform", `translate(${fromAttr})`);
				let animateTransform = createSVGNode("animateTransform", n, {
					type: "translate",
					attributeName: "transform",
					dur: "0.3s",
					"from": fromAttr,
					to: "0 0",
					begin: "DOMNodeInserted",
					fill: "freeze",
					repeatCount: "1"
				});

				let animateOpacity = createSVGNode("animate", n, {
					attributeName: "opacity",
					attributeType: "CSS",
					dur: "0.3s",
					"from": "0",
					to: "1",
					begin: "DOMNodeInserted",
					fill: "freeze",
					repeatCount: "1"
				});
				animateTransform.addEventListener('endEvent', () =>
				{
					n.removeAttribute("transform");
					removeNode(animateOpacity);
					removeNode(animateTransform);
				}, false);

				this.parentNode.appendChild(n);
			});
		}
	}

	private hideNodes(nodes: SVGElement[], animate: boolean, areaHeight: number)
	{
		if (!nodes || !nodes.length)
			return;

		if (!animate)
			nodes.forEach(n => removeNode(n));

		else
		{

			nodes.forEach(n =>
			{
				let animateTop = this.maxOnVisiblePart > (this.axisMax + this.axisMin) / 2;

				createSVGNode("animateTransform", n, {
					type: "translate",
					attributeName: "transform",
					dur: "0.7s",
					to: "0 " + (animateTop ? (-areaHeight) : areaHeight),
					begin: "DOMNodeInserted",
					fill: "freeze",
					repeatCount: "1"
				});

				let animateOpacity = createSVGNode("animate", n, {
					attributeName: "opacity",
					attributeType: "CSS",
					dur: "0.3s",
					"from": "1",
					to: "0",
					begin: "DOMNodeInserted",
					fill: "freeze",
					repeatCount: "1"
				});
				animateOpacity.addEventListener('end', () =>
				{
					removeNode(animateOpacity.parentNode as HTMLElement);
				}, false);
			});
		}
	}

	showToolTipPoint(category: ICategory)
	{
		if (this.indexToPoint[category.index] != null && this.visible)
		{
			if (!this.hoverCircle.parentNode)
				this.parentNode.appendChild(this.hoverCircle);
			this.hoverCircle.setAttribute("cx", category.x + '');
			this.hoverCircle.setAttribute("cy", this.indexToPoint[category.index] + "");
		}
	}

	hideToolTipPoint()
	{
		removeNode(this.hoverCircle);
	}
}