const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
const image1 = new Image();
let imageName = '';
const file = document.getElementById('file').onchange = function (e) {
    let reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function () {
        image1.src = reader.result;
    }
}

image1.addEventListener('load', function () {
    document.querySelector('.canvas').style.display = 'flex';
    document.querySelector('.canvas-image').style.display = 'none';
    canvas.width = image1.width;
    canvas.height = image1.height;
    canvas.style.width = "600px";
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
    const showHistograma = function () {
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
                width: 700,
                height: 400,
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
            chart.draw(data, google.charts.Bar.convertOptions(options));
        };
        document.querySelector('.histograma').style.display = 'block';
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

    const guardarImagen = function (e) {
        e.preventDefault();
        let nombreImg = document.querySelector('#txtNombreArchivo').value;
        let formatoImg = document.querySelector('#select-formato').value;
        console.log(nombreImg);
        console.log(formatoImg);
        var link = window.document.createElement('a');
        var url = canvas.toDataURL(`image/jpg`);
        var filename = `${nombreImg}.${formatoImg}`;

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
    }

    /*Eventos de los botones*/
    const filter1 = document.getElementById('histograma');
    filter1.addEventListener('click', showHistograma);
    const filter2 = document.getElementById('expansion');
    filter2.addEventListener('click', expansion);
    const filter3 = document.getElementById('ecualizacion');
    filter3.addEventListener('click', ecualizacion);
    /* DESCARGAR IMAGEN */
    const download = document.getElementById('btn_descarga');
    download.addEventListener('click', guardarImagen);
    /* MODAL */
    let cerrar = document.querySelector('.close');
    let abrir = document.querySelector('#cta');
    let modal = document.querySelector('.modal');
    let modalC = document.querySelector('.modal-container');

    abrir.addEventListener('click', function (e) {
        e.preventDefault();
        modalC.style.opacity = '1';
        modalC.style.visibility = 'visible';
        modal.classList.toggle('modal-close');
    });

    cerrar.addEventListener('click', function () {
        modal.classList.toggle('modal-close');
        setTimeout(function () {
            modalC.style.opacity = '0';
            modalC.style.visibility = 'hidden';
        }, 600);
    });

    window.addEventListener('click', function (e) {
        if (e.target == modalC) {
            modal.classList.toggle('modal-close');
            setTimeout(function () {
                modalC.style.opacity = '0';
                modalC.style.visibility = 'hidden';
            }, 600);
        }
    });
});
