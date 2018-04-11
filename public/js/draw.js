var ws;

context = document.getElementById('drawCanvas').getContext("2d");

$('#drawCanvas').mousedown(function(e){
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;
    
  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

$('#drawCanvas').mousemove(function(e){
  if(paint){
    addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    redraw();
  }
});

$('#drawCanvas').mouseup(function(e){
  paint = false;
});

$('#drawCanvas').mouseleave(function(e){
  paint = false;
});

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging)
{
  ws.send(JSON.stringify({command: "addClick", params: [x,y,dragging]}))
}

function doAddClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}
function redraw(){
  ws.send(JSON.stringify({command: "redraw"}))
}

function doRedraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  
  context.strokeStyle = "#df4b26";
  context.lineJoin = "round";
  context.lineWidth = 5;
      
  for(var i=0; i < clickX.length; i++) {    
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}

//$(document).ready(function() {
  // Open WebSocket connection
  ws = new WebSocket("ws://" + location.host + "/chat");
  // Append each message
  ws.onmessage = function(e) { 
    console.log(e.data)
    var data = JSON.parse(e.data)
    console.log(data)
    if (data.type === "message") {
      $('#chat').append(data.value + "\n") 
    } else if (data.command === "redraw") {
      doRedraw();
    } else if (data.command === "addClick") {
      doAddClick(data.params[0], data.params[1], data.params[2]);
    } 
  };

  $("form").bind('submit', function(e) {
    var message = $('#msg').val();
    ws.send(JSON.stringify({type: "message", value: message}));
    $('#msg').val(''); $('#msg').focus();
    e.preventDefault();
  });
  window.onbeforeunload = function() {
    websocket.onclose = function () {}; // disable onclose handler first
    websocket.close()
  };
//});
