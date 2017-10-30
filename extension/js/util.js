export const resizeImage = (base64image) => (
  new Promise((resolve, reject) => {
    const MIN_SIZE = 256;

    const canvas = document.createElement('canvas');
    canvas.width = MIN_SIZE;

    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.crossOrigin = "Anonymous";

    // https://stackoverflow.com/a/19262385
    image.onload = function() {

      /// set size proportional to image
      canvas.height = canvas.width * (image.height / image.width);

      /// step 1 - resize to 50%
      var oc = document.createElement('canvas'),
        octx = oc.getContext('2d');

      oc.width = image.width * 0.5;
      oc.height = image.height * 0.5;
      octx.drawImage(image, 0, 0, oc.width, oc.height);

      /// step 2 - resize 50% of step 1
      octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);

      /// step 3, resize to final size
      ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
        0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL());
    };

    image.onerror = function(event) {
      reject(event)
    };

    image.src = base64image;
  })
);