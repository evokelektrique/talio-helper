//
// Load screenshot and configure sizes
//

class Utils {

	constructor(config) {
		this.config = config
      // Combined base_url + api_version
      this.URL = `${this.config.base_url}/v${this.config.api_version}`
      this.headers = {
         'Accept': 'application/json',
         'Content-Type': 'application/json',
         'Authorization': 'Bearer ' + this.config.jwt
      }
	}

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
         const elements_request = await fetch(elements_url, {method: 'GET', headers: this.headers})
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
         elements.forEach(element => element.clicks = 0)

         clicks.forEach(click => {
            let found_element_index = elements.findIndex(element => element.path == click.path)
            elements[found_element_index].clicks = elements[found_element_index].clicks + 1
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
            border: "1px solid black",
            background: "cyan",
            opacity: 0
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
            const _element       = document.createElement("div")
            _element.onmouseover = this.element_mouse_on_hover_event
            _element.onmouseout  = this.element_mouse_on_out_event
            _element.innerText   = clicks_text
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

	element_mouse_on_hover_event(event) {
	  const element_hover_style = {
	    color: "white",
	    border: "1px solid red",
	    background: "black",
	    opacity: 0.8
	  }
	  Object.assign(event.target.style, element_hover_style)
	}

	element_mouse_on_out_event(event) {
	  const element_init_style = {
	    border: "1px solid black",
	    background: "cyan",
	    opacity: 0
	  }
	  Object.assign(event.target.style, element_init_style)
	}

   async draw_background_image(canvas, opacity) {
      return new Promise(async resolve => {
         const background_image_url = await this.fetch_screenshot()
         const image = new Image();
         image.src = background_image_url.url;
         image.onload = () => {
            const ctx = canvas.getContext("2d")
            canvas.width = image.width
            canvas.height = image.height
            ctx.globalAlpha = opacity || 0.4;
            ctx.drawImage(image, 0, 0, image.width, image.height);
            resolve({ width: image.width, height: image.height })
         }
      })
   }

}

export { Utils }
