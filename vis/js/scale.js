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
    let self = this;
    if (this.requireStartUp){
      this.requireStartUp = false
      config.scale_types.forEach(type => {
        var cur_item = d3.select('.scale-toolbar ul')
            .append('li')
            .attr('role', 'presentation')
            .attr('class', 'scale_item')
    
        cur_item
            .append('a')
            .attr('role', 'menuitem')
            .attr('tabindex', '-1')
            .text(config.scale_label[type])
            .on("click", function() {
                $('.scale_item').removeClass('active')
                cur_item.classed('active', true)
                self.doScale(type)
            })
      });
      d3.select('.scale_item').classed('active', true);
      d3.select('#curr-scale-type').text(config.scale_label[config.scale_types[0]])
      d3.select('#curr-scale-explaination').text(config.scale_explaination[config.scale_types[0]])
    }
  }

  doScale (type) {     
    config.scale_by = type
    config.base_unit = config.scale_base_unit[type];
    
    if(type === "content_based") {
        config.content_based = true;
    } else {
        config.content_based = false;
        config.localization[config.language].readers = config.scale_base_unit[type];
    }
    $('#curr-scale-type').text(config.scale_label[type])
    $('#curr-scale-explaination').text(config.scale_explaination[type])
    headstart.tofile(mediator.current_file_number)
  }

}

export const scale = new Scale(config.scale_types);