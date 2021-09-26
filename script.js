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

image1.addEventListener('load', function () {
    canvas.width = image1.width;
    canvas.height = image1.height;
    canvas.style.width = "500px";
    ctx.drawImage(image1, 0, 0, canvas.width, canvas.height);
    const scannedImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log(scannedImage);
    let imgData = scannedImage.data;
    let histograma = new Array(256);
    for (let i = 0; i < histograma.length; i++) {
        histograma[i] = 0;
    }
    /* Filters */
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
    const blackAndWhite = function () {
        /* GOOGLE CHARTS */
        let hisData = [];
        for (let i = 0; i < histograma.length; i++) {
            hisData.push([i, histograma[i]]);
        }
        google.charts.load('current', { 'packages': ['bar'] });
        google.charts.setOnLoadCallback(drawStuff);

        function drawStuff() {
            var data = new google.visualization.DataTable();
            data.addColumn('number', 'color');
            data.addColumn('number', 'total');
            data.addRows(hisData);
            var options = {
                width: 800,
                legend: { position: 'none' },
                chart: {
                    title: 'Histograma',
                    subtitle: 'En escala de grises'
                },
                axes: {
                    x: {
                        0: { side: 'bottom', label: 'Tonos de gris' } // Top x-axis.
                    }
                },
                bar: { groupWidth: "100%" }
            };

            var chart = new google.charts.Bar(document.getElementById('image_histogram'));
            // Convert the Classic options to Material options.
            chart.draw(data, google.charts.Bar.convertOptions(options));
        };
    };

    const expansion = function () {
        /* INICIALIAZACIÓN DE VARIABLES */
        let x1 = null, x2 = 0;
        let y1 = 1, y2 = 255;
        let tem = new Array(256);
        let gris = new Array(256);
        for (let i = 0; i < tem.length; i++) {
            tem[i] = 0;
        }
        for (let i = 0; i < gris.length; i++) {
            gris[i] = 0;
        }
        /* ALGORITMO DE EXPANSIÓN */
        for (let i = 0; i < histograma.length; i++) {
            if (x1 == null && histograma[i] >= 1) {
                x1 = i;
            }
            if (histograma[i] != 0) {
                x2 = i;
            }
        }
        let pendiente = (y2 - y1) / (x2 - x1);
        let b = y1 - (pendiente * x1);
        for (let i = 0; i < histograma.length; i++) {
            if (histograma[i] != 0) {
                let tx = Math.round((pendiente * i) + b);
                tem[tx] += histograma[i];
                gris[i] = tx;
            }
        }
        for (let i = 0; i < imgData.length; i += 4) {
            let nuevoGris = gris[imgData[i]];
            imgData[i] = nuevoGris;
            imgData[i + 1] = nuevoGris;
            imgData[i + 2] = nuevoGris;
        }
        scannedImage.data = imgData;
        ctx.putImageData(scannedImage, 0, 0);
        histograma = tem;
    };
    const ecualizacion = function () {
        let pixeles = canvas.width * canvas.height;
        let nk = new Array(256);
        let prrk = new Array(256);
        let sk = new Array(256);
        let tem = new Array(256);
        let suma = 0;
        for (let i = 0; i < nk.length; i++) {
            nk[i] = 0;
            tem[i] = 0;
        }
        for (let i = 0; i < imgData.length; i += 4) {
            nk[imgData[i]] += 1;
        }
        for (let i = 0; i < prrk.length; i++) {
            prrk[i] = nk[i] / pixeles;
        }
        for (let i = 0; i < sk.length; i++) {
            suma += prrk[i];
            sk[i] = Math.round((256 - 1) * suma);
            tem[sk[i]] += prrk[i];
        }
        for (let i = 0; i < imgData.length; i += 4) {
            let nuevoTono = sk[imgData[i]];
            imgData[i] = nuevoTono;
            imgData[i + 1] = nuevoTono;
            imgData[i + 2] = nuevoTono;
        }
        for (let i = 0; i < tem.length; i++) {
            tem[i] = tem[i] * pixeles;
        }
        scannedImage.data = imgData;
        ctx.putImageData(scannedImage, 0, 0);
        histograma = tem;
    };

    const restaurarImagen = function () {
        console.log("asdsad");
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
    const filter2 = document.getElementById('expansion');
    filter2.addEventListener('click', expansion);
    const filter3 = document.getElementById('ecualizacion');
    filter3.addEventListener('click', ecualizacion);
    /*RESTAURAR IMAGEN*/
    const restaurar = document.getElementById('restaurar');
    restaurar.addEventListener('click', restaurarImagen);
    /* DESCARGAR IMAGEN */
    const download = document.getElementById('btn_descarga');
    download.addEventListener('click', guardarImagen);
})