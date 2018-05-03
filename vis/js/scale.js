import config from 'config';
import { mediator } from 'mediator';
import { canvas } from 'canvas'
import { headstart } from 'headstart'

class Scale {
  constructor (scaleTypes) {
    this.scale_types = scaleTypes
    this.requireStartUp = true
  }

  drawScaleTypes () {
    if (this.requireStartUp){
      this.requireStartUp = false
      config.scale_types.forEach(type => {
        d3.select('.scale-toolbar ul')
        .append('li')
        .attr('role', 'presentation')
        .append('a')
        .attr('role', 'menuitem')
        .attr('tabindex', '-1')
        .text(config.scale_label[type])
        .on("click", this.doScale.bind(this, type))
      });
      d3.select('#curr-scale-type').text(config.scale_label[config.scale_types[0]])
      d3.select('#curr-scale-explaination').text(config.scale_explaination[config.scale_types[0]])
    }
  }

  doScale (type) {     
    config.scale_by = type
    config.base_unit = config.scale_base_unit[type];
    
    if(type === "content_based") {
        config.content_based = true;
        config.sort_options = ["title", "authors", "year"];
    } else {
        config.content_based = false;
        config.sort_options = ["readers", "title", "authors", "year"];
        config.localization[config.language].readers = config.scale_base_unit[type];
    }
    $('#curr-scale-type').text(config.scale_label[type])
    $('#curr-scale-explaination').text(config.scale_explaination[type])
    headstart.tofile(mediator.current_file_number)
  }

}

export const scale = new Scale(config.scale_types);