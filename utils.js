//
// Utilities to load screenshot and configure its sizes
//

import { NotFoundError } from "./errors"

class HeatmapUtils {

   screenshot = {}

	constructor(config) {
		this.config = config
      // Combined base_url + api_version
      this.URL = `${this.config.base_url}/v${this.config.api_version}`
      this.headers = {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': 'Bearer ' + this.config.jwt
      }
      // this.draw_gradient_bar()
      this.loader_element_mark = "heatmap_loader"
	}

   show_loader() {
      if(!this.get_loader()) {
         const _loader = document.createElement("div")
         _loader.classList.add(this.loader_element_mark)
         _loader.id = this.loader_element_mark
         _loader.innerHTML = "<span id='heatmap_loader_text'>Loading ...</span>"
         const container = document.getElementById(this.config.targets.container)
         container.appendChild(_loader)
      }
   }

   hide_loader() {
      const _loader = this.get_loader()
      if(_loader) {
         _loader.style.display = "none"
      }
   }

   get_loader() {
      return document.getElementById(this.loader_element_mark)
   }

   // draw_gradient_bar() {
   //    console.log(this.config.gradient)

   //    // Config
   //    const info_mark = "talio_heatmap_info"
   //    const bar_mark = "talio_gradient_bar"

   //    // Create Info Element
   //    const _info = document.createElement("div")
   //    _info.classList.add(info_mark)
   //    _info.id = info_mark
   //    _info.style.background = "#000"
   //    _info.style.padding = "10px"
   //    _info.style.borderRadius = "5px"
   //    _info.style.width = "50px"
   //    _info.style.height = "300px"
   //    _info.style.position = "absolute"
   //    _info.style.bottom = "10px"
   //    _info.style.right = "10px"

   //    // Generate css gradient background
   //    let background_braker_count = 0;
   //    let background = 'linear-gradient(0deg,'
   //    for(const [key, value] of Object.entries(this.config.gradient)) {
   //       background += `${value.color} ${value.percentage}%`
   //       if(background_braker_count !== Object.entries(this.config.gradient).length - 1 ) {
   //          background += ','
   //       }
   //       background_braker_count += 1
   //    }
   //    background += ')'

   //    const _bar = document.createElement("div")
   //    _bar.classList.add(bar_mark)
   //    _bar.id = bar_mark
   //    _bar.style.background = background
   //    _bar.style.width = "100%"
   //    _bar.style.height = "100%"
   //    _bar.style.borderRadius = "5px"

   //    _info.appendChild(_bar)
   //    const container = document.getElementById(this.config.targets.container)
   //    container.appendChild(_info)
   // }

   // Recieve and return screenshot `url`
   async fetch_screenshot() {
      const url = `${this.URL}/websites/${this.config.website_id}/snapshots/${this.config.snapshot_id}/screenshots/get_image`

      const response = await fetch(url, {
         method: "POST",
         headers: this.headers,
         body: JSON.stringify({key: this.config.screenshot.key})
      })

      return await response.json()
   }

   // Draw elements and get clicks
	fetch_elements() {
      return new Promise(async resolve => {

         ////////////////////
         // Fetch Elements //
         ////////////////////
         const elements_url     = `${this.URL}/websites/${this.config.website_id}/snapshots/${this.config.snapshot_id}/branches/${this.config.branch_id}/elements/${this.config.device}`
         const elements_request = await fetch(elements_url, {method: 'GET', headers: this.headers}).then(response => {
            if(response.ok) {
               return response
            } else {
               const response = "No elements found"
               const error =  new NotFoundError(response)
               return Promise.reject(response)
            }
         })
         const elements_json    = await elements_request.json()
         const elements 		  = elements_json.data

         if(elements.length === 0) {
            return null;
         }

         //////////////////
         // Fetch Clicks //
         //////////////////
         const clicks_url = `${this.URL}/websites/${this.config.website_id}/snapshots/${this.config.snapshot_id}/branches/${this.config.branch_id}/clicks/${this.config.device}`
         const clicks_request = await fetch(clicks_url, {method: 'GET', headers: this.headers})
         const clicks_json = await clicks_request.json()
         const clicks = clicks_json.data

         // Pre define clicks field to elements
         elements.forEach(element => {element.clicks = 0; element.percentage = 0})

         clicks.forEach(click => {
            let found_element_index = elements.findIndex(element => element.path == click.path)
            elements[found_element_index].clicks = elements[found_element_index].clicks + 1
            elements[found_element_index].percentage = Math.floor((elements[found_element_index].clicks * 100) / clicks.length)

         })

         const element_position_style = (x, y, width, height, top, right, bottom, left) => {
            return {
               position: "absolute",
               x: x,
               y: y,
               width: width,
               height: height,
               top: top,
               right: right,
               bottom: bottom,
               left: left
            }
         }

         const element_init_style = {
            // border: "1px solid black",
            // background: "cyan",
            // opacity: 0
         }

         const container = document.getElementById(this.config.targets.container)

         if(!elements) {
            resolve(null)
         }

         elements.forEach((element, index) => {
            let z_index;

            if(element.tag_name === "BODY") {
               z_index = 0
            } else {
               z_index = element.path.split(" > ").length
            }

            const clicks_text    = element.clicks
            const percentage_text    = element.percentage + "%"
            const _element       = document.createElement("div")
            // _element.onmouseover = this.element_mouse_on_hover_event
            // _element.onmouseout  = this.element_mouse_on_out_event
            _element.innerHTML   = `<span class='heatmap_clicks_count'>${clicks_text}</span>`
            _element.innerHTML   += `<span class='heatmap_clicks_percentage'>${percentage_text}</span>`
            _element.classList.add("talio_heatmap_elements", `talio_heatmap_element_${index}`)

            const element_style = Object.assign(
               {},
               element_init_style,
               element_position_style(
                  element.x + "px",
                  element.y + "px",
                  element.width + "px",
                  element.height + "px",
                  element.top + "px",
                  element.right + "px",
                  element.bottom + "px",
                  element.left + "px"
                  ),
               { zIndex: z_index }
               )

            Object.assign(_element.style, element_style)
            container.appendChild(_element)
         })

         resolve(clicks)
      })
   }

   // element_mouse_on_hover_event(event) {
   //    const element_hover_style = {
   //       color: "white",
   //       border: "2px dashed #000",
   //       background: "#444",
   //       opacity: 0.8
   //    }
   //    Object.assign(event.target.style, element_hover_style)
   // }

   // element_mouse_on_out_event(event) {
   //    const element_init_style = {
   //       opacity: 0
   //    }
   //    Object.assign(event.target.style, element_init_style)
   // }

   async draw_background_image(opacity) {
      return new Promise(async resolve => {
         const background_image_url = await this.fetch_screenshot()
         const image = new Image();
         image.src = background_image_url.url;
         image.onload = () => {
            const canvas = document.getElementById(this.config.targets.background)
            const ctx = canvas.getContext("2d")
            canvas.width = image.width
            canvas.height = image.height
            ctx.globalAlpha = opacity || 0.4;
            ctx.drawImage(image, 0, 0, image.width, image.height);

            // Set screenshot sizes
            this.screenshot.width = image.width
            this.screenshot.height = image.height

            resolve({ width: image.width, height: image.height })
         }
      })
   }

}

export { HeatmapUtils }
