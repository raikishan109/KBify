// utils/file-utils.js
import { store } from '../state.js';
import { Toast, formatFileSize } from './ui-utils.js';

/**
 * Entry point for file selection from input
 */
export function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        if (UI.fileInput.hasAttribute('multiple')) {
            handleMultipleFiles(files);
        } else {
            handleFile(files[0]);
        }
    }
}

export function handleMultipleFiles(files) {
    // Basic validation for multiple files
    const validFiles = files.filter(file => {
        if (store.currentFileType === 'pdf' && !file.type.includes('pdf')) return false;
        if (store.currentFileType === 'image' && !file.type.match('image/(jpeg|png|webp)')) return false;
        return true;
    });

    if (validFiles.length !== files.length) {
        Toast.show('Some files were skipped due to invalid format.', 'warning');
    }

    store.originalFiles = validFiles;
    updateMultiFileUI(validFiles);
}

/**
 * Validation and State update
 */
export function handleFile(file) {
    if (!file) return;

    // 1. Validate Image Type - More permissive for mobile browsers
    if (store.currentFileType === 'image') {
        const isImage = file.type.startsWith('image/') || 
                       file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic)$/);
        
        if (!isImage) {
            Toast.show('Please select a valid image file (JPG, PNG, or WEBP)', 'error');
            return;
        }
    }

    // 2. Validate PDF Type
    if (store.currentFileType === 'pdf' && !file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
        Toast.show('Please select a valid PDF file', 'error');
        return;
    }

    store.originalFile = file;
    try {
        updateFileUI(file);
    } catch (err) {
        console.error('UI Update failed:', err);
        Toast.show('Failed to process file. Please try again.', 'error');
    }
}

/**
 * Update the DOM with selected file information
 */
function updateFileUI(file) {
    const UI_ELS = {
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
                if (UI_ELS.preview) {
                    UI_ELS.preview.src = e.target.result;
                    UI_ELS.preview.style.display = 'block';
                }
                if (UI_ELS.size) UI_ELS.size.textContent = formatFileSize(file.size);
                if (UI_ELS.dim) UI_ELS.dim.textContent = `${img.width} × ${img.height}`;

                UI_ELS.opt?.classList.add('active');
                UI_ELS.pre?.classList.add('active');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        // PDF Workflow
        if (UI_ELS.preview) UI_ELS.preview.style.display = 'none';
        if (UI_ELS.size) UI_ELS.size.textContent = formatFileSize(file.size);
        if (UI_ELS.dim) UI_ELS.dim.textContent = 'PDF Document';

        UI_ELS.opt?.classList.add('active');
        
        // Hide standard preview stats for PDF Editor mode
        if (store.activeTool === 'PDF Editor' || store.activeTool === 'Merge PDF') {
            UI_ELS.pre?.classList.remove('active');
        } else {
            UI_ELS.pre?.classList.add('active');
        }
    }
}

function updateMultiFileUI(files) {
    const list = document.getElementById('selectedFilesList');
    const options = document.getElementById('optionsSection');
    if (!list || !options) return;

    options.classList.add('active');
    list.innerHTML = files.map((file, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary); padding: 0.5rem 0.8rem; border-radius: 6px; border: 1px solid var(--border-color);">
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.85rem; max-width: 70%;">
                ${index + 1}. ${file.name}
            </div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">
                ${formatFileSize(file.size)}
            </div>
        </div>
    `).join('');
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
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 1 || UI.fileInput.hasAttribute('multiple')) {
                    handleMultipleFiles(files);
                } else if (files.length === 1) {
                    handleFile(files[0]);
                }
            }
        });
    });

    section.onclick = () => document.getElementById('fileInput')?.click();
}

const UI = {
    get fileInput() { return document.getElementById('fileInput'); }
};
