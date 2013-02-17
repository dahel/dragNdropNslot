var dragNdropNslot=function(){
  var settings={
    object:null,
    slots:null,
    dragElementClass:'dds_dragging',
    slottedElementClass:'dds_slottedElement',
    hoveredSlotClass:'dds_hoveredSlot',
    droppedSlotClass:'dds_droppedSlot'
  }
  var util={    //few useful functions
      getStyle:function(el, cssprop){
          if (el.currentStyle){ //IE
            return el.currentStyle[cssprop];

          }
             else if (document.defaultView && document.defaultView.getComputedStyle) //Firefox
              return document.defaultView.getComputedStyle(el, "")[cssprop]
             else //try and get inline style
              return el.style[cssprop]
        },

      getMousePosition:function(evt){
          if (evt.pageY) return [evt.pageY, evt.pageX];
          else if (evt.clientY)
            return [evt.clientY + (document.documentElement.scrollTop ?
            document.documentElement.scrollTop :
            document.body.scrollTop),
            evt.clientX + (document.documentElement.scrollLeft ?
            document.documentElement.scrollLeft :
            document.body.scrollLeft),
            ];
          else return null;
        },

      getAbsCoords:function(element){
          var x=0;
          var y=0;
            function getCoords(el){
                x+=el.offsetLeft;
                y+=el.offsetTop;
                if(el.offsetParent !== document.documentElement){
                  if(el.offsetParent.nodeName !== 'BODY')
                  getCoords(el.offsetParent);
                }
            };
            getCoords(element);
            return [x,y];
        },

      addEvent:function(element, type, fn){
          if(window.addEventListener){
                element.addEventListener(type, fn, false);
          }else if(window.attachEvent){
            element.attachEvent('on'+type, fn);
          }else{
            element['on'+type]=fn;
          }
        },

      removeEvent:function(element, type, fn){
          if(window.removeEventListener){
            element.removeEventListener(type, fn, false);
          }else if(window.detachEvent){
            element.detachEvent('on'+type, fn);
          }else{
            el['on'+type]=null;
          }
        },

      extractElementsToArray: function(elements){
          var arr=[];
          var elemLength=elements.length;
          if(elemLength){
          for(var i=0; i<elemLength; i++){
                arr.push(elements[i]);
              }
          }else{
            arr.push(elements);
          }
          return arr;
        },

      addClass:function( el, clas ){
          el.className=el.className+' '+clas;

        },

      removeClass:function( el, clas ){

          var currentClasses=el.className;
          el.className=currentClasses.replace(' '+clas, '')
        },

      preventDefault:function(event){
          if (window.event) { window.event.returnValue = false; }
          else if (event.preventDefault) { event.preventDefault(); }
          else { event.returnValue = false; }
       },

      error:function(msg){
          alert(msg);
        }
  }
  //end util

  var DnDnS={

      isSlotted:false,

      Elements:[],

      numOfSlots:0,

      Slots:[],

      currentElem:null,

      elemStartPosition: null,

      offsetStartPos: null,

      activeSlot:null,

      setupSettings:function(obj){
        obj.object ? settings.elems=obj.object : util.error('You need to pass elements to init function');
        if(obj.slots) settings.slots=obj.slots;
        if(obj.dragElementClass) settings.dragElementClass=obj.dragElementClass;
        if(obj.slottedElementClass) settings.slottedElementClass=obj.slottedElementClass;
        if(obj.hoveredSlotClass) settings.hoveredSlotClass=obj.hoveredSlotClass;
        if(obj.droppedSlotClass) settings.droppedSlotClass=obj.droppedSlotClass;
      },

      setupElements:function(elems, slots){
          var timeforid=new Date();
          var elems=util.extractElementsToArray(elems);
          for(var i=0; i<elems.length; i++){
              if(!elems[i].id){
                  elems[i].id='DnDnS'+timeforid.getTime()+i;
                }
              this.Elements[elems[i].id]={};
              this.Elements[elems[i].id].classname=elems[i].className;
              this.Elements[elems[i].id].initPosition=[parseInt(util.getStyle(elems[i], 'left')) || 0 ,parseInt(util.getStyle(elems[i], 'top')) || 0 ];
              this.Elements[elems[i].id].slottedIn=false;
              this.Elements[elems[i].id].width=parseInt(elems[i].offsetWidth);
               this.Elements[elems[i].id].height=parseInt(elems[i].offsetHeight);
              util.addEvent(elems[i], 'mousedown', DnDnS.drag);
              util.addEvent(elems[i], 'click', function(e){
                util.preventDefault(e);
              })
              if(settings.slots)
              {

                DnDnS.isSlotted=true;
                this.Elements[elems[i].id].slots=new Array();
                var slotsArray=this.setupSlots(slots);
                this.Elements[elems[i].id].slots=slotsArray;
              }
            }
            var sl=util.extractElementsToArray(slots)
            this.numOfSlots+=sl.length;
            this.Slots=this.Slots.concat(sl);
        },

      setupSlots:function(slots){
          var slotsArr=util.extractElementsToArray(slots);
          var tmpArr=[];
          for(var j=0; j<slotsArr.length; j++){
            var tmp={};
            tmp.number=j+this.numOfSlots;
            tmp.slotElement=slotsArr[j];
            tmp.empty=true;
            tmp.coords=util.getAbsCoords(slotsArr[j]);
            tmp.dimensions=[parseInt(util.getStyle(slotsArr[j], 'width')), parseInt(util.getStyle(slotsArr[j], 'height'))];
            tmpArr.push(tmp);
          }
          return tmpArr;
        },

      drag:function(evt){
           document.onselectstart = function () {return false; };
           document.ondragstart = function() { return false; };
            util.preventDefault(evt);
            document.body.focus();
            if(evt.srcElement){
              DnDnS.currentElem=evt.srcElement;
            }else{
              DnDnS.currentElem=this;
            }
            if(DnDnS.Elements[DnDnS.currentElem.id].slottedIn !== false){
              DnDnS.updateSlots(DnDnS.Elements[DnDnS.currentElem.id].slottedIn, true);
              DnDnS.Elements[DnDnS.currentElem.id].slottedIn=false;
            }
            util.addClass(DnDnS.currentElem,settings.dragElementClass);
            util.removeClass(DnDnS.currentElem,settings.slottedElementClass);
            var startMousePos=util.getMousePosition(evt);
            DnDnS.elemStartPosition=[parseInt(util.getStyle(DnDnS.currentElem, 'top')) || 0,parseInt(util.getStyle(DnDnS.currentElem, 'left')) || 0 ];
            DnDnS.offsetStartPos=util.getAbsCoords(DnDnS.currentElem);
            if(DnDnS.isSlotted){
              DnDnS.checkSlots();
            }
          DnDnS.proccessDrag=function(event){
              var mousePos=util.getMousePosition(event);
              mousePos=mousePos || [0,0];
              var element=DnDnS.currentElem;
              element.style.top=(DnDnS.elemStartPosition[0]+mousePos[0]-startMousePos[0])+'px';
              element.style.left=(DnDnS.elemStartPosition[1]+mousePos[1]-startMousePos[1])+'px';
              if(DnDnS.isSlotted){
                DnDnS.checkSlots();
              }
            }

          util.addEvent(document, 'mousemove', DnDnS.proccessDrag);
          util.addEvent(document, 'mouseup', DnDnS.drop);
        },

      drop:function(){
        if(DnDnS.isSlotted){
          if(DnDnS.isSlotted && DnDnS.activeSlot && DnDnS.activeSlot.empty){
            DnDnS.Elements[DnDnS.currentElem.id].slottedIn=DnDnS.activeSlot.number;
            DnDnS.updateSlots(DnDnS.activeSlot.number, false)
            DnDnS.fullSlot=DnDnS.activeSlot;


            DnDnS.currentElem.style.left=DnDnS.elemStartPosition[1]+(DnDnS.activeSlot.coords[0]-DnDnS.offsetStartPos[0])+(DnDnS.activeSlot.slotElement.offsetWidth/2)-(DnDnS.currentElem.offsetWidth/2)+'px';
            DnDnS.currentElem.style.top=DnDnS.elemStartPosition[0]+(DnDnS.activeSlot.coords[1]-DnDnS.offsetStartPos[1])+(DnDnS.activeSlot.slotElement.offsetHeight/2)-(DnDnS.currentElem.offsetHeight/2)+'px';
            DnDnS.activeSlot.isactive=false;
            util.addClass(DnDnS.currentElem,settings.slottedElementClass);
            util.removeClass(DnDnS.activeSlot.slotElement, settings.hoveredSlotClass);
            util.addClass(DnDnS.activeSlot.slotElement, settings.droppedSlotClass);
            }else{
              DnDnS.currentElem.style.left=DnDnS.Elements[DnDnS.currentElem.id].initPosition[0]+'px';
              DnDnS.currentElem.style.top=DnDnS.Elements[DnDnS.currentElem.id].initPosition[1]+'px';
              DnDnS.Elements[DnDnS.currentElem.id].slottedIn=false;
            }
          DnDnS.activeSlot=null;
          }
          util.removeClass(DnDnS.currentElem,settings.dragElementClass);
          util.removeEvent(document, 'mousemove', DnDnS.proccessDrag);
          util.removeEvent(document, 'mouseup', DnDnS.drop);
        },

      checkSlots:function(){
          var elemPos=util.getAbsCoords(this.currentElem);
          for(var i=0; i<this.Elements[this.currentElem.id]['slots'].length; i++){
            var slot=this.Elements[this.currentElem.id]['slots'][i];
            var a=slot.coords[0]-this.Elements[this.currentElem.id].width;
            var b=slot.coords[0]+slot.dimensions[0];
            var c=slot.coords[1]-this.Elements[this.currentElem.id].height;
            var d=slot.coords[1]+slot.dimensions[1];
            if(elemPos[0]>a && elemPos[0] < b && elemPos[1] > c && elemPos[1] < d){
              slot=DnDnS.slotConflict(slot);
              if(!slot.isactive && slot.empty){
                slot.isactive=true;
                DnDnS.activeSlot=slot;
                util.addClass(slot.slotElement, settings.hoveredSlotClass)
              if(DnDnS.activeSlot){
                util.removeClass(DnDnS.activeSlot.slotElement, settings.droppedSlotClass);
              }
              }
            }else{
              if(slot.isactive){
                slot.isactive=false;
                util.removeClass(slot.slotElement, settings.hoveredSlotClass);
                DnDnS.activeSlot=null;
              }
            }
            }
        },

        updateSlots:function(slotNumber, bool){
            for(var i in this.Elements){
              for(var j=0; j<this.Elements[i].slots.length; j++){
                    if(this.Elements[i].slots[j].number===slotNumber){
                      this.Elements[i].slots[j].empty=bool;

                    }
                  }
                }
          },

      slotConflict:function(slot){
          if(!DnDnS.activeSlot || DnDnS.activeSlot.number == slot.number){
          return slot;
          }else{
            if(DnDnS.activeSlot.isactive){
              util.removeClass(DnDnS.activeSlot.slotElement, settings.hoveredSlotClass);

              DnDnS.activeSlot.isactive=false;
            }
            return slot;
          }
        },

      init:function(settings){

        this.setupSettings(settings);

        this.setupElements(settings.object, settings.slots);


        }
  }

  function retrieve(){
    var obj={};
  for(var i in DnDnS.Elements){
      if(DnDnS.Elements[i].slottedIn !== false){
        obj[DnDnS.Slots[DnDnS.Elements[i].slottedIn].id]=i;
      }
    }
    return obj;
  }

  return{
    init:function(settings){
      DnDnS.init(settings)
    },
    retrieveData:retrieve
  }
}();


window.onload=function(){
  dragNdropNslot.init({
    object:document.getElementById('drag').getElementsByTagName('a'),
    //slots:document.getElementById('drop').getElementsByTagName('a')
    
  })
  /*


  dragNdropNslot.init({
    object:document.getElementById('drag2'),
    slots:document.getElementById('slot2')
    
  })
  dragNdropNslot.init({
    object:document.getElementById('drag3'),
    slots:document.getElementById('slot3')
    
  })
  document.getElementById('retrieve').onclick=function(){
    var ret=dragNdropNslot.retrieveData();

    for(var i in ret){
      console.log(i+'   '+ret[i])
    }
  }

*/

}