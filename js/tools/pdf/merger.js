// tools/pdf/merger.js
import { store } from '../../state.js';
import { Toast, formatFileSize } from '../../utils/ui-utils.js';
import { Modal } from '../../components/Modal.js';

export async function mergePDFs() {
    if (!store.originalFiles || store.originalFiles.length < 2) {
        Toast.show('Please select at least 2 PDF files to merge.', 'error');
        return;
    }

    store.isLoading = true;
    store.progress = 10;

    try {
        const { PDFDocument } = window.PDFLib;
        const mergedPdf = await PDFDocument.create();
        
        for (let i = 0; i < store.originalFiles.length; i++) {
            const file = store.originalFiles[i];
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
            
            store.progress = 10 + ((i + 1) / store.originalFiles.length) * 80;
        }

        const pdfBytes = await mergedPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        store.compressedBlob = blob;
        store.progress = 100;
        
        // Show success
        Toast.show(`Successfully merged ${store.originalFiles.length} PDFs!`, 'success');
        
        // Download immediately or show modal
        displayMergeResults(blob);

    } catch (error) {
        console.error('PDF Merge failed:', error);
        Toast.show('Merging failed: ' + error.message, 'error');
    } finally {
        store.isLoading = false;
        setTimeout(() => { store.progress = 0; }, 1000);
    }
}

function displayMergeResults(blob) {
    document.getElementById('actionButtons').classList.add('active');
    
    Modal.show({
        original: store.originalFiles.reduce((acc, f) => acc + f.size, 0),
        compressed: blob.size,
        reduction: 'N/A',
        saved: 0,
        title: 'Merging Complete',
        message: `Merged ${store.originalFiles.length} files into one PDF.`
    });
}
