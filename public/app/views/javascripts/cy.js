var host = "http://localhost:8888/";
var pause = false;
var initialInterval = 100;
var interval = 1000;
var pausePolling = false;
var cy;

var layout_opts = {
  // circle, animated
  name: 'cola',
  fit: true,
  idealEdgeLength: 100,
  nodeOverlap: 20,
  animate: true,
  animationDuration: 12200,
  // animationEasing: 'ease-out-quint',
  randomize: false,
  maxSimulationTime: 10500,
  nodeSpacing: 30
}

var initialiseServer = function(){
  return $.ajax({
    dataType: "json",
    url: host,
    method: "POST",
  });
}

var getNodes = function(){
  return $.ajax({
    dataType: "json",
    // url: "init.json",
    url: host+"0/",
    method: "GET",
  });
};

var selectedCollection = function (){
  return cy.nodes('.selected');
};

var addNodeEvents = function(){
  cy.nodes().on("click", function(e){
    // cy.layout().stop();
    pausePolling = true;

    if(e.cyTarget.hasClass('selected')){
      e.cyTarget.removeClass('selected');
    }else{
      e.cyTarget.addClass('selected');
    }

    console.log(selectedCollection().length, "nodes selected")
  });
}

var ajax_error_handler = function(e){
  console.error(e)
};

var initialiseCy = function(initialNodes){
  cy = cytoscape({
    container: $('#cy'), // container to render in
    motionBlur: true,
    // container: document.getElementById('cy'), // container to render in

    layout: layout_opts,

    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'shape': 'hexagon',
          'content': 'data(id)',
          "font-size":"20px",
          "text-valign":"center",
          "text-halign":"center",
          "background-color":"#000",
          "text-outline-color":"#000",
          "text-outline-width":"1px",
          "color":"orange",
          "overlay-padding":"8px",
          "z-index":"10",
          "width": "110px",
          "height": "100px",
          "border-width": "2px",
          "border-color": "orange"
        }
      },

      {
        selector: 'edge',
        style: {
          "font-size":"4px",
          "label": "data(id)",
          'edge-text-rotation': 'autorotate',
          'width': 2,
          'line-color': 'white',
          'target-arrow-color': 'white',
          'target-arrow-shape': 'triangle',
          "curve-style":"haystack",
          "haystack-radius":"0.5",
          "opacity":"0.4",
          "overlay-padding":"3px",
          "z-index":"10"
        }
      },

      {
        selector: '.faded',
        style: {
          'opacity': 0.25,
          'text-opacity': 0
        }
      }, 
      {
        selector: '.selected',
        style: {
          "color": "lightblue",
          "border-color": "lightblue" 
        }
      }   
    ],
    elements: initialNodes
  });
};

var updateCy = function(journal){
    if (journal.add.length > 0) {
      console.log("add", JSON.stringify(journal.add.length))
      cy.add(journal.add);
    };
  
    if (journal.remove.length > 0) {
      console.log("rm", JSON.stringify(journal.remove.length))
      cy.remove('#'+journal.remove.join(",#"));
    };
  
    var layout = cy.makeLayout(layout_opts);
    layout.run();
}

var pollForNodes = function(){
    pausePolling = false;
    setTimeout(function(){
      getNodes().then(
        function(response){
          if(!pausePolling){
            updateCy(response);
            pollForNodes();
          }
        }
      )}
    , interval);
}

$(function(){
  initialiseServer().then(function(response){
    console.log('server intialised');
    var initialNodes = false;
    setTimeout(function(){
      getNodes().then(function(response){
        initialiseCy(response.add);
        addNodeEvents();
        pollForNodes();
      },ajax_error_handler)
    },initialInterval)
    
  },ajax_error_handler);

  $('#restart_polling').on('click',function(){ pollForNodes();})
  $('#connect_nodes').on('click',function(){ 
      var selectedNodeIds = $.map(selectedCollection(), function(node){ return node.data().id; })
      alert(selectedCollection().length + ' nodes selected with id\'s: '+selectedNodeIds);
  })
});