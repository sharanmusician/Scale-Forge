let currentImgSrc = '';
let nativeWidth = 0;
let nativeHeight = 0;
let selectedRatio = 1; 
let ratioMode = '1:1';
let isFullScreenMode = false;
let backgroundType = 'blur'; 
let chromaColor = '#6366f1';
let chromaOpacity = 1;
let blurRadius = 24;

// Transformation tracking for crop/drag functionality
let imgScale = 1;
let imgPosX = 0;
let imgPosY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

const imageInput = document.getElementById('image-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const canvasContainer = document.getElementById('canvas-container');
const previewImg = document.getElementById('preview-img');
const miniPreviewImg = document.getElementById('mini-preview-img');
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
            
            resetTransformations();
            updateCanvasDimensions();
            updateChromaBackground();

            imageInput.value = '';
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

function resetTransformations() {
    imgScale = 1;
    imgPosX = 0;
    imgPosY = 0;
    applyTransform();
}

function setRatio(label, targetVal) {
    isFullScreenMode = false;
    ratioMode = label;
    selectedRatio = targetVal;
    ratioBadge.innerText = label;

    document.querySelectorAll('.ratio-btn').forEach(btn => {
        btn.className = "ratio-btn w-full h-[54px] bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04] px-4 rounded-xl flex items-center gap-3 text-xs font-medium transition-all text-left flex-shrink-0";
        if(btn.innerText.includes(label)) {
            btn.className = "ratio-btn w-full h-[54px] bg-indigo-500/10 border border-indigo-500 text-white px-4 rounded-xl flex items-center gap-3 text-xs font-medium transition-all text-left flex-shrink-0";
        }
    });

    fullscreenBtn.className = "w-full h-[50px] bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04] px-4 rounded-xl flex items-center justify-center gap-3 text-xs font-medium transition-all flex-shrink-0 mt-3 select-none";

    resetTransformations();
    updateCanvasDimensions();
}

function toggleFullScreen() {
    isFullScreenMode = !isFullScreenMode;
    
    if (isFullScreenMode) {
        ratioBadge.innerText = `${ratioMode} (Full Screen)`;
        fullscreenBtn.className = "w-full h-[50px] bg-indigo-500/10 border border-indigo-500 text-white px-4 rounded-xl flex items-center justify-center gap-3 text-xs font-medium transition-all flex-shrink-0 mt-3 select-none";
        
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            btn.className = "ratio-btn w-full h-[54px] bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04] px-4 rounded-xl flex items-center gap-3 text-xs font-medium transition-all text-left flex-shrink-0";
        });
    } else {
        ratioBadge.innerText = ratioMode;
        fullscreenBtn.className = "w-full h-[50px] bg-white/[0.02] border border-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.04] px-4 rounded-xl flex items-center justify-center gap-3 text-xs font-medium transition-all flex-shrink-0 mt-3 select-none";
        
        document.querySelectorAll('.ratio-btn').forEach(btn => {
            if(btn.innerText.includes(ratioMode)) {
                btn.className = "ratio-btn w-full h-[54px] bg-indigo-500/10 border border-indigo-500 text-white px-4 rounded-xl flex items-center gap-3 text-xs font-medium transition-all text-left flex-shrink-0";
            }
        });
    }

    resetTransformations();
    updateCanvasDimensions();
}

