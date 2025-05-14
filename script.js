// Banco de dados simplificado de microalgas
const microalgasDB = {
    "Chlorella": {
        caracteristicas: "Forma esférica, verde intenso",
        tamanho: "5-10 μm"
    },
    "Spirulina": {
        caracteristicas: "Forma espiralada, azul-esverdeada",
        tamanho: "3-5 μm de largura"
    },
    "Microcystis": {
        caracteristicas: "Colônias arredondadas, verde-azuladas",
        tamanho: "3-7 μm"
    }
};

// Elementos da página
const dropZone = document.getElementById('dropZone');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const resultsDiv = document.getElementById('results');

// Configuração da zona de arrastar e soltar
dropZone.addEventListener('click', () => imageUpload.click());
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '#e6f7ed';
});
dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = '';
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = '';
    if (e.dataTransfer.files.length) {
        imageUpload.files = e.dataTransfer.files;
        processImage(e.dataTransfer.files[0]);
    }
});

// Quando uma imagem é selecionada
imageUpload.addEventListener('change', (e) => {
    if (e.target.files.length) {
        processImage(e.target.files[0]);
    }
});

// Processa a imagem e faz a "identificação"
function processImage(file) {
    // Limpa resultados anteriores
    imagePreview.innerHTML = '';
    resultsDiv.innerHTML = 'Analisando...';
    
    // Mostra a imagem carregada
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        imagePreview.appendChild(img);
        
        // Simulação de análise (substitua por sua lógica real)
        setTimeout(() => {
            identifyMicroalgae(img);
        }, 1500);
    };
    reader.readAsDataURL(file);
}

// Função que "identifica" as microalgas (simulação)
function identifyMicroalgae(imgElement) {
    // Esta é uma simulação - na prática você usaria TensorFlow.js ou uma API
    const randomMicroalga = Object.keys(microalgasDB)[Math.floor(Math.random() * Object.keys(microalgasDB).length)];
    const contagem = Math.floor(Math.random() * 50) + 10;
    
    resultsDiv.innerHTML = `
        <h3>Resultado da Análise:</h3>
        <p><strong>Microalga identificada:</strong> ${randomMicroalga}</p>
        <p><strong>Contagem estimada:</strong> ${contagem} células</p>
        <p><strong>Características:</strong> ${microalgasDB[randomMicroalga].caracteristicas}</p>
        <p><strong>Tamanho médio:</strong> ${microalgasDB[randomMicroalga].tamanho}</p>
    `;
    
    // Na prática, aqui você integraria com:
    // 1. TensorFlow.js para análise no navegador
    // 2. Ou uma API backend que processa a imagem
}