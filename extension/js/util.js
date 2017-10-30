export const resizeImage = (base64image) => (
  new Promise((resolve, reject) => {
    const MIN_SIZE = 256;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = "Anonymous";

    image.onload = function(event) {
      var dstWidth, dstHeight;
      if (this.width > this.height) {
        dstWidth = MIN_SIZE;
        dstHeight = this.height * MIN_SIZE / this.width;
      } else {
        dstHeight = MIN_SIZE;
        dstWidth = this.width * MIN_SIZE / this.height;
      }
      canvas.width = dstWidth;
      canvas.height = dstHeight;

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(this, 0, 0, this.width, this.height, 0, 0, dstWidth, dstHeight);

      resolve(canvas.toDataURL());
    };

    image.src = base64image;
  })
);