let currentImgSrc = '';
let nativeWidth = 0;
let nativeHeight = 0;
let selectedRatio = 1; 
let ratioMode = '1:1';
let backgroundType = 'blur'; 
let chromaColor = '#6366f1';
let blurRadius = 24;

const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const canvasContainer = document.getElementById('canvas-container');
const previewImg = document.getElementById('preview-img');
const blurBg = document.getElementById('blur-bg');
const solidBg = document.getElementById('solid-bg');
const colorPicker = document.getElementById('color-picker');
const colorHex = document.getElementById('color-hex');
const downloadBtn = document.getElementById('download-btn');
const ratioBadge = document.getElementById('ratio-badge');
const blurSlider = document.getElementById('blur-slider');
const blurValDisplay = document.getElementById('blur-val-display');
const blurIntensityWrapper = document.getElementById('blur-intensity-wrapper');
const blurMinus = document.getElementById('blur-minus');
const blurPlus = document.getElementById('blur-plus');

uploadPlaceholder.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); uploadPlaceholder.classList.add('scale-95'); });
uploadPlaceholder.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); uploadPlaceholder.classList.remove('scale-95'); });
uploadPlaceholder.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadPlaceholder.classList.remove('scale-95');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
});

imageInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleFile(e.target.files[0]);
});

function handleFile(file) {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            nativeWidth = img.width;
            nativeHeight = img.height;
            currentImgSrc = event.target.result;
            
            uploadPlaceholder.classList.add('hidden');
            canvasContainer.classList.remove('hidden');
            downloadBtn.removeAttribute('disabled');
            downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');

            previewImg.src = currentImgSrc;
            blurBg.style.backgroundImage = `url('${currentImgSrc}')`;
            
            updateCanvasDimensions();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function setRatio(label, targetVal) {
    ratioMode = label;
    selectedRatio = targetVal;
    ratioBadge.innerText = label;

    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.classList.remove('border-indigo-500', 'bg-indigo-500/10', 'text-white');
        btn.classList.add('text-gray-400');
        if(btn.innerText.includes(label)) {
            btn.classList.add('border-indigo-500', 'bg-indigo-500/10', 'text-white');
            btn.classList.remove('text-gray-400');
        }
    });

    updateCanvasDimensions();
}

function setBgType(type) {
    backgroundType = type;
    const blurBtn = document.getElementById('bg-blur-btn');
    const solidBtn = document.getElementById('bg-solid-btn');
    const pickerWrapper = document.getElementById('color-picker-wrapper');

    if (type === 'blur') {
        blurBtn.className = "bg-indigo-500/10 border border-indigo-500 text-white p-3.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all";
        solidBtn.className = "bg-white/5 border border-white/10 text-gray-400 p-3.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all";
        pickerWrapper.classList.add('hidden', 'opacity-0');
        blurIntensityWrapper.classList.remove('hidden');
        blurBg.style.opacity = '1';
        solidBg.style.backgroundColor = 'transparent';
    } else {
        solidBtn.className = "bg-indigo-500/10 border border-indigo-500 text-white p-3.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all";
        blurBtn.className = "bg-white/5 border border-white/10 text-gray-400 p-3.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-all";
        pickerWrapper.classList.remove('hidden');
        blurIntensityWrapper.classList.add('hidden');
        setTimeout(() => pickerWrapper.classList.remove('opacity-0'), 10);
        blurBg.style.opacity = '0';
        solidBg.style.backgroundColor = chromaColor;
    }
}

blurSlider.addEventListener('input', (e) => {
    blurRadius = e.target.value;
    blurValDisplay.innerText = `${blurRadius}px`;
    blurBg.style.filter = `blur(${blurRadius}px)`;
});

blurMinus.addEventListener('click', () => {
    let newVal = Math.max(0, parseInt(blurSlider.value) - 1);
    blurSlider.value = newVal;
    blurRadius = newVal;
    blurValDisplay.innerText = `${blurRadius}px`;
    blurBg.style.filter = `blur(${blurRadius}px)`;
});

