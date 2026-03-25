// components/Modal.js
import { formatFileSize } from '../utils/ui-utils.js';

export const Modal = {
    show(stats, title = 'Compression Successful!') {
        const modal = document.getElementById('successModal');
        const originalSize = document.getElementById('modalOriginalSize');
        const compressedSize = document.getElementById('modalCompressedSize');
        const reduction = document.getElementById('modalReduction');
        const savedSpace = document.getElementById('modalSavedSpace');
        const titleEl = modal?.querySelector('.modal-title');

        if (titleEl) titleEl.textContent = title;
        if (originalSize) originalSize.textContent = formatFileSize(stats.original);
        if (compressedSize) compressedSize.textContent = formatFileSize(stats.compressed);
        if (reduction) reduction.textContent = `${stats.reduction}%`;
        if (savedSpace) savedSpace.textContent = formatFileSize(stats.saved);

        modal?.classList.add('active');
    },

    close() {
        document.getElementById('successModal')?.classList.remove('active');
    }
};
