// 
// Talio Helper Functions to Display (Heatmaps, ...)
// 

import { UnsupportedBrowserError } from "./errors"
import { Heatmap } from "./heatmap"

window.onload = async () => {
  // Background Image
  const background_url = "http://localhost:9000/screenshots/1_1251938081_1.jpeg?Content-Disposition=attachment%3B%20filename%3D%221_1251938081_1.jpeg%22&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=minioadmin%2F20210910%2F%2Fs3%2Faws4_request&X-Amz-Date=20210910T210145Z&X-Amz-Expires=432000&X-Amz-SignedHeaders=host&X-Amz-Signature=0fa0a8eaa7437c8f916e5501ca85ddb12767220f26cde2a6f457b0a1030f7807"

  // Append background image to target canvas
  const background_canvas = await draw_background_image(document.getElementById("heatmap_background"), background_url, 0.5)
  console.log(background_canvas)

  // Current branch ID
  const branch_id = 63
  // Select device form 0 to 2
  const device = 1
  // Draw elements and get clicks
  const clicks = await fetch_elements(branch_id, device)

  console.log(clicks)

  // Desired Configuration
  const config = {
    brush_size: 10,
    brush_blur_size: 10,
    device: device,
    gradient: {
      0.4: 'blue',
      0.6: 'cyan',
      0.7: 'lime',
      0.8: 'yellow',
      1.0: 'red'
    }
  }

  // Initialzie Heatmap Class
  const heatmap = new Heatmap(config, "heatmap", background_canvas.width, background_canvas.height);

  // Insert Data
  const data = []
  clicks.forEach(click => {
    data.push([click.x, click.y, 0.8]);
  })

  // data.push([539., 70, 0.8])

  // for (var i = 0; i < 100; i++) {
  //   data.push([Math.floor(Math.random() * 300), Math.floor(Math.random() * 1000), 0.8]);
  // }

  // Set Data
  heatmap.data = data

  // Set Maximum Opacity
  heatmap.max = 1.2

  // Set Minimum Opacity
  heatmap.min = 0.05 

  // Display Heatmap
  heatmap.draw()
} 


function fetch_elements(brnach_id, device) {
  return new Promise(async resolve => {

    const jwt_token = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0YWxpbyIsImV4cCI6MTYzMzc4NzgwMiwiaWF0IjoxNjMxMTk1ODAyLCJpc3MiOiJ0YWxpbyIsImp0aSI6IjEzOTE3ZmYxLTlhYzYtNDEwYS1iYjAzLWZlMjAwYjA0ZjBmMyIsIm5iZiI6MTYzMTE5NTgwMSwic3ViIjoiMiIsInR5cCI6ImFjY2VzcyJ9.UfRRrN2ENK4zj59lXCXubVL_5lcxx03rUJN7x_iiJwWNl444tFqsJORFCi_Ghq6JcdGt_O3Ig27HpnDChj2QOA"

    const headers = {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + jwt_token
    }
    const elements_request = await fetch("http://localhost:4000/v1/websites/2/snapshots/1/branches/" + brnach_id + "/elements/" + device, {
        method: 'GET',
        headers
    })
    const elements_json = await elements_request.json()
    const elements = elements_json.data
    // console.log(elements_json.data, clicks_json.data)
    if(elements.length === 0) {
      return null;
    }

    const clicks_request = await fetch("http://localhost:4000/v1/websites/2/snapshots/1/branches/" + brnach_id + "/clicks/" + device, {
        method: 'GET',
        headers
    })
    const clicks_json = await clicks_request.json()
    const clicks = clicks_json.data

    // Pre define clicks field to elements
    elements.forEach(element => element.clicks = 0)

    clicks.forEach(click => {
      let found_element_index = elements.findIndex(element => element.path == click.path)
      elements[found_element_index].clicks = elements[found_element_index].clicks + 1
      // console.log(found_element_index, elements[found_element_index].clicks)
    })

    // console.log(elements)

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

    const container = document.getElementById("talio_heatmap_container")

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
      // console.log("index:", index, "clicks", element.clicks, element)
      const clicks_text = element.clicks
      const _element = document.createElement("div")
      _element.onmouseover = element_mouse_on_hover_event
      _element.onmouseout = element_mouse_on_out_event
      _element.classList.add("talio_heatmap_elements", `talio_heatmap_element_${index}`)
      _element.innerText = clicks_text
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
        { 
          zIndex: z_index,
        }
      )

      Object.assign(_element.style, element_style)
      container.appendChild(_element)
    })

    resolve(clicks)
  })
}

function element_mouse_on_hover_event(event) {
  const element_hover_style = {
    color: "white",
    border: "1px solid red",
    background: "black",
    opacity: 0.8
  }
  Object.assign(event.target.style, element_hover_style)
}

function element_mouse_on_out_event(event) {
  const element_init_style = {
    border: "1px solid black",
    background: "cyan",
    opacity: 0
  }
  Object.assign(event.target.style, element_init_style)
}

async function draw_background_image(canvas, background_image_url, opacity) {
  return new Promise(resolve => {
    const image = new Image();
    image.src = background_image_url;
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
