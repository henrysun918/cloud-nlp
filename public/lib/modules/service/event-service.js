define(['jquery'], function() {
  var modelUpdateEvent = "model-update-event";
  var conceptUpdateEvent = "concept-update-event";
  var dataOnloadEvent = "data-onload-event";
  var showCloudEvent = "show-cloud-event";
  var showSunburstEvent = "show-sunburst-event";


  var emit = function(event, data) {
    $('body').trigger(event, data);
  };

  var listen = function(event, handler) {
    $("body").on(event, handler); 
  }

  return {
    emit: emit,
    listen: listen,
    modelUpdateEvent: modelUpdateEvent,
    conceptUpdateEvent: conceptUpdateEvent,
    dataOnloadEvent: dataOnloadEvent,
    showCloudEvent: showCloudEvent,
    showSunburstEvent: showSunburstEvent
  };
});
