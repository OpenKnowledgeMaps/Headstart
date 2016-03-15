# Doc

## Installation and deployment

Head over to `index.html` and check the path name.

## Modules

Headstart uses the *mediator pattern* (see [Addy Osmani's article](https://addyosmani.com/largescalejavascript/#mediatorpattern)). Current code has implemented the mediator and the channels for basic functionality, but logic has not been moved yet.

![architecture](img/headstart_architecture.png "Logo Title Text 1")

+ *app.js*

	The mediator. Has subscribed to all channels and receives events from the sub-modules which publish according to user interaction.

+ *canvas.js*
	
	Manages the actual map visualization.

+ *bubbles.js*

	Topic bubbles in the map.

+ *papers.js*

	Paper elements within the bubbles.

+ *list.js*

	The collapsable list of papers. `Map <-- Interaction --> List`

+ *popup.js*

	Manages the pop-up window that is used for the intro text and pdf previews.

+ *header.js*

	Content of the header above the map. Updated according to currently selected layer of the visualization.

+ *util.js*

	Contains following functionality:

	+ `RecordAction`
	+ `Bookmarking`
