require.config({
  shim: {
    'd3cloud': {
        deps: ['d3'],
    }
  },
  paths: {
    "template": "lib/modules/template/main-view.html",
    "jquery": "https://code.jquery.com/jquery-2.1.3.min",
    "d3": "lib/modules/view/d3",
    "d3cloud" : "lib/modules/view/d3.layout.cloud", 
    "parse": "http://www.parsecdn.com/js/parse-1.3.4.min",
    "model": "lib/modules/model/main-model",
    "view": "lib/modules/view/main-view",
    "controller": "lib/modules/controller/main-controller",
    "service": "lib/modules/service/data-service",
    "event": "lib/modules/service/event-service",
    "config": "lib/modules/config/config",
    "cosine": "lib/modules/util/cosine",
    "autocomplete": "lib/modules/util/typeahead/typeahead.jquery.min"
  }
});

require(['model', 'view', 'controller', 'service'], function(model, view, controller, service) { 
  service.init(); 
  model.init();
  view.init();
  controller.init();
});
