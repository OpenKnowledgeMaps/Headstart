# CRIS Vis

This is the example for the project "Visualisierung von Forschungsfragen im Bereich psychischer Erkrankungen" with the Open Innovation in Science Center (OIS Center) of the Ludwig Boltzmann Gesellschaft (LBG).

## Build and deployment instructions
### Requirements
Make sure to have `npm` version 3.10.10 installed (it comes with Node.js 6.14.x, you can [download installers here](https://nodejs.org/dist/latest-v6.x/)). You will also need a web server, such as Apache (for testing, you can use the web server bundled with npm).
### Build
1. To get started, clone the cris-vis branch of the Headstart repository:
    
    `git clone -b cris-vis https://github.com/OpenKnowledgeMaps/Headstart/`
1. Switch to the `Headstart` directory, duplicate the file `config.example.js` in the root folder and rename it to `config.js`.
1. Open the file `config.js`. For the variable `skin`, replace `""` with `"cris_vis"`.
1. Run the following two commands on the shell to build the Headstart client:

    `npm install`
    
    `npm run prod`
 1. To verify the build, run `npm start` on the shell to spin up a local test server. Point your browser to the following address:
 
    `http://localhost:8080/examples/cris-vis/index.html`
    
    You should now see the CRIS Vis visualization.
 
 ### Deployment
 1. To run Headstart on a production server (e.g. Apache), you need to set the publicPath in `config.js` to the URL of the `dist` directory. 
 Specify the full path excluding protocol, e.g. `//example.org/headstart/dist`
 1. Build the client again with `npm run prod`.
 1. Copy the contents of `Headstart/examples/cris_vis` to the desired location on your web server.
 1. In the file `index.html`, replace the following: 
    
    `"../../dist/headstart.js"` with `"dist/headstart.js"`
    `"../../dist/headstart.css"` with `"dist/headstart.css"`
 
 1. Point your browser to the chosen location on the web server. You should now be able to see the CRIS Vis visualization.
 
 ## Embedding the visualization on a web page
 CRIS Vis can be embedded on a web page. Here's how:
 
 1. Make sure to load the PT Sans font:
 
 	`<link href='https://fonts.googleapis.com/css?family=PT+Sans:400,700' rel='stylesheet' type='text/css'></link>`
 
 1. Use the following lines to setup and run the visualization. It will attach itself to the div, which can be used to move the visualization to the desired place on the page:
 
	 ```
	 <div id="visualization" class="headstart"></div>

	<script type="text/javascript" src="data-config.js"></script>
	<script type="text/javascript" src="dist/headstart.js"></script>
	<link type="text/css" rel="stylesheet" href="dist/headstart.css"></link>

	<script type="text/javascript">
	    headstart.start();
	</script>
	```
1. The visualization will fit itself to the size of the div, if it is specified. The minimum width and height is 670px.
For a responsive layout, you can use the following code snippet to adapt it to changing width and height. The snippet assumes that jQuery is loaded.

	```
	var calcDivHeight = function () {

	    let height = $(window).height();
	    let width = $(window).width();

	    if(height <= 670 || width < 904 || (width >= 985 && width  < 1070)) {
		return 670;    
	    } else if (width >= 904 && width <= 984) {
		return 670 + (width - 904);
	    } else if (width >= 1070 && width < 1400) {
		return 670 + (width - 1070)/2;
	    } else if (width > 1400 && width < 1600) {
		let calc_width = 835 + (width - 1400)
		return (calc_width > 897)?(897):(calc_width);
	    }  else {
		return $(window).height();
	    }
	}

	let div_height = calcDivHeight();

	$("#visualization").css("min-height", div_height + "px")
	```
