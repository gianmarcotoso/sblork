;(function(root, _, Backbone, $) {
	var Sblork = function(appName) {
		this.name = appName;
		Sblork._instances[this.name] = this;
		
		this.define('EventManager', new Sblork.EventManager(this));
		this.define('Router', new Sblork.Router(this));
	}

	Sblork.start = function(instanceName, boot) {
		if (!Sblork._instances || !Sblork._instances[instanceName])
			return null;

		var sblork = Sblork._instances[instanceName];
		sblork.bootstrap(boot);

		return sblork;
	}

	Sblork.prototype.bootstrap = function(boot) {
		console.log('Booting application ' + this.name + '...');
		
		if (boot && _.isFunction(boot)) {
			boot.apply(this);
		}
	}
	
	Sblork.prototype.registerController = function(name, controller) {		
		if (!this._controllers)
			this._controllers = {};

		this._controllers[name] = new controller();	

		return this._controllers[name];
	}

	Sblork.prototype.registerControllers = function(controllers) {
		if (!this._controllers)
			this._controllers = {};

		_.each(controllers, function(controller, name) {
			this._controllers[name] = new controller();
		}.bind(this));
	} 

	Sblork.prototype.getController = function(name) {
		if (!this._controllers || !this._controllers[name])
			return null;

		return this._controllers[name];
	}
	
	Sblork.prototype.registerViewContainer = function(name, container) {
		if (!this._viewContainers)
			this._viewContainers = {};

		var $el = $('[data-container-role='+container+']');
		
		$el.makeView = function(attributes, element) {
			attributes = _.extend({}, attributes);
			element = element || 'div';
			
			return $('<'+element+'>').attr(attributes).appendTo($el);	
		};
		
		this._viewContainers[name] = $el;
	} 
	
	Sblork.prototype.getViewContainer = function(name) {
		if (!this._viewContainers || !this._viewContainers[name])
			return null;
		
		return this._viewContainers[name];
	}
	
	Sblork.getInstance = function(name) {
		if (!Sblork._instances)
			Sblork._instances = {};

		if (!Sblork._instances[name])
			Sblork._instances[name] = new Sblork(name);
		
		return Sblork._instances[name];
	}

	Sblork.prototype.define = function(moduleName, definition) {
		if (!this._modules)
			this._modules = {};

		this._modules[moduleName] = definition;
	}

	Sblork.prototype.require = function(moduleName) {
		if (!this._modules[moduleName])
			throw "The module " + moduleName + " is not defined on instance " + this.name;

		return this._modules[moduleName];
	} 
	
	// Export the Sblork object to the global namespace
	root.Sblork = Sblork;
})(this, this._, this.Backbone, this.jQuery);
;(function(Sblork, Backbone) {
	Sblork.EventManager = function(instance) {
		var EventManager = _.extend({}, Backbone.Events);
			
		return EventManager;
	}
})(this.Sblork, this.Backbone);
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