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
        .text(type)
        .on("click", this.doScale.bind(this, type))
      });
    }
  }

  doScale (type) {
    config.scale_by = type
    $('#curr-scale-type').text(type)
    headstart.tofile(mediator.current_file_number)
  }

}

export const scale = new Scale(config.scale_types);