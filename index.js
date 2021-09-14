// 
// Talio Helper Functions to Display (Heatmaps, ...)
// 

import { UnsupportedBrowserError } from "./errors"
import { Heatmap } from "./heatmap"
import { Utils } from "./utils"

window.onload = async () => {

   const util_config = {
      jwt: null,
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
         key: null
      }
   }

   // Add JWT to util config object
   util_config.jwt = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0YWxpbyIsImV4cCI6MTYzMzc4NzgwMiwiaWF0IjoxNjMxMTk1ODAyLCJpc3MiOiJ0YWxpbyIsImp0aSI6IjEzOTE3ZmYxLTlhYzYtNDEwYS1iYjAzLWZlMjAwYjA0ZjBmMyIsIm5iZiI6MTYzMTE5NTgwMSwic3ViIjoiMiIsInR5cCI6ImFjY2VzcyJ9.UfRRrN2ENK4zj59lXCXubVL_5lcxx03rUJN7x_iiJwWNl444tFqsJORFCi_Ghq6JcdGt_O3Ig27HpnDChj2QOA"
   // Add Screenshot S3 Key
   util_config.screenshot.key = "1_1251938081_1"

   // MAGIC !
   const utils = new Utils(util_config)

   // Draw elements and get clicks
   const clicks = await utils.fetch_elements()

   // Heatmap Configuration
   const config = {
      brush_size: 10,
      brush_blur_size: 10,
      gradient: {
         0.4: 'blue',
         0.6: 'cyan',
         0.7: 'lime',
         0.8: 'yellow',
         1.0: 'red'
      }
   }

   // Initialzie Heatmap Class
   const heatmap_element = "heatmap" // Heatmap HTML Element ID
   const heatmap = new Heatmap(
      config,
      heatmap_element,
      background_canvas.width,
      background_canvas.height
   );

   // Insert Data
   const data = []
   clicks.forEach(click => {
      // Arguments: [X, Y, AlphaOpacity]
      data.push([click.x, click.y, 0.8]);
   })

   // Set Data
   heatmap.data = data

   // Set Maximum Opacity
   heatmap.max = 1.2

   // Set Minimum Opacity
   heatmap.min = 0.05

   // Display Heatmap
   heatmap.draw()

}
