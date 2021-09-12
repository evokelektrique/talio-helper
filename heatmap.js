

// 
// Core Class
// 
class Heatmap {
  devices = {
    // desktop
    0: {  
      width: 1280,
      height: 640,
    },
    // tablet
    1: {  
      width: 800,
      height: 640,
      isMobile: true,
    },
    // mobile
    2: {  
      width: 380,
      height: 640,
      isMobile: true,
    }
  }

  config = {}

  // Current Canvas
  canvas = null
  // Canvas Context2d
  ctx    = null

  data = []

  max = 1
  min = 0.1



  // 1: Config Object
  // 2: canvas_id(Provide a HTML ID which it will create a canvas inside it)
  constructor(config, canvas_id, width, height) {
    // Overwrite configuration
    Object.assign(this.config, config)

    this.r = this.config.brush_size + this.config.brush_blur_size
    this.d = this.r * 2

    this.canvas_brush = document.createElement("canvas")

    // Get Canvas And Set It
    this.canvas = document.getElementById(canvas_id)
    this.canvas.width = width
    this.canvas.height = height
    // this.canvas.width = this.devices[0].width
    // this.canvas.height = this.devices[0].height

    // Validate Browser Support
    try {
      if(this.canvas.getContext) {
        // Get Context From Canvas & Set It
        this.ctx = this.canvas.getContext("2d")
        this.ctx_brush = this.canvas_brush.getContext("2d")
      } else {
        // Raise And Error When Browser Is Unsupported / Old
        throw new UnsupportedBrowserError("Browser Not Supported")
      }
    } catch(err) {
      err.display()
    }
  }

  set data(point) {
    this.data.push(point)
  }

  set max(max) {
    this.max = max
  }

  set min(min) {
    this.min = min
  }

  set background(url) {
    this.background_image_url = url
  }

  // draw_background_image(canvas, background_image_url, opacity) {
  //   const image = new Image();
  //   image.src = background_image_url;
  //   image.onload = () => {
  //     const ctx = canvas.getContext("2d")
  //     canvas.width = image.width
  //     canvas.height = image.height
  //     ctx.globalAlpha = opacity || 0.4;
  //     ctx.drawImage(image, 0, 0, image.width, image.height);
  //   }
  // }

  draw() {

    if (!this._grad) {
      this.gradient(this.config.gradient);
    }
    if (!this._circle) {
      this.radius(this.config.brush_size, this.config.brush_blur_size);
    }

    // Dispaly Background Image With Opacity
    // this.draw_background_image(0.4)

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw a grayscale heatmap by putting a blurred circle at each data point
    for (var i = 0, len = this.data.length, p; i < len; i++) {
        p = this.data[i];

        this.ctx.globalAlpha = Math.max(p[2] / this.max, this.min === undefined ? 0.05 : this.min);
        this.ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
    }

    // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
    var colored = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.colorize(colored.data, this._grad);
    this.ctx.putImageData(colored, 0, 0);
  }

  radius(r, blur) {
      blur = blur || 15;

      // create a grayscale blurred circle image that we'll use for drawing points
      var circle = this._circle = document.createElement('canvas'),
          ctx = circle.getContext('2d'),
          r2 = this._r = r + blur;

      circle.width = circle.height = r2 * 2;

      ctx.shadowOffsetX = ctx.shadowOffsetY = 200;
      ctx.shadowBlur = blur;
      ctx.shadowColor = 'black';

      ctx.beginPath();
      ctx.arc(r2 - 200, r2 - 200, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();

      return this;
  }

  colorize(pixels, gradient) {
    for (var i = 3, len = pixels.length, j; i < len; i += 4) {
      j = pixels[i] * 4; // get gradient color from opacity value

      if (j) {
        pixels[i - 3] = gradient[j];
        pixels[i - 2] = gradient[j + 1];
        pixels[i - 1] = gradient[j + 2];
      }
    }
  }

  // Generate Gradient Canvas
  gradient(grad) {
    // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
     var canvas = document.createElement('canvas'),
         ctx = canvas.getContext('2d'),
         gradient = ctx.createLinearGradient(0, 0, 0, 256);

     canvas.width = 1;
     canvas.height = 256;

     for (var i in grad) {
         gradient.addColorStop(i, grad[i]);
     }

     ctx.fillStyle = gradient;
     ctx.fillRect(0, 0, 1, 256);

     this._grad = ctx.getImageData(0, 0, 1, 256).data;

     return this;
  }

}

export { Heatmap }