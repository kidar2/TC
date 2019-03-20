let numeral = require('numeral');

export function createSVGNode(tag: string, parentNode?: SVGElement, attrs?: any): SVGElement
{
	let res = document.createElementNS("http://www.w3.org/2000/svg", tag);
	if (attrs)
		for (let p in attrs)
			res.setAttribute(p, attrs[p]);

	if (parentNode)
		parentNode.appendChild(res);
	return res;
}

export function createNode(tag: string, parentNode?: HTMLElement, className?: string): HTMLElement
{
	let res = document.createElement(tag);
	if (parentNode)
		parentNode.appendChild(res);
	if (className)
		res.classList.add(className);
	return res;
}

export function removeNode(node: Element)
{
	if (node && node.parentNode)
		node.parentNode.removeChild(node);
}

export interface IHash<T> {
	[key: string]: T
}

function isVerySmallValue(value: number)
{
	return Math.abs(value).toFixed(5) == '0.00000';
}


const powerIndexes = [1, 1000, 1000000, 1000000000, 1000000000000, 1000000000000000];
const suffixes = ["k", "M", "B", "Tr", "Q"];

export function formatValue(value: number, coef?: number)
{
	if (value == null)
		return "";

	if (!coef)
	{
		if (value > 1000)
			coef = 1000;
		else
			coef = 1;
	}
	let suffix = "";
	let format = "0,0.[00]";

	if (coef && powerIndexes.indexOf(coef) > -1)
	{
		let index = powerIndexes.indexOf(coef);
		suffix = suffixes[index - 1] || "";
		value = value / powerIndexes[index];

		if (isVerySmallValue(value))
			value = 0;  //слишком маленькое значение

		return numeral(value).format(format) + suffix;
	}
	else
	{
		if (isVerySmallValue(value))
			value = 0;

		if (Math.abs(value) < 1000)
		{

			return numeral(value).format(format);
		}

		let power = 5;
		for (let i = 0; i < powerIndexes.length; i++)
		{
			if (Math.abs(value / powerIndexes[i]) < 1000)
			{
				power = i;
				break;
			}
		}
		value /= Math.pow(1000, power);
		if (power)
			suffix = suffixes[power - 1] || "";


		if (!format)
			return value + suffix;
		return numeral(value).format(format) + suffix;
	}
}

let shortMonthNames = [
	"Jan", "Feb", "Mar",
	"Apr", "May", "Jun", "Jul",
	"Aug", "Sep", "Oct",
	"Nov", "Dec"
];

export function formatDate(date: Date)
{
	let day = date.getDate(),
		 monthIndex = date.getMonth(),
		 year = date.getFullYear();

	return shortMonthNames[monthIndex] + ' ' + day + ' ' + year;
}


/**
 * Calculate max size of strings
 * @param labels
 * @param fontSize
 */
export function calcSize(labels: string[], fontSize?: number): { width: number, height: number }
{
	let div = document.createElement("div");
	div.classList.add("calc-size-node");
	div.innerHTML = labels.join("<br/>");
	if (fontSize)
		div.style.fontSize = fontSize + 'px';

	document.body.appendChild(div);
	let res = div.getBoundingClientRect();
	document.body.removeChild(div);
	return res;
}

/**
 * Calculation Top value for YAxis based on max value of view data on chart
 */
export function getTopValue(max: number)
{
	let countR = max.toFixed(0).length,
		 topValue = Math.pow(10, countR);

	let delta = topValue - max,
		 x = Math.floor(delta * 10 / topValue);

	return topValue - x * Math.pow(10, countR - 1);
}