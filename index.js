// 
// Talio Helper Functions to Display (Heatmaps, ...)
// 

import { Heatmap } from "./heatmap"
import { HeatmapUtils } from "./utils"

window.onload = async () => {

   const util_config = {
      jwt: null,
      api_version: 1,
      website_id: 2,
      snapshot_id: 1,
      branch_id: 98,
      device: 0,
      base_url: "http://localhost:4000", // Do not put "/" at the end
      targets: {
         container: "talio_heatmap_container",
         background: "heatmap_background"
      },
      screenshot: {
         key: null
      },
      gradient: null
   }

   // Gradient, You can use #000 hex colors too
   const gradient = [
      { stop: 0.4, color: 'blue', percentage: 20} ,
      { stop: 0.6, color: 'cyan', percentage: 40} ,
      { stop: 0.7, color: 'lime', percentage: 60} ,
      { stop: 0.8, color: 'yellow', percentage: 80} ,
      { stop: 1.0, color: 'red', percentage: 100 }
   ]
   util_config.gradient = gradient

   // Add JWT to util config object
   util_config.jwt = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ0YWxpbyIsImV4cCI6MTYzMzc4NzgwMiwiaWF0IjoxNjMxMTk1ODAyLCJpc3MiOiJ0YWxpbyIsImp0aSI6IjEzOTE3ZmYxLTlhYzYtNDEwYS1iYjAzLWZlMjAwYjA0ZjBmMyIsIm5iZiI6MTYzMTE5NTgwMSwic3ViIjoiMiIsInR5cCI6ImFjY2VzcyJ9.UfRRrN2ENK4zj59lXCXubVL_5lcxx03rUJN7x_iiJwWNl444tFqsJORFCi_Ghq6JcdGt_O3Ig27HpnDChj2QOA"
   // Add Screenshot S3 Key
   util_config.screenshot.key = "1_1251938081_0"

   // MAGIC !
   const utils = new HeatmapUtils(util_config)

   // Show loader
   utils.show_loader()

   // Draw background image canvas
   await utils.draw_background_image()

   // Draw elements and get clicks
   const clicks = await utils.fetch_elements()

   console.log(utils.screenshot)

   // Heatmap Configuration
   const config = {
      brush_size: 10,
      brush_blur_size: 10,
      gradient: gradient
   }

   // Initialzie Heatmap Class
   const heatmap_element = "heatmap" // Heatmap HTML Element ID
   const heatmap = new Heatmap(
      config,
      heatmap_element,
      utils.screenshot.width,
      utils.screenshot.height
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

   // Hide loader
   utils.hide_loader()

}
