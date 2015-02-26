#Sblork
A simple MVC abstraction of [Backbone.js](http://backbonejs.org) with a silly name (because Javascript libraries have silly names!)

##Building
The repository already includes a built version of sblork, but if you modify it you can build it like this:

	npm install
	grunt
	
You'll find the output in the `dist` directory. Of course, you need to have `node`, `npm` and `grunt-cli` installed for this to work. 

##How does this work?
First, keep in mind that I've wrote this thing to speed up my workflow. I always write a lot of boilerplate code, and I tried to abstract and generalize that boilerplate so that I can focus more on the application I'm writing instead of the framework itself. Sblork simplifies some things, but doesn't enforce much and, more importantly, is just a wrapper over Backbone. It might not be ideal for you, and is probably missing a lot of features - you're more than welcome to fork!

Sblork focuses mainly on these things: `Bootstrapping`, `Views`, `Controllers` and `Routing`. It also allows to define `Modules` within the context of an application, and to create `View Containers` to host your views in.

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

###Defining Modules
Defining a module is a fancy way to say that you can save something within your app's namespace. For example, you can define a module like so:

	;(function(Sblork) {
		// A constructor
		var MyModule = function(name) {
			this.name = name;
		} 

		// An instance method
		MyModule.prototype.awesome = function() {
			alert(name + ' is awesome!');
		}

		// The definition
		Sblork.getInstance('myapp').define('MyModule', MyModule);
	})(this.Sblork);

Later, for example in your bootstrap function, you could use that module this way: 

	;(function(Sblork, $, Backbone) {
		// This function is called by Sblork binded to the app's instance
		var bootstrap = function() {
			// We bootstrap by using the module we defined earlier!
			var MyModule = Sblork.getInstance('myapp').require('MyModule');
			var myModuleInstance = new MyModule('Jimmy');

			myModuleInstance.awesome();
		}

		// When all resources are loaded, boot the application
		$(function() {
			var myapp = Sblork.start('myapp', bootstrap);
		});
	})(this.Sblork, this.jQuery, this.Backbone);

Modules are used to represent controllers, views, the router, the event manager and whatever else you want to. There is no restriction, it can be anything.

###The Event Manager
Every Sblork app instance has a predefined module called `EventManager`. This is an object extending `Backbone.Event`, with no added functionality whatsoever. You can retrieve it anywhere by using

	var eventManager = Sblork.getInstance('myapp').require('EventManager');
	
###Views
A view can be defined as a module within the Sblork app's namespace. If you use Backbone's `View`, this could be how you define it:

	;(function(Sblork, Backbone) {
		var MyView = Backbone.View.extend({
			initialize: function() {
				this.eventManager = Sblork.getInstance('myapp').require('EventManager');

				this.render();
			},
			render: function() {
				this.eventManager.trigger('MyView:BeforeRender', this);

				var html = '<p>I am a view!</p>';
				this.$el.html(html);		

				this.eventManager.trigger('MyView:AfterRender', this);
			}
		});

		Sblork.getInstance('myapp').define('MyView', MyView);
	})(this.Sblork, this.Backbone);

###View Containers
A view can be present inside the DOM for a certain amount of time. This time can be the anywhere between always and just a little while. A navigation bar, for example, is probably always there while a loading spinner appears for a (hopefully) very short time. However long a view stays within the DOM, it's nice to destroy it when its time is up. 

Let's say you have a structure like this one:

	<html>	
		...
		<body>
			<div data-container-role="navigation"></div>
			<div data-container-role="content"></div>
		</body>
	</html>
	
Here, the `div` with the role `navigation` is used as a container for the nav bar while the one with the role `content` is used to show the current page's content. You can register the two `div`s as containers within Sblork by calling the registerViewContainer method and passing it a name for the container and the `data-container-role` value for the element you want to use as the container itself:

	;(function(Sblork, $, Backbone) {
		// This function is called by Sblork binded to the app's instance
		var bootstrap = function() {
			// Register the view containers
			this.registerViewContainer('ContentViewContainer', 'content');
			this.registerViewContainer('NavigationViewContainer', 'navigation');
		}

		// When all resources are loaded, boot the application
		$(function() {
			var myapp = Sblork.start('myapp', bootstrap);
		});
	})(this.Sblork, this.jQuery, this.Backbone);
	
After a view container is registered, you can use its `makeView` function to generete a the DOM element that will be used to render your view (and that will get deleted from the DOM on cleanup, while the container will live on):

	...
		// Suppose this is a standard Backbone view
		var MyView = Sblork.getInstance('myapp').require('MyView');
		var ContentViewContainer = Sblork.getInstance('myapp').getViewContainer('ContentViewContainer');
		
		var view = new MyView({
			el: ContentViewContainer.makeView({
				class: 'navbar navbar-default'
			}, 'nav')
		});
		
		// Do stuff and then
		view.remove();
	...

The `makeView` function receives two arguments: the first is an object that will be passed to the jQuery `.attr` function on the generated view element, while the second is the tag to be used to generate such element. If the second argument is not specified, `div` will be used as a default value.

###Controllers 
`Controllers` are objects that must have a constructor and two functions: `start` and `stop`. You should define controllers as modules, like this:

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