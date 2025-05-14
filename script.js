// Configuração das 11 classes na ORDEM EXATA do modelo
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

// Variável global do modelo
let model;

// 1. INICIALIZAÇÃO ======================================
async function init() {
    try {
        // Carrega o modelo com cache controlado
        model = await tf.loadLayersModel('model/model.json?t=' + new Date().getTime());
        console.log("✅ Modelo carregado para 11 classes");
        console.log("Classes configuradas:", CLASSES);
    } catch (error) {
        console.error("❌ Erro ao carregar modelo:", error);
        alert("Erro ao carregar o modelo. Verifique o console.");
    }
}

// 2. ANÁLISE DE IMAGEM =================================
async function analyzeImage(imgElement) {
    if (!model) {
        alert("Modelo não carregado. Recarregue a página.");
        return;
    }

    showLoader(true);

    try {
        // Pré-processamento
        const tensor = tf.tidy(() => {
            return tf.browser.fromPixels(imgElement)
                .resizeNearestNeighbor([224, 224])
                .toFloat()
                .expandDims();
        });

        // Predição
        const predictions = await model.predict(tensor).data();
        tensor.dispose();

        // Exibe resultados
        showResults(predictions);

    } catch (error) {
        console.error("Erro na análise:", error);
        alert("Erro ao processar imagem");
    } finally {
        showLoader(false);
    }
}

// 3. EXIBIÇÃO DE RESULTADOS ============================
function showResults(predictions) {
    // Mapeia probabilidades para as classes
    const results = CLASSES.map((className, index) => ({
        className,
        probability: predictions[index]
    })).sort((a, b) => b.probability - a.probability);

    // Debug no console
    console.table(results);

    // Gera HTML
    let html = `
    <div class="header-result">
        <h3>Identificação de Microalgas</h3>
        <div class="confidence-meter">
            <div class="confidence-bar" 
                 style="width:${results[0].probability * 100}%">
            </div>
        </div>
    </div>`;

    // Top 3 resultados
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

    // Atualiza a página
    document.getElementById('results').innerHTML = html;
}

// 4. CONTROLE DE LOADER ================================
function showLoader(show) {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// 5. UPLOAD DE IMAGEM ==================================
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const img = document.createElement('img');
        img.src = event.target.result;
        img.onload = function() {
            document.getElementById('imagePreview').innerHTML = '';
            document.getElementById('imagePreview').appendChild(img);
            analyzeImage(img);
        };
    };
    reader.readAsDataURL(file);
});

// 6. INICIALIZAÇÃO AO CARREGAR A PÁGINA ================
document.addEventListener('DOMContentLoaded', () => {
    init();
    console.log("🔄 Página carregada. Pronto para análises.");
});