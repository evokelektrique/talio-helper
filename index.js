// 
// Talio Helper Functions to Display (Heatmaps, ...)
// 

import { UnsupportedBrowserError } from "./errors"
import { Heatmap } from "./heatmap"
import { Utils } from "./utils"

window.onload = async () => {

   const util_config = {
      api_version: 1,
      website_id: 2,
      snapshot_id: 1,
      branch_id: 96,
      device: 0,
      base_url: "http://localhost:4000", // Do not put "/"
      targets: {
         container: "talio_heatmap_container"
      },
      screenshot: {
         key: "1_1251938081_1"
      }
   }

   util_config.jwt = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0YWxpbyIsImV4cCI6MTYzMzc4NzgwMiwiaWF0IjoxNjMxMTk1ODAyLCJpc3MiOiJ0YWxpbyIsImp0aSI6IjEzOTE3ZmYxLTlhYzYtNDEwYS1iYjAzLWZlMjAwYjA0ZjBmMyIsIm5iZiI6MTYzMTE5NTgwMSwic3ViIjoiMiIsInR5cCI6ImFjY2VzcyJ9.UfRRrN2ENK4zj59lXCXubVL_5lcxx03rUJN7x_iiJwWNl444tFqsJORFCi_Ghq6JcdGt_O3Ig27HpnDChj2QOA"

   const utils = new Utils(util_config)


   // Append background image to target canvas
   const background_canvas = await utils.draw_background_image(document.getElementById("heatmap_background"), 0.5)
   console.log(background_canvas)

   // Current branch ID
   const branch_id = 96
   // Select device form 0 to 2
   const device = 1
   // Draw elements and get clicks
   const clicks = await utils.fetch_elements(branch_id, device)

   // TOOD: Log
   console.log(clicks)

   // Heatmap Configuration
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
   const heatmap = new Heatmap(
      config,
      "heatmap", // Heatmap HTML Element ID
      background_canvas.width,
      background_canvas.height
   );

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