blurPlus.addEventListener('click', () => {
    let newVal = Math.min(100, parseInt(blurSlider.value) + 1);
    blurSlider.value = newVal;
    blurRadius = newVal;
    blurValDisplay.innerText = `${blurRadius}px`;
    blurBg.style.filter = `blur(${blurRadius}px)`;
});

function updateCanvasDimensions() {
    if (!currentImgSrc) return;

    let finalRatio = selectedRatio;
    if (selectedRatio === 'full') {
        finalRatio = nativeWidth / nativeHeight;
        ratioBadge.innerText = `Full (${nativeWidth}:${nativeHeight})`;
    }

    const viewportWidth = Math.min(window.innerWidth * 0.9, 650);
    const viewportHeight = window.innerHeight * 0.55;

    let targetWidth = viewportWidth;
    let targetHeight = targetWidth / finalRatio;

    if (targetHeight > viewportHeight) {
        targetHeight = viewportHeight;
        targetWidth = targetHeight * finalRatio;
    }

    canvasContainer.style.width = `${targetWidth}px`;
    canvasContainer.style.height = `${targetHeight}px`;

    blurBg.style.filter = `blur(${blurRadius}px)`;
    if (backgroundType === 'blur') blurBg.style.opacity = '1';
}

colorPicker.addEventListener('input', (e) => {
    chromaColor = e.target.value;
    colorHex.value = chromaColor;
    if (backgroundType === 'solid') solidBg.style.backgroundColor = chromaColor;
});

colorHex.addEventListener('input', (e) => {
    if(e.target.value.match(/^#[0-9A-F]{6}$/i)) {
        chromaColor = e.target.value;
        colorPicker.value = chromaColor;
        if (backgroundType === 'solid') solidBg.style.backgroundColor = chromaColor;
    }
});

downloadBtn.addEventListener('click', () => {
    if (!currentImgSrc) return;

    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');

    let finalRatio = selectedRatio;
    if (selectedRatio === 'full') finalRatio = nativeWidth / nativeHeight;

    let outWidth = nativeWidth;
    let outHeight = nativeWidth / finalRatio;

    if (outHeight < nativeHeight) {
        outHeight = nativeHeight;
        outWidth = outHeight * finalRatio;
    }

    exportCanvas.width = outWidth;
    exportCanvas.height = outHeight;

    const baseImg = new Image();
    baseImg.onload = () => {
        if (backgroundType === 'solid') {
            ctx.fillStyle = chromaColor;
            ctx.fillRect(0, 0, outWidth, outHeight);
            renderForegroundAsset();
        } else {
            ctx.filter = `blur(${blurRadius}px)`;
            
            let bgWidth = outWidth;
            let bgHeight = (outWidth / nativeWidth) * nativeHeight;
            
            if (bgHeight < outHeight) {
                bgHeight = outHeight;
                bgWidth = (outHeight / nativeHeight) * nativeWidth;
            }
            
            const bgX = (outWidth - bgWidth) / 2;
            const bgY = (outHeight - bgHeight) / 2;
            
            ctx.drawImage(baseImg, bgX - 55, bgY - 55, bgWidth + 110, bgHeight + 110);
            ctx.filter = 'none';
            
            ctx.fillStyle = "rgba(0,0,0,0.15)";
            ctx.fillRect(0, 0, outWidth, outHeight);

            renderForegroundAsset();
        }

        function renderForegroundAsset() {
            const fgX = (outWidth - nativeWidth) / 2;
            const fgY = (outHeight - nativeHeight) / 2;
            ctx.drawImage(baseImg, fgX, fgY, nativeWidth, nativeHeight);

            const link = document.createElement('a');
            link.download = 'scale-forge-export.png';
            link.href = exportCanvas.toDataURL('image/png');
            link.click();
        }
    };
    baseImg.src = currentImgSrc;
});
        
