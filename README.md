#Sblork
A simple MVC abstraction of [Backbone.js](http://backbonejs.org) with a silly name (because Javascript libraries have silly names!)

##Building
The repository already includes a built version of sblork, but if you modify it you can build it like this:

	npm install
	grunt
	
You'll find the output in the `dist` directory. Of course, you need to have `node`, `npm` and `grunt-cli` installed for this to work. 

##How does this work?
First, keep in mind that I've wrote this thing to speed up my workflow. I always write a lot of boilerplate code, and I tried to abstract and generalize that boilerplate so that I can focus more on the application I'm writing instead of the framework itself. Sblork simplifies some things, but doesn't enforce much and, more importantly, is just a wrapper over Backbone. 

Sblork focuses mainly on these things: `Bootstrapping`, `Views`, `Controllers` and `Routing`. 

###Bootstrapping
You bootstrap a Sblork application with a function that can be defined anywhere in your code. Usually you would have a main file with something like this inside:

	;(function(Sblork, $, Backbone) {
		// This function is called by Sblork binded to the app's instance
		var bootstrap = function() {
			// Some bootstrap code here
		}
	
		// When all resources are loaded, boot the application
		$(function() {
			var myapp = Sblork.start('myapp', bootstrap);
		});
	})(this.Sblork, this.jQuery, this.Backbone);
	
So, what do we do inside the bootstrap function? There are a couple of things we can do:

- Register **View Containers**
- Register **Controllers**
- Register **Routes**
- Whatever else you want

TODO

###Controllers 
`Controllers` are objects that must have a constructor and two functions: `start` and `stop`. You define a controller like this:

	;(function(Sblork, Backbone) {		
		var MyController = function() {
			console.log('My Controller initialized');

			// We fetch the event manager and set it as a property of the controller
			this.eventManager = Sblork.getInstance('myapp').require('EventManager');
		}

		MyController.prototype.start = function() {
			console.log('My Controller started');
			var app = Sblork.getInstance('myapp');

			// We can respond to events fired by the event manager. Setting the context to the controller itself (third parameter) is VERY important for cleanup purposes
			this.eventManager.on('RouteChange', this.onRouteChange, this);

			// We create a view
			this.view = new (app.require('MyView'))({
					el: app.getViewContainer('MyViewContainer').makeView({
					class: 'navbar navbar-default'
				}, 'nav')
			});
		}

		MyController.prototype.stop = function() {
			console.log('My Controller stopped');
		
			// We remove all event listeners associated to this controller
			this.eventManager.off(null, null, this);
			
			// We remove the view since the controller is not active anymore
			this.view.remove();
		}
	
		NavigationController.prototype.onRouteChange = function(route) {
			// Do something on route change
		}
	
		// We define the controller withing the app's context.
		Sblork.getInstance('myapp').define('MyController', MyController);
	})(this.Sblork, this.Backbone);