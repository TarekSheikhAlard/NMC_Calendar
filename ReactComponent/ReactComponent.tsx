import * as React from 'react';
import {IInputs, IOutputs} from "./generated/ManifestTypes";
import FullCalendar, { EventClickArg, EventSourceInput } from '@fullcalendar/react'// must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin , { Draggable } from '@fullcalendar/interaction' // a plugin!
import timeGridPlugin from '@fullcalendar/timegrid'
import { debug } from 'console';
import mobiscroll from '@mobiscroll/react-lite';
 // a plugin!


 export interface IProps {
  pcfContext: ComponentFramework.Context<IInputs>,
  Key: IKeys 
  


}

export interface IKeys {
subject:string,
startdatefield:string,
enddatefield:string,
slotentityname:string,
eventsentityname:string,
eventsentitycolor:string,
eventsdefaultcolor:string,
quickcreateform:string,
openInNewWindow:string
}

function formatDateAsParameterString(date: Date | null){

  //months are zero index so don't forget to add one :)
  return (date!.getMonth() + 1) + "/" +
  date!.getDate() + "/" +
  date!.getFullYear() + " " +
  date!.getHours() + ":" +
  date!.getMinutes() + ":" +
  date!.getSeconds();
}



function addHoursToDate(date:Date, hours:number):Date {
  return new Date(new Date(date).setHours(date.getHours() + hours));
}






type MyState = {  isLoaded: boolean,  items: any[] };

export default class ReactSampleCalendar extends React.Component<IProps, MyState> {

  constructor(props: Readonly<IProps>)
  {
    super(props);
    this.state = {
      items: [],
      isLoaded: false

    };
  }

 componentDidMount() {
  
   
    this.setState({
      isLoaded: true,
      items:  this.getEvents(this.props.pcfContext)
    });
  }

//subject
//scheduledstart
//scheduledend
//activitytypecode
getEvents(pcfContext: ComponentFramework.Context<IInputs>) :any []
{
  let dataSet = pcfContext.parameters.sampleDataSet;
  let totalRecordCount = dataSet.sortedRecordIds.length;
  let newEvents: any[] = [];
  //alert(this.props.Key.subject + "/ \\" +this.props.Key.startdatefield + " " +this.props.Key.enddatefield );
  let entitynames: string[] = this.props.Key.eventsentityname.toString().split(";");
  let entityColors: string[] = this.props.Key.eventsentitycolor.toString().split(";");
  for (let i = 0; i < totalRecordCount; i++) {
    var recordId = dataSet.sortedRecordIds[i];
    var record = dataSet.records[recordId] ;
    var entityReference1= record.getValue('activitytypecode');     
    var name = record.getValue(this.props.Key.subject.toString()) as string;
    var start1 = record.getValue(this.props.Key.startdatefield.toString());
    var end1 = record.getValue(this.props.Key.enddatefield.toString());   
    var Description = record.getValue("description");  
    var ActivityStatus = record.getValue("statecode");                       
    debugger;
    if (!name || (!start1 && !end1)) continue;
    if(start1==null)start1 = end1;
    else if(end1==null) end1 = start1;
    debugger;
    let newEvent =  {
      title: name,
      start: start1,
      end:end1,
      id: recordId,
      extendedProps: {
        entityReference: entityReference1,
        description: Description,
        activityStatus: ActivityStatus

      },
      color: entityColors[entitynames.indexOf(entityReference1.toString())]? entityColors[entitynames.indexOf(entityReference1.toString())]: this.props.Key.eventsdefaultcolor.toString()
    };
    debugger;
    newEvents.push(newEvent);
  }
  console.log(newEvents)
 
  return newEvents;
  debugger;

}

refreshPage = () => {
  this.props.pcfContext.parameters.sampleDataSet.refresh();
  this.setState(
    {isLoaded: false},
    () => this.setState({isLoaded: true,items:  this.getEvents(this.props.pcfContext)})
  )
}



