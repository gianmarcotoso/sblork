;(function(Sblork, Backbone) {
	Sblork.EventManager = function(instance) {
		var EventManager = _.extend({}, Backbone.Events);
			
		return EventManager;
	}
})(this.Sblork, this.Backbone);