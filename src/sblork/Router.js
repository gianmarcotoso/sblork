;(function(Sblork, Backbone, _) {
	Sblork.Router = function(instance) {
		var Router = Backbone.Router.extend({});

		var eventManager = instance.require('EventManager');

		Router.prototype.fireRoute = function(route, controller, action) {
			if (this._currentController)
				this._currentController.stop();

			if (controller)
				this._currentController = controller;

			eventManager.trigger('RouteChange', route);

			action.apply(controller ? controller : this);
		}

		Router.prototype.addRoute = function(path, route, action) {
			this.route(path, route);

			if (action) {
				this.addAction(route, action);
			}
		}

		Router.prototype.setRoutes = function(routes) {
			this.off();

			_.each(routes, function(route, path) {
				this.addRoute(path, route.route, route.action);
			}.bind(this));

			Backbone.history.start();
		}

		Router.prototype.addAction = function(route, action) {
			if (_.isFunction(action)) {
				this.on('route:'+route, function() {
					this.fireRoute.apply(instance, [route, null, action]);
				}, this);
				return;
			}

			var controller = instance.getController(action);
			if (controller) {
				this.on('route:'+route, function() {
					this.fireRoute.apply(instance, [route, controller, controller.start]);
				}, this);	
				return;
			}

			throw "Unable to add controller action: unspecified behavior (action is neither a callback nor a controller)";
		};
			
		return new Router;
	}
})(this.Sblork, this.Backbone, this._);