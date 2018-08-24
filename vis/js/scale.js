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
                mediator.publish("record_action", config.scale_label[type], "Toolbar", "select", config.user_id, "toolbar_select", null, null, null);
                $('.scale_item').removeClass('active')
                cur_item.classed('active', true)
                self.doScale(type)
            })
      });
      d3.select('.scale_item').classed('active', true);
      d3.select('#curr-scale-type').text(config.scale_label[config.scale_types[0]])
      d3.select('#curr-scale-explanation').html(config.scale_explanation[config.scale_types[0]])
      d3.select('.scale-infolink').text(config.localization[config.language].scale_by_infolink_label);
      
      let credit = config.localization[config.language].credit_alt;
      d3.select(".logoimg")
              .attr("alt", credit)
              .attr("title", credit)
    }
  }

  doScale (type) {
      
    $('#curr-scale-type').text(config.scale_label[type])
    $('#curr-scale-explanation').html(config.scale_explanation[type])
        
    if(config.rescale_map) {
        config.scale_by = type
        config.base_unit = config.scale_base_unit[type];
        config.dynamic_sizing = false;

        if(type === "content_based") {
            config.content_based = true;
            config.initial_sort = null;
        } else {
            config.content_based = false;
            config.initial_sort = config.scale_base_unit[type];
        }
        headstart.tofile(mediator.current_file_number)
    } else {
        mediator.publish("update_visual_distributions", type);
    }
  }
  
  updateLegend(type, context) {
      
      let legend = d3.select(".explanation-ids");
      let explanation = d3.select(".toolbar .legend");
      
      if(type === "none") {
          explanation.style("display", "none")
          legend.style("visibility", "hidden");
          return;
      }
      
      explanation.style("visibility", "visible")
      
      let overall_context = context.distributions_all[type];
      
      let id_fields = d3.select(".explanation-id-fields")
                                .html("")
     
      overall_context.forEach(function(elem, index) {
                  
          id_fields.append("span")
                        .attr("class", "explanation-id")
                        .text(elem.id)
          
          id_fields.append("span")
                        .attr("class", "explanation-name")
                        .text(elem.name)
          
          if(index !== overall_context.length - 1) {
              $(".explanation-id-fields").append(", ");
          }
      })
      
      legend.style("visibility", "visible");
  }

}

export const scale = new Scale(config.scale_types);