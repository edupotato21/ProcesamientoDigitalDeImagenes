const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image1 = new Image();
const file = document.getElementById('file').onchange = function (e) {
    let reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function () {
        image1.src = reader.result;
    }
}

// image1.crossOrigin = 'anonymous';
image1.addEventListener('load', function () {
    canvas.width = image1.width;
    canvas.height = image1.height;
    ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
    const scannedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(scannedImage);
    let imgData = scannedImage.data;
    let histograma = new Array(255);
    for (let i = 0; i < histograma.length; i++) {
        histograma[i] = 0;
    }
    /* Filters */
    const blackAndWhite = function () {
        for (let i = 0; i < imgData.length; i += 4) {
            const total = imgData[i] + imgData[i + 1] + imgData[i + 2];
            const averageColorValue = total / 3;
            imgData[i] = Math.round(averageColorValue);
            imgData[i + 1] = Math.round(averageColorValue);
            imgData[i + 2] = Math.round(averageColorValue);
            histograma[Math.round(averageColorValue)] += 1;
        }
        scannedImage.data = imgData;
        ctx.putImageData(scannedImage, 0, 0);
        console.log(histograma);
    };
    const invert = function () {
        for (let i = 0; i < imgData.length; i += 4) {
            imgData[i] = 255 - imgData[i];
            imgData[i + 1] = 255 - imgData[i + 1];
            imgData[i + 2] = 255 - imgData[i + 2];
        }
        scannedImage.data = imgData;
        ctx.putImageData(scannedImage, 0, 0);
    };
    const aclarar = function () {
        for (let i = 0; i < imgData.length; i += 4) {
            imgData[i] += 100;
            imgData[i + 1] += 100;
            imgData[i + 2] += 100;
        }
        scannedImage.data = imgData;
        ctx.putImageData(scannedImage, 0, 0);
    };
    const restaurarImagen = function () {

    }
    const guardarImagen = function () {
        var link = window.document.createElement('a'),
            url = canvas.toDataURL('image/png'),
            filename = 'screenshot.jpg';

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    }
    /*Eventos de los botones*/
    const filter1 = document.getElementById('black');
    filter1.addEventListener('click', blackAndWhite);
    const filter2 = document.getElementById('invert');
    filter2.addEventListener('click', invert);
    const filter3 = document.getElementById('aclarar');
    filter3.addEventListener('click', aclarar);
    /*RESTAURAR IMAGEN*/
    const restaurar = document.getElementById('restaurar');
    restaurar.addEventListener('click', restaurarImagen);
    /* DESCARGAR IMAGEN */
    const download = document.getElementById('btn_descarga');
    download.addEventListener('click', guardarImagen);
})

