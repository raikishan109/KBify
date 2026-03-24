// PDF Compression Logic
import { store } from '../../state.js';
import { Toast } from '../../utils/ui-utils.js';
import { Modal } from '../../components/Modal.js';
import { formatFileSize } from '../../utils/ui-utils.js';

export async function compressPDF() {
    Toast.hideAll();
    store.isLoading = true;
    store.progress = 0;

    try {
        const arrayBuffer = await store.originalFile.arrayBuffer();
        store.progress = 20;

        // Note: For real PDF compression, we'd use more advanced techniques.
        // For MVP, we're using PDF-Lib's save() which handles basic cleanup.
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
        store.progress = 50;

        const compressedPdfBytes = await pdfDoc.save({
            useObjectStreams: true,
            addDefaultPage: false,
        });
        store.progress = 80;

        const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
        store.compressedBlob = blob;

        if (blob.size > store.originalFile.size) {
            Toast.show(`Unable to reduce PDF size further. Original: ${formatFileSize(store.originalFile.size)}`, 'error');
            store.compressedBlob = null;
        } else {
            handlePDFSuccess();
        }
    } catch (error) {
        Toast.show('PDF compression failed: ' + error.message, 'error');
    } finally {
        store.isLoading = false;
        setTimeout(() => { store.progress = 0; }, 1000);
    }
}

function handlePDFSuccess() {
    store.progress = 100;
    
    // PDF doesn't have a visual preview typically in this setup, but we show stats
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

    Toast.show('PDF compressed successfully!', 'success');
}