// Drag / Pan mouse and touch event bindings for crop-like interaction
canvasContainer.addEventListener('mousedown', (e) => {
    if (!currentImgSrc) return;
    isDragging = true;
    startX = e.clientX - imgPosX;
    startY = e.clientY - imgPosY;
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentImgSrc) return;
    imgPosX = e.clientX - startX;
    imgPosY = e.clientY - startY;
    applyTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

canvasContainer.addEventListener('touchstart', (e) => {
    if (!currentImgSrc || e.touches.length !== 1) return;
    isDragging = true;
    startX = e.touches[0].clientX - imgPosX;
    startY = e.touches[0].clientY - imgPosY;
}, { passive: true });

window.addEventListener('touchmove', (e) => {
    if (!isDragging || !currentImgSrc || e.touches.length !== 1) return;
    imgPosX = e.touches[0].clientX - startX;
    imgPosY = e.touches[0].clientY - startY;
    applyTransform();
}, { passive: true });

window.addEventListener('touchend', () => {
    isDragging = false;
});

// Scroll wheel support to zoom in/out interactively like crop scaling
canvasContainer.addEventListener('wheel', (e) => {
    if (!currentImgSrc) return;
    e.preventDefault();
    const zoomIntensity = 0.08;
    if (e.deltaY < 0) {
        imgScale = Math.min(imgScale * (1 + zoomIntensity), 5);
    } else {
        imgScale = Math.max(imgScale * (1 - zoomIntensity), 0.5);
    }
    applyTransform();
}, { passive: false });

function applyTransform() {
    const transformStr = `translate(${imgPosX}px, ${imgPosY}px) scale(${imgScale})`;
    previewImg.style.transform = transformStr;
    miniPreviewImg.style.transform = transformStr;
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

blurSlider.addEventListener('input', (e) => {
    blurRadius = e.target.value;
    blurValDisplay.innerText = `${blurRadius}px`;
    blurBg.style.filter = `blur(${blurRadius}px)`;
    miniBlurBg.style.filter = `blur(${blurRadius}px)`;
});

blurMinus.addEventListener('click', () => {
    let newVal = Math.max(0, parseInt(blurSlider.value) - 1);
    blurSlider.value = newVal;
    blurRadius = newVal;
    blurValDisplay.innerText = `${blurRadius}px`;
    blurBg.style.filter = `blur(${blurRadius}px)`;
    miniBlurBg.style.filter = `blur(${blurRadius}px)`;
});

blurPlus.addEventListener('click', () => {
    let newVal = Math.min(100, parseInt(blurSlider.value) + 1);
    blurSlider.value = newVal;
    blurRadius = newVal;
    blurValDisplay.innerText = `${blurRadius}px`;
    blurBg.style.filter = `blur(${blurRadius}px)`;
    miniBlurBg.style.filter = `blur(${blurRadius}px)`;
});

function drawColorWheel() {
    const ctx = wheelCanvas.getContext('2d');
    const width = wheelCanvas.width;
    const height = wheelCanvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = (width / 2) - 1.5;

    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= radius) {
                let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                if (angle < 0) angle += 360;

                const saturation = (distance / radius) * 100;
                ctx.fillStyle = `hsl(${angle}, ${saturation}%, 50%)`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
}

function handleWheelSelection(clientX, clientY) {
    const rect = wheelCanvas.getBoundingClientRect();
    let x = clientX - rect.left;
    let y = clientY - rect.top;
    
    const cx = wheelCanvas.width / 2;
    const cy = wheelCanvas.height / 2;
    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = (wheelCanvas.width / 2) - 1.5;

    if (distance <= radius) {
        let angle = Math.atan2(dy, dx) * (180 / Math.PI);
        if (angle < 0) angle += 360;

        currentHue = angle;
        currentSaturation = (distance / radius) * 100;
        
        wheelCursor.style.left = `${x}px` ;
        wheelCursor.style.top = `${y}px`;
    } else {
        let angle = Math.atan2(dy, dx);
        x = cx + Math.cos(angle) * radius;
        y = cy + Math.sin(angle) * radius;
        
        let angleDeg = angle * (180 / Math.PI);
        if (angleDeg < 0) angleDeg += 360;
        
        currentHue = angleDeg;
        currentSaturation = 100;
        
        wheelCursor.style.left = `${x}px`;
        wheelCursor.style.top = `${y}px`;
    }
    updateColorOutputs();
}

function updateCursorPosition() {
    const cx = wheelCanvas.width / 2;
    const cy = wheelCanvas.height / 2;
    const radius = (wheelCanvas.width / 2) - 1.5;
    const angleRad = currentHue * (Math.PI / 180);
    const distance = (currentSaturation / 100) * radius;

    const x = cx + Math.cos(angleRad) * distance;
    const y = cy + Math.sin(angleRad) * distance;

    wheelCursor.style.left = `${x}px`;
    wheelCursor.style.top = `${y}px`;
}

wheelCanvas.addEventListener('mousedown', (e) => {
    handleWheelSelection(e.clientX, e.clientY);
    const onMouseMove = (moveEvent) => handleWheelSelection(moveEvent.clientX, moveEvent.clientY);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', () => {
        window.removeEventListener('mousemove', onMouseMove);
    }, { once: true });
});

wheelCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        handleWheelSelection(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

wheelCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
        handleWheelSelection(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: false });

opacitySlider.addEventListener('input', (e) => {
    chromaOpacity = e.target.value / 100;
    opacityVal.innerText = `${e.target.value}%`;
    updateChromaBackground();
});

opacityMinus.addEventListener('click', () => {
    let newVal = Math.max(0, parseInt(opacitySlider.value) - 1);
    opacitySlider.value = newVal;
    chromaOpacity = newVal / 100;
    opacityVal.innerText = `${newVal}%`;
    updateChromaBackground();
});

