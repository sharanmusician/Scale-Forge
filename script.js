let currentImgSrc = '';
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
    
