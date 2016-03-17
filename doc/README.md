# Doc

## Installation and deployment

See [Getting Started](https://github.com/pkraker/Headstart#getting-started) for a minimal working example.

## <a name="data"></a>Data format

TBD

## <a name="options"></a>Visualisation settings

TBD

## Architecture

*Important note*: The proposed architecture does not reflect the current status of Headstart. Main differences: Mediator `app.js` located within `headstart.js`; `header.js` located in `popup.js`; `util.js` not implemented

Headstart uses the *mediator pattern* (see [Addy Osmani's article](https://addyosmani.com/largescalejavascript/#mediatorpattern)). The current version has implemented the mediator and the channels for basic functionality, but logic has not been moved yet.

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
