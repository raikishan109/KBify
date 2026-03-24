// tools/common.js
import { store } from '../state.js';
import { Toast } from '../utils/ui-utils.js';

export function reset() {
    store.originalFile = null;
    store.compressedBlob = null;
    store.progress = 0;

    const fileInput = document.getElementById('fileInput');
    const optionsSection = document.getElementById('optionsSection');
    const previewSection = document.getElementById('previewSection');
    const actionButtons = document.getElementById('actionButtons');

    if (fileInput) fileInput.value = '';
    optionsSection?.classList.remove('active');
    previewSection?.classList.remove('active');
    actionButtons?.classList.remove('active');

    Toast.hideAll();
}
