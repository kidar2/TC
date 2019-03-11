export function createSVGNode(tag: string, attrs: any): SVGElement
{
	let res = document.createElementNS("http://www.w3.org/2000/svg", tag);
	for (let p in attrs)
		res.setAttribute(p, attrs[p]);
	return res;
}