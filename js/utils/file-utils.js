// utils/file-utils.js
import { store } from '../state.js';
import { Toast, formatFileSize } from './ui-utils.js';

/**
 * Entry point for file selection from input
 */
export function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
}

/**
 * Validation and State update
 */
export function handleFile(file) {
    // 1. Validate Image Type
    if (store.currentFileType === 'image' && !file.type.match('image/(jpeg|png|webp)')) {
        Toast.show('Please select a valid image file (JPG, PNG, or WEBP)', 'error');
        return;
    }

    // 2. Validate PDF Type (Permissive check for different browser MIME types)
    if (store.currentFileType === 'pdf' && !file.type.includes('pdf')) {
        Toast.show('Please select a valid PDF file', 'error');
        return;
    }

    store.originalFile = file;
    updateFileUI(file);
}

/**
 * Update the DOM with selected file information
 */
function updateFileUI(file) {
    const UI = {
        preview: document.getElementById('originalPreview'),
        size: document.getElementById('originalSize'),
        dim: document.getElementById('originalDimensions'),
        opt: document.getElementById('optionsSection'),
        pre: document.getElementById('previewSection')
    };

    if (store.currentFileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                if (UI.preview) {
                    UI.preview.src = e.target.result;
                    UI.preview.style.display = 'block';
                }
                if (UI.size) UI.size.textContent = formatFileSize(file.size);
                if (UI.dim) UI.dim.textContent = `${img.width} × ${img.height}`;

                UI.opt?.classList.add('active');
                UI.pre?.classList.add('active');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // PDF Workflow
        if (UI.preview) UI.preview.style.display = 'none';
        if (UI.size) UI.size.textContent = formatFileSize(file.size);
        if (UI.dim) UI.dim.textContent = 'PDF Document';

        UI.opt?.classList.add('active');
        
        // Hide standard preview stats for PDF Editor mode
        if (store.activeTool === 'PDF Editor') {
            UI.pre?.classList.remove('active');
        } else {
            UI.pre?.classList.add('active');
        }
    }
}

/**
 * Setup Drag & Drop listeners
 */
export function initDragAndDrop() {
    const section = document.getElementById('uploadSection');
    if (!section) return;

    ['dragover', 'dragleave', 'drop'].forEach(event => {
        section.addEventListener(event, (e) => {
            e.preventDefault();
            if (event === 'dragover') section.classList.add('drag-over');
            else if (event === 'dragleave') section.classList.remove('drag-over');
            else {
                section.classList.remove('drag-over');
                if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
            }
        });
    });

    section.onclick = () => document.getElementById('fileInput')?.click();
}
