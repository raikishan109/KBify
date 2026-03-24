// utils/file-utils.js
import { store } from '../state.js';
import { Toast, formatFileSize } from './ui-utils.js';

export function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
}

export function handleFile(file) {
    if (store.currentFileType === 'image' && !file.type.match('image/(jpeg|png|webp)')) {
        Toast.show('Please select a valid image file (JPG, PNG, or WEBP)', 'error');
        return;
    }

    if (store.currentFileType === 'pdf' && file.type !== 'application/pdf') {
        Toast.show('Please select a valid PDF file', 'error');
        return;
    }

    store.originalFile = file;
    updateFileUI(file);
}

function updateFileUI(file) {
    const preview = document.getElementById('originalPreview');
    const size = document.getElementById('originalSize');
    const dimensions = document.getElementById('originalDimensions');
    const optionsSection = document.getElementById('optionsSection');
    const previewSection = document.getElementById('previewSection');

    if (store.currentFileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                if (preview) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                if (size) size.textContent = formatFileSize(file.size);
                if (dimensions) dimensions.textContent = `${img.width} × ${img.height}`;

                optionsSection?.classList.add('active');
                previewSection?.classList.add('active');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        if (preview) preview.style.display = 'none';
        if (size) size.textContent = formatFileSize(file.size);
        if (dimensions) dimensions.textContent = 'PDF Document';

        optionsSection?.classList.add('active');
        previewSection?.classList.add('active');
    }
}

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

    section.addEventListener('click', () => document.getElementById('fileInput')?.click());
}
