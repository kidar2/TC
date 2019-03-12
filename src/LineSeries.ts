interface ISeriesConfig {
	data: Array<string | number>,
	type: string,
	name: string,
	color: string,
	parentNode: SVGElement;
}


export default class LineSeries {

	config: ISeriesConfig;

	public constructor(config: ISeriesConfig)
	{
		this.config = config;
	}

	public update()
	{
		//polyline
	}
}