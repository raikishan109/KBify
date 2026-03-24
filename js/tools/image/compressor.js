// tools/image/compressor.js
import { store } from '../../state.js';
import { Toast, formatFileSize } from '../../utils/ui-utils.js';
import { Modal } from '../../components/Modal.js';
import { compressPDF } from '../pdf/compressor.js';

export async function processFile() {
    if (!store.originalFile) {
        Toast.show(`Please select ${store.currentFileType === 'pdf' ? 'a PDF' : 'an image'} first`, 'error');
        return;
    }

    if (store.currentFileType === 'pdf') {
        return await compressPDF();
    }

    const targetSizeKB = parseInt(document.getElementById('customSize')?.value);
    if (!targetSizeKB || targetSizeKB < 1) {
        Toast.show('Please enter a valid target size', 'error');
        return;
    }

    const targetSizeBytes = targetSizeKB * 1024;
    let quality = parseFloat(document.getElementById('qualitySlider')?.value || 0.8);

    startProcessing();

    try {
        const img = await loadImage(store.originalFile);
        let attempts = 0;
        const maxAttempts = 20;
        let lastBlob = null;
        let minQuality = 0.1;
        let maxQuality = quality;
        let mimeType = store.originalFile.type;
        let convertedToJPEG = false;

        while (attempts < maxAttempts) {
            attempts++;
            store.progress = (attempts / maxAttempts) * 90;

            const blob = await compressWithQuality(img, quality, mimeType);
            lastBlob = blob;

            const sizeDiff = blob.size - targetSizeBytes;
            const tolerance = targetSizeBytes * 0.05;

            if (Math.abs(sizeDiff) <= tolerance) {
                store.compressedBlob = blob;
                break;
            }

            if (blob.size > targetSizeBytes) {
                maxQuality = quality;
                quality = (minQuality + quality) / 2;
            } else {
                minQuality = quality;
                quality = (quality + maxQuality) / 2;
            }

            if (maxQuality - minQuality < 0.01) {
                if (mimeType === 'image/png' && !convertedToJPEG && blob.size > targetSizeBytes) {
                    convertedToJPEG = true;
                    mimeType = 'image/jpeg';
                    minQuality = 0.1;
                    maxQuality = 0.8;
                    quality = 0.5;
                    attempts = 0;
                    continue;
                }
                store.compressedBlob = blob;
                break;
            }

            await new Promise(resolve => setTimeout(resolve, 50));
        }

        if (!store.compressedBlob) store.compressedBlob = lastBlob;

        if (store.compressedBlob.size > store.originalFile.size) {
            Toast.show(`Unable to compress to ${targetSizeKB}KB. Minimum achievable: ${formatFileSize(store.compressedBlob.size)}`, 'error');
            store.compressedBlob = null;
        } else {
            handleSuccess(convertedToJPEG);
        }
    } catch (error) {
        Toast.show('Compression failed: ' + error.message, 'error');
    } finally {
        endProcessing();
    }
}

function startProcessing() {
    Toast.hideAll();
    store.isLoading = true;
    store.progress = 0;
}

function endProcessing() {
    store.isLoading = false;
    setTimeout(() => { store.progress = 0; }, 1000);
}

function handleSuccess(convertedToJPEG) {
    store.progress = 100;
    displayResults();
    
    let msg = 'Image compressed successfully!';
    if (convertedToJPEG) msg += ' (Converted PNG to JPEG for better size)';
    Toast.show(msg, 'success');
}

export function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function compressWithQuality(img, quality, mimeType) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (mimeType === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });
}

function displayResults() {
    const url = URL.createObjectURL(store.compressedBlob);
    const preview = document.getElementById('compressedPreview');
    if (preview) {
        preview.src = url;
        preview.style.display = 'block';
    }

    const reduction = ((1 - store.compressedBlob.size / store.originalFile.size) * 100).toFixed(1);
    const saved = store.originalFile.size - store.compressedBlob.size;

    document.getElementById('compressedSize').textContent = formatFileSize(store.compressedBlob.size);
    document.getElementById('reduction').textContent = `${reduction}%`;
    document.getElementById('actionButtons').classList.add('active');

    Modal.show({
        original: store.originalFile.size,
        compressed: store.compressedBlob.size,
        reduction: reduction,
        saved: saved
    });
}

export function downloadFile() {
    if (!store.compressedBlob) return;
    const url = URL.createObjectURL(store.compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${store.originalFile.name}`;
    a.click();
    URL.revokeObjectURL(url);
}
