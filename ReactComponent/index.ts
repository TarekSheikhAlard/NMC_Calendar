import {IInputs, IOutputs} from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReactSampleCalendar, { IProps,IKeys } from "./ReactComponent";
import DataSetInterfaces = ComponentFramework.PropertyHelper.DataSetApi;
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export class ReactComponent implements ComponentFramework.StandardControl<IInputs, IOutputs> {

	/**
	 * Empty constructor.
	 */
	private _value: string;
	private _notifyOutputChanged:() => void;
	private _container: HTMLDivElement;
	private _props: IProps;
	private _keys: IKeys;

	public refreshData(evt: Event) : void
	{
		//this._value = (this.inputElement.value as any);
		this._notifyOutputChanged();
	}

	constructor()
	{

	}

	/**
	 * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
	 * Data-set values are not initialized here, use updateView.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
	 * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
	 * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
	 * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
	 */
	public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement): void
	{
		// Add control initialization code
		

		
		this._container = document.createElement("div");
		this._container.setAttribute("style", "height:100%");
		this._keys =
		{
			subject:context.parameters.eventFieldName.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.eventFieldName.raw):"",
			startdatefield:context.parameters.eventFieldStart.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.eventFieldStart.raw):"",
			enddatefield:context.parameters.eventFieldEnd.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.eventFieldEnd.raw):"",
		    slotentityname:context.parameters.slotEntityName.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.slotEntityName.raw):"",
			eventsentityname:context.parameters.eventColorEntityName.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.eventColorEntityName.raw):"",
			eventsentitycolor:context.parameters.eventColorHexValue.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.eventColorHexValue.raw):"",
			quickcreateform:context.parameters.usequickcreateform.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.usequickcreateform.raw):"",
			openInNewWindow:context.parameters.openInNewWindow.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.openInNewWindow.raw):"",
	        eventsdefaultcolor: context.parameters.eventColorDefaultValue.raw? this.getFieldName(context.parameters.sampleDataSet,context.parameters.eventColorDefaultValue.raw):"",

		};
		this._props = {
			pcfContext: context,
			Key:this._keys 

		}
		container.appendChild(this._container);
		context.parameters.sampleDataSet.paging.setPageSize(5000);
	}

	public getFieldName(dataSet: ComponentFramework.PropertyTypes.DataSet , fieldName: string): string {
		//if the field name does not contain a .  or linking is null which could be the case in a canvas app
		// when using a collection  then just return the field name
		if (fieldName.indexOf('.') === -1 || !dataSet.linking) return fieldName;
		
		//otherwise we need to determine the alias of the linked entity
		var linkedFieldParts = fieldName.split('.');
		linkedFieldParts[0] = dataSet.linking.getLinkedEntities().find(e => e.name === linkedFieldParts[0].toLowerCase())?.alias || "";
		return linkedFieldParts.join('.');
	}
	/**
	 * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
	 * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
	 */
	public updateView(context: ComponentFramework.Context<IInputs>): void
	{
		// Add code to update control view
		//this._value = context.parameters.sampleDataSet.records;

        //alert("updateView")
		
		var dataSet = context.parameters.sampleDataSet;
		
		if (dataSet.loading) return;

		if (context.mode.allocatedHeight === -1 && dataSet.paging.hasNextPage) {
			//if data set has additional pages retrieve them before running anything else
			// do not do this for canvas apps since the loadNextPage is currently broken
			dataSet.paging.loadNextPage();
			return;
		}


		this._props = {
			pcfContext: context,
			Key:this._keys
		}


		ReactDOM.render(
			React.createElement(ReactSampleCalendar, this._props)
			, this._container
		);
	}

	/**
	 * It is called by the framework prior to a control receiving new data.
	 * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as “bound” or “output”
	 */
	public getOutputs(): IOutputs
	{
		return {
			sampleProperty : this._value
		};
	}

	/**
	 * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
	 * i.e. cancelling any pending remote calls, removing listeners, etc.
	 */
	public destroy(): void
	{
		// Add code to cleanup control if necessary
		ReactDOM.unmountComponentAtNode(this._container);
	}

}
