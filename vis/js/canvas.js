import { getRealHeight } from "helpers";
import config from 'config';

// only used in streamgraph now
class Canvas {
    constructor() {
        this.available_height = null;
        this.available_width = null;
        this.current_vis_size = null;
        this.current_vis_width = null;
    }

    // Set this.available_height, this.available_width, this.current_vis_size and this.current_vis_width (for streamgraph)
    calcChartSize() {
        var parent_height = getRealHeight($("#" + config.tag));
        var subtitle_height = $("#subdiscipline_title").outerHeight(true);

        var toolbar_height = $("#toolbar").outerHeight(true) || 0;
        var title_image_height = $("#title_image").outerHeight(true) || 0;
        const CHART_HEIGHT_CORRECTION = 15;
        const CHART_HEIGHT_CORRECTION_TOOLBAR = 15;

        // Set available_height and available_width
        if (parent_height === 0) {
            this.available_height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - Math.max(subtitle_height, title_image_height) - toolbar_height;
        } else {
            this.available_height = $("#" + config.tag).height() - Math.max(subtitle_height, title_image_height) - toolbar_height;
        }

        this.available_height = this.available_height - ((toolbar_height > 0)?(CHART_HEIGHT_CORRECTION_TOOLBAR):(CHART_HEIGHT_CORRECTION));

        this.available_width = $("#" + config.tag).width() - $("#list-col").width() - $("#modals").width();

        // Set current_vis_size
        if (this.available_width > config.min_width && this.available_height > config.min_height) {
            if (this.available_width >= this.available_height) {
                this.current_vis_size = this.available_height;
            } else {
                this.current_vis_size = this.available_width;
            }
        } else {
            this.current_vis_size = this.getMinSize();
        }

        if (this.current_vis_size > config.max_height) {
            this.current_vis_size = config.max_height;
        }
        
        //Set current_vis_width for streamgraph
        if(this.available_width > config.min_width) {
            this.current_vis_width = this.available_width;
        } else {
            this.current_vis_width = config.min_width;
        }
    }

    // Size helper functions
    getMinSize() {
        if (config.min_height >= config.min_width) {
            return config.min_width;
        } else {
            return config.min_height;
        }
    }

    // auto if enough space is available, else hidden
    setOverflowToHiddenOrAuto(selector) {
        var overflow = "hidden";

        if (this.current_vis_size > this.available_height ||
                this.current_vis_size + config.list_width > this.available_width) {
            overflow = "auto";
        }

        d3.select(selector).style("overflow", overflow);
    }
    
    drawStreamgraphChart() {
        d3.select("#chart-svg").remove();       
        this.createStreamgraphCanvas();           
    }
    
    createStreamgraphCanvas() {
        let self = this;
        
        d3.select('#headstart-chart')
            .append('svg')
                .attr('width', self.current_vis_width)
                .attr('height', self.current_vis_size)
                .attr('id', 'streamgraph_subject')
                .classed('streamgraph-canvas', true)
    }
    
    setupStreamgraphCanvas() {
        this.setOverflowToHiddenOrAuto("#main");
        this.calcChartSize();
        
        this.drawStreamgraphChart();
    }
}

export const canvas = new Canvas();
