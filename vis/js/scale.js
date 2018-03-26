import config from 'config';
import { mediator } from 'mediator';
import { canvas } from 'canvas'

class Scale {
  constructor (scaleTypes) {
    this.scale_types = scaleTypes
  }

  drawScaleTypes () {
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

  doScale (type) {
    canvas.chart.selectAll("div.paper_holder").each((d) => {
      d.internal_readers = d[type] ? d[type] : 1
    })
    mediator.publish("window_resize")
  }

}

export const scale = new Scale(config.scale_types);