opacityPlus.addEventListener('click', () => {
    let newVal = Math.min(100, parseInt(opacitySlider.value) + 1);
    opacitySlider.value = newVal;
    chromaOpacity = newVal / 100;
    opacityVal.innerText = `${newVal}%`;
    updateChromaBackground();
});

function updateColorOutputs() {
    const tempElement = document.createElement('div');
    tempElement.style.color = `hsl(${currentHue}, ${currentSaturation}%, ${currentLightness}%)`;
    document.body.appendChild(tempElement);
    const rgbString = window.getComputedStyle(tempElement).color;
    document.body.removeChild(tempElement);

    const rgbArr = rgbString.match(/\d+/g).map(Number);
    const hex = "#" + rgbArr.map(x => {
        const hexStr = x.toString(16);
        return hexStr.length === 1 ? '0' + hexStr : hexStr;
    }).join('');

    chromaColor = hex;
    colorHex.value = chromaColor;
    updateChromaBackground();
}

function updateChromaBackground() {
    const r = parseInt(chromaColor.slice(1, 3), 16);
    const g = parseInt(chromaColor.slice(3, 5), 16);
    const b = parseInt(chromaColor.slice(5, 7), 16);
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${chromaOpacity})`;

    colorPreviewPatch.style.backgroundColor = rgbaColor;
    if (backgroundType === 'solid') {
        solidBg.style.backgroundColor = rgbaColor;
        miniSolidBg.style.backgroundColor = rgbaColor;
    }
}

colorHex.addEventListener('input', (e) => {
    if(e.target.value.match(/^#[0-9A-F]{6}$/i)) {
        chromaColor = e.target.value;
        
        const r = parseInt(chromaColor.slice(1, 3), 16) / 255;
        const g = parseInt(chromaColor.slice(3, 5), 16) / 255;
        const b = parseInt(chromaColor.slice(5, 7), 16) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        currentHue = h * 360;
        currentSaturation = s * 100;
        currentLightness = l * 100;

        updateCursorPosition();
        updateChromaBackground();
    }
});

function updateCanvasDimensions() {
    if (!currentImgSrc) return;

    const viewportWidth = Math.min(window.innerWidth * 0.9, 650);
    const viewportHeight = window.innerHeight * 0.55;

    let targetWidth = viewportWidth;
    let targetHeight = targetWidth / selectedRatio;

    if (targetHeight > viewportHeight) {
        targetHeight = viewportHeight;
        targetWidth = targetHeight * selectedRatio;
    }

    canvasContainer.style.width = `${targetWidth}px`;
    canvasContainer.style.height = `${targetHeight}px`;

    // Size main and mini preview images dynamically based on full screen mode toggle
    if (isFullScreenMode) {
        // Scale to completely cover container width and height (crop overflow)
        const imgAspect = nativeWidth / nativeHeight;
        const containerAspect = targetWidth / targetHeight;
        
        let renderW, renderH;
        if (imgAspect > containerAspect) {
            renderH = targetHeight;
            renderW = targetHeight * imgAspect;
        } else {
            renderW = targetWidth;
            renderH = targetWidth / imgAspect;
        }
        
        previewImg.style.width = `${renderW}px`;
        previewImg.style.height = `${renderH}px`;
        miniPreviewImg.style.width = `${(renderW / targetWidth) * 180}px`;
        miniPreviewImg.style.height = `${(renderH / targetHeight) * 108}px`;
    } else {
        previewImg.style.width = '100%';
        previewImg.style.height = '100%';
        previewImg.style.objectFit = 'contain';
        miniPreviewImg.style.width = '100%';
        miniPreviewImg.style.height = '100%';
        miniPreviewImg.style.objectFit = 'contain';
    }

    const maxMiniW = 180;
    const maxMiniH = 108;
    let miniWidth = maxMiniW;
    let miniHeight = miniWidth / selectedRatio;

    if (miniHeight > maxMiniH) {
        miniHeight = maxMiniH;
        miniWidth = miniHeight * selectedRatio;
    }

    miniPreviewContainer.style.width = `${miniWidth}px`;
    miniPreviewContainer.style.height = `${miniHeight}px`;

    blurBg.style.filter = `blur(${blurRadius}px)`;
    miniBlurBg.style.filter = `blur(${blurRadius}px)`;
    
    if (backgroundType === 'blur') {
        blurBg.style.opacity = isFullScreenMode ? '0' : '1';
        miniBlurBg.style.opacity = isFullScreenMode ? '0' : '1';
    }
}

downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentImgSrc || downloadBtn.disabled) return;

    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');

    const viewportW = parse
