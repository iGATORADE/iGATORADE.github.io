// Lista EXATA das suas 11 classes na ORDEM do Teachable Machine
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

// Função para formatar os nomes para exibição
function formatClassName(fullName) {
    const [classe, familia] = fullName.split('-');
    return familia 
        ? `<span class="class">${classe}</span>-<span class="family">${familia}</span>`
        : fullName;
}

async function analyzeImage(img) {
    const tensor = tf.browser.fromPixels(img)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();
    
    const predictions = await model.predict(tensor).data();
    showResults(predictions);
}

function showResults(predictions) {
    const results = CLASSES.map((className, index) => ({
        className,
        probability: predictions[index]
    })).sort((a, b) => b.probability - a.probability);

    let html = `<h3>Identificação de Microalgas</h3>
               <div class="confidence-meter">
                   <div class="confidence-bar" style="width:${results[0].probability * 100}%"></div>
               </div>`;
    
    // Top 3 resultados
    results.slice(0, 3).forEach((res, i) => {
        html += `
        <div class="result-item ${i === 0 ? 'top-result' : ''}">
            <div class="rank">${i + 1}º</div>
            <div class="name">${formatClassName(res.className)}</div>
            <div class="percentage">${(res.probability * 100).toFixed(1)}%</div>
        </div>`;
    });

    document.getElementById('results').innerHTML = html;
}

// Inicialização
let model;
(async function() {
    model = await tf.loadLayersModel('model/model.json');
    console.log("Modelo carregado para 11 classes!");
})();