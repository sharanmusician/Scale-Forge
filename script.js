Let currentImgSrc = '';
let nativeWidth = 0;
let nativeHeight = 0;
let selectedRatio = 1; 
let ratioMode = '1:1';
let isFullscreen = false;
let backgroundType = 'blur'; 
let chromaColor = '#6366f1';
let chromaOpacity = 1;
let blurRadius = 24;

let panOffsetX = 0;
let panOffsetY = 0;
let currentZoom = 1;
let isDragging = false;
let startX = 0;
let startY = 0;

let initialPinchDist = 0;
let initialZoom = 1;
let initialPanX = 0;
let initialPanY = 0;
let pinchMidX = 0;
let pinchMidY = 0;

const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const canvasContainer = document.getElementById('canvas-container');
const previewImg = document.getElementById('preview-img');
const blurBg = document.getElementById('blur-bg');
const solidBg = document.getElementById('solid-bg');
const colorHex = document.getElementById('color-hex');
const downloadBtn = document.getElementById('download-btn');
const ratioBadge = document.getElementById('ratio-badge');
const blurSlider = document.getElementById('blur-slider');
const blurValDisplay = document.getElementById('blur-val-display');
const blurIntensityWrapper = document.getElementById('blur-intensity-wrapper');
const blurMinus = document.getElementById('blur-minus');
const blurPlus = document.getElementById('blur-plus');
const replacePhotoBtn = document.getElementById('replace-photo-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

const wheelCanvas = document.getElementById('wheel-canvas');
const wheelCursor = document.getElementById('wheel-cursor');
const opacitySlider = document.getElementById('opacity-slider');
const opacityVal = document.getElementById('opacity-val');
const opacityMinus = document.getElementById('opacity-minus');
const opacityPlus = document.getElementById('opacity-plus');
const colorPreviewPatch = document.getElementById('color-preview-patch');

const miniPlaceholder = document.getElementById('mini-placeholder');
const miniPreviewContainer = document.getElementById('mini-preview-container');
const miniPreviewImg = document.getElementById('mini-preview-img');
const miniBlurBg = document.getElementById('mini-blur-bg');
const miniSolidBg = document.getElementById('mini-solid-bg');

let currentHue = 239;
let currentSaturation = 80;
let currentLightness = 66; 

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

replacePhotoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    imageInput.click();
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
            
            panOffsetX = 0;
            panOffsetY = 0;
            currentZoom = 1;

            uploadPlaceholder.classList.add('hidden');
            canvasContainer.classList.remove('hidden');
            
            if (miniPlaceholder) miniPlaceholder.classList.add('hidden');
            miniPreviewImg.classList.remove('hidden');
            replacePhotoBtn.classList.remove('hidden');

            downloadBtn.removeAttribute('disabled');
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');

            previewImg.src = currentImgSrc;
            miniPreviewImg.src = currentImgSrc;
            blurBg.style.backgroundImage = `url('${currentImgSrc}')`;
            miniBlurBg.style.backgroundImage = `url('${currentImgSrc}')`;
            
            updateCanvasDimensions();
            updateChromaBackground();

            imageInput.value = '';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function setRatio(label, targetVal) {
    ratioMode = label;
    selectedRatio = targetVal;
    ratioBadge.innerText = isFullscreen ? `${label} (Full Screen)` : label;
    panOffsetX = 0;
    panOffsetY = 0;
    currentZoom = 1;

    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.className = "ratio-btn w-full h-[54px] bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04] px-4 rounded-xl flex items-center gap-3 text-xs font-medium transition-all text-left flex-shrink-0";
        if(btn.innerText.includes(label)) {
            btn.className = "ratio-btn w-full h-[54px] bg-indigo-500/10 border border-indigo-500 text-white px-4 rounded-xl flex items-center gap-3 text-xs font-medium transition-all text-left flex-shrink-0";
        }
    });

    updateCanvasDimensions();
}

function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    panOffsetX = 0;
    panOffsetY = 0;
    currentZoom = 1;

    if (isFullscreen) {
        fullscreenBtn.className = "w-full h-[50px] bg-indigo-500/10 border border-indigo-500 text-white px-4 rounded-xl flex items-center justify-center gap-3 text-xs font-medium transition-all flex-shrink-0 mt-3";
        ratioBadge.innerText = `${ratioMode} (Full Screen)`;
    } else {
        fullscreenBtn.className = "w-full h-[50px] bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04] px-4 rounded-xl flex items-center justify-center gap-3 text-xs font-medium transition-all flex-shrink-0 mt-3";
        ratioBadge.innerText = ratioMode;
    }

    updateCanvasDimensions();
}

function setBgType(type) {
    backgroundType = type;
    const blurBtn = document.getElementById('bg-blur-btn');
    const solidBtn = document.getElementById('bg-solid-btn');
    const pickerWrapper = document.getElementById('color-picker-wrapper');

    if (type === 'blur') {
        blurBtn.className = "bg-indigo-500/10 border border-indigo-500/30 text-white px-5 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-2 transition-all";
        solidBtn.className = "bg-transparent text-gray-400 hover:text-white px-5 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-2 transition-all";
        pickerWrapper.classList.add('hidden', 'opacity-0');
        blurIntensityWrapper.classList.remove('hidden');
        
        blurBg.style.opacity = '1';
        if (currentImgSrc) miniBlurBg.style.opacity = '1';
        solidBg.style.backgroundColor = 'transparent';
        miniSolidBg.style.backgroundColor = 'transparent';
    } else {
        solidBtn.className = "bg-indigo-500/10 border border-indigo-500/30 text-white px-5 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-2 transition-all";
        blurBtn.className = "bg-transparent text-gray-400 hover:text-white px-5 py-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-2 transition-all";
        pickerWrapper.classList.remove('hidden');
        blurIntensityWrapper.classList.add('hidden');
        setTimeout(() => pickerWrapper.classList.remove('opacity-0'), 10);
        
        blurBg.style.opacity = '0';
        miniBlurBg.style.opacity = '0';
        drawColorWheel();
        updateCursorPosition();
        updateChromaBackground();
    }
}


This is script
