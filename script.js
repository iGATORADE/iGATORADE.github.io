// Configuração das 11 classes
const CLASSES = [
    "Chlorophyceae-Hydrodictyaceae",
    "Chlorophyceae-Radiococcaceae",
    "Chlorophyceae-Scenedesmaceae",
    "Chlorophyceae-Sphaeropleales",
    "Chlorophyceae-Treubariaceae",
    "Cyanobacteria",
    "Klebsormidiophy-Elakatotrichaceae",
    "Trebouxiophyceae-Botryococcaceae",
    "Trebouxiophyceae-Chlorellaceae",
    "Trebouxiophyceae-Oocystaceae",
    "Tribophyceae-Centritractaceae"
];

// Elementos da página
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('imageUpload');
const fileInfo = document.getElementById('fileInfo');
let model;

// 1. Configuração do Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => {
        dropZone.classList.remove('dragover');
    });
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleFiles(e.dataTransfer.files);
    }
});

fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
        handleFiles(fileInput.files);
    }
});

// 2. Carregamento do Modelo
async function init() {
    try {
        model = await tf.loadLayersModel('model/model.json');
        console.log("✅ Modelo carregado para 11 classes");
    } catch (error) {
        console.error("❌ Erro ao carregar modelo:", error);
        fileInfo.innerHTML = '<p class="error">Erro ao carregar o modelo</p>';
    }
}

// 3. Processamento de Imagens
function handleFiles(files) {
    const file = files[0];
    if (!file.type.match('image.*')) {
        fileInfo.innerHTML = '<p class="error">⚠️ Selecione uma imagem válida (JPG/PNG)</p>';
        return;
    }

    fileInfo.innerHTML = `<p>Arquivo: <strong>${file.name}</strong> (${(file.size/1024).toFixed(1)}KB)</p>`;
    
    const reader = new FileReader();
    reader.onload = async function(e) {
        const img = new Image();
        img.src = e.target.result;
        img.onload = async () => {
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('imagePreview').appendChild(img);
            await analyzeImage(img);
        };
    };
    reader.readAsDataURL(file);
}

// 4. Análise e Resultados
async function analyzeImage(img) {
    if (!model) {
        fileInfo.innerHTML = '<p class="error">Modelo não carregado</p>';
        return;
    }

    showLoader(true);
    fileInfo.innerHTML += '<p>Analisando imagem...</p>';

    try {
        const tensor = tf.tidy(() => {
            return tf.browser.fromPixels(img)
                .resizeNearestNeighbor([224, 224])
                .toFloat()
                .expandDims();
        });

        const predictions = await model.predict(tensor).data();
        tensor.dispose();
        showResults(predictions);

    } catch (error) {
        console.error("Erro na análise:", error);
        fileInfo.innerHTML = '<p class="error">Erro ao processar imagem</p>';
    } finally {
        showLoader(false);
    }
}

function showResults(predictions) {
    const results = CLASSES.map((className, index) => ({
        className,
        probability: predictions[index]
    })).sort((a, b) => b.probability - a.probability);

    let html = `
    <div class="header-result">
        <h3>Resultado da Análise</h3>
        <div class="confidence-meter">
            <div class="confidence-bar" style="width:${results[0].probability * 100}%"></div>
        </div>
    </div>`;

    results.slice(0, 3).forEach((res, i) => {
        const [classe, familia] = res.className.split('-');
        html += `
        <div class="result-item ${i === 0 ? 'top-result' : ''}">
            <div class="rank">${i + 1}º</div>
            <div class="name">
                ${classe}${familia ? `<span class="family">-${familia}</span>` : ''}
            </div>
            <div class="percentage">${(res.probability * 100).toFixed(1)}%</div>
        </div>`;
    });

    document.getElementById('results').innerHTML = html;
    fileInfo.innerHTML += `<p>Análise concluída!</p>`;
}

// Funções auxiliares
function showLoader(show) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
}

// Inicialização
document.addEventListener('DOMContentLoaded', init);