    render() {
      let pr = this.props
      let thisRef =this;
      const { items ,isLoaded} = this.state;
      
      if (!isLoaded) {
        return <div>Loading ... </div>;
      } else {
        return (
          
          <FullCalendar

          headerToolbar={{
            left: 'dayGridMonth,timeGridWeek,timeGridDay',
            center: 'title',
            right: 'prev,next today RefreshButton',

          }}
          initialView='dayGridMonth'

            plugins={[ dayGridPlugin ,timeGridPlugin,interactionPlugin]}
          
            selectable= {true}
            dayMaxEvents={6}
            editable={true}
            droppable={true}
            allDaySlot ={false}
            events={items}
            height={'100%'}
            eventDisplay='block'
            eventClick={
                function(arg){
                 
                  pr.pcfContext.navigation.openForm({
                        entityId: arg.event.id, 
                        entityName: arg.event.extendedProps.entityReference,
                        openInNewWindow: pr.Key.openInNewWindow.toString()==="1" 
                    });
                
                }
              }
            eventDrop={


              function(arg) {
                //alert(arg.event.title + " was dropped on " +arg.event.start+ ","+arg.event.end);
                let Start = arg.event.start;
                let End = arg.event.end;
                if(End ==null) End = Start;
               
                
                var oppForUpdate= { 
                  [pr.Key.startdatefield.toString()]:formatDateAsParameterString(Start),
                  [pr.Key.enddatefield.toString()]: formatDateAsParameterString(End)
                                     
               };

              pr.pcfContext.webAPI.updateRecord( arg.event.extendedProps.entityReference, arg.event.id,oppForUpdate);


               
          

            }}
 
            eventResize={


              function(arg) {
                //alert(arg.event.title + " was dropped on " +arg.event.start+ ","+arg.event.end);
                let Start = arg.event.start;
                let End = arg.event.end;
                if(End ==null) End = Start;

                
                var oppForUpdate= { 
                  [pr.Key.startdatefield.toString()]:formatDateAsParameterString(Start),
                  [pr.Key.enddatefield.toString()]: formatDateAsParameterString(End)
                                     
               };

              pr.pcfContext.webAPI.updateRecord( arg.event.extendedProps.entityReference, arg.event.id,oppForUpdate);


               
          

            }}
          

          customButtons={{
              RefreshButton: {
                  text: 'Refresh',
                  click: function() {
                    thisRef.refreshPage();
                  },
              },
          }}
          // `Title: ${arg.event.title}\n`;
          eventMouseEnter={
            function(arg) {
             
              arg.el.title =  `Title: ${arg.event.title} \nStatus: ${arg.event.extendedProps.activityStatus} \nDescription: ${arg.event.extendedProps.description} \nActivity Type: ${arg.event.extendedProps.entityReference}`;
            /*  +"Status:" + arg.event.extendedProps.extendedProps.activityStatus.toString() + "\n"
              +"Description:" + arg.event.extendedProps.extendedProps.description.toString() + "\n"
              +"Activity Type:" + arg.event.extendedProps.extendedProps.entityReference.toString() + "\n";
            */
            }
          }
            select={function(arg) {
            //  alert(pr.pcfContext.parameters.eventFieldStart+' '+pr.pcfContext.parameters.eventFieldEnd);
            //  'new_callreport'
              let newRecordProperties: any = {};
              let currentDate = arg.start;
             // alert(arg.view.type);
              if(arg.view.type === "dayGridMonth")
              {
                 currentDate = addHoursToDate(arg.start,8);
              }
              newRecordProperties[pr.Key.startdatefield.toString()] = formatDateAsParameterString(currentDate);
              newRecordProperties[pr.Key.enddatefield.toString()] = formatDateAsParameterString(addHoursToDate(currentDate,1));
  
              pr.pcfContext.navigation.openForm({            
                  entityName: pr.Key.slotentityname.toString(),// 'props.pcfContext.parameters.calendarDataSet.getTargetEntityType()',
                  openInNewWindow: pr.Key.openInNewWindow.toString()==="1"   ,  
                  useQuickCreateForm: pr.Key.quickcreateform.toString()==="1"         
              }, newRecordProperties).then(
                function (success) {
                  //if(success.savedEntityReference!==null)
                 // thisRef.refreshPage();
                },
                function (error) {
                  //  console.log(error);
                });
             // window.location.reload();
            /* debugger;
             thisRef.refreshPage();
             debugger;*/
            }
            }
          
          />
        )
          }
      }
    


      axag_eventDrop = () => { // bind with an arrow function
        alert("axag_eventDrop")
      }
      





}