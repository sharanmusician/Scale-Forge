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
    if (e.touches.length === 1) {
        handleWheelSelection(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });

wheelCanvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
        handleWheelSelection(e.touches[0].clientX, e.touches[0].clientY);
    }
}, { passive: true });

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

function applyTransform() {
    const containerRect = canvasContainer.getBoundingClientRect();
    const imgRect = previewImg.getBoundingClientRect();
    
    const baseW = imgRect.width / currentZoom;
    const baseH = imgRect.height / currentZoom;
    const scaledW = baseW * currentZoom;
    const scaledH = baseH * currentZoom;

    const maxOffsetX = Math.max(0, (scaledW - containerRect.width) / 2);
    const maxOffsetY = Math.max(0, (scaledH - containerRect.height) / 2);

    panOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, panOffsetX));
    panOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, panOffsetY));

    previewImg.style.transform = `translate(${panOffsetX}px, ${panOffsetY}px) scale(${currentZoom})`;
}

function updateCanvasDimensions() {
    if (!currentImgSrc) return;

    let finalRatio = selectedRatio;

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

    previewImg.className = "max-w-full max-h-full object-contain z-10 relative transition-all duration-300 pointer-events-none";
    miniPreviewImg.className = "max-w-full max-h-full object-contain z-10 relative transition-all duration-300 pointer-events-none";
    applyTransform();

    const maxMiniW = 180;
    const maxMiniH = 108;
    let miniWidth = maxMiniW;
    let miniHeight = miniWidth / finalRatio;

    if (miniHeight > maxMiniH) {
        miniHeight = maxMiniH;
        miniWidth = miniHeight * finalRatio;
    }

    miniPreviewContainer.style.width = `${miniWidth}px`;
    miniPreviewContainer.style.height = `${miniHeight}px`;

    blurBg.style.filter = `blur(${blurRadius}px)`;
    miniBlurBg.style.filter = `blur(${blurRadius}px)`;
    
    if (backgroundType === 'blur') {
        blurBg.style.opacity = '1';
        miniBlurBg.style.opacity = '1';
    }
}

document.addEventListener('gesturestart', (e) => {
    e.preventDefault();
}, { passive: false });

document.addEventListener('gesturechange', (e) => {
    e.preventDefault();
}, { passive: false });

document.addEventListener('gestureend', (e) => {
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1 && !canvasContainer.contains(e.target)) {
        e.preventDefault();
    }
}, { passive: false });

canvasContainer.addEventListener('touchstart', (e) => {
    if (!currentImgSrc) return;
    
    if (e.touches.length === 2) {
        e.preventDefault();
        initialPinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoom = currentZoom;
        initialPanX = panOffsetX;
        initialPanY = panOffsetY;
        pinchMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        pinchMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    }
}, { passive: false });

canvasContainer.addEventListener('touchmove', (e) => {
    if (!currentImgSrc) return;

    if (e.touches.length === 2) {
        e.preventDefault();
        if (initialPinchDist > 0) {
            const currentDist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            const scaleFactor = currentDist / initialPinchDist;
            currentZoom = Math.max(1, Math.min(5, initialZoom * scaleFactor));

            const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            
            const dx = currentMidX - pinchMidX;
            const dy = currentMidY - pinchMidY;

            panOffsetX = initialPanX + dx;
            panOffsetY = initialPanY + dy;
            
            applyTransform();
        }
    }
}, { passive: false });

window.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
        initialPinchDist = 0;
    }
}, { passive: true });

downloadBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!currentImgSrc || downloadBtn.disabled) return;

    const exportCanvas = document.createElement('canvas');
    const ctx = exportCanvas.getContext('2d');

    let finalRatio = selectedRatio;
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
            const r = parseInt(chromaColor.slice(1, 3), 16);
            const g = parseInt(chromaColor.slice(3, 5), 16);
            const b = parseInt(chromaColor.slice(5, 7), 16);
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
        }
    };
    baseImg.src = currentImgSrc;
});
                     
