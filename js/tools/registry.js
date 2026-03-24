// tools/registry.js

const IMAGE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>';
const UPLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>';
const DOC_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 00 2 2h12a2 2 0 00 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
const BULK_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 10l5 5-5 5M7 10l-5 5 5 5M22 15H2"/></svg>';
const FAST_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14l6-6 6 6M4 6l6 6 6-6"/></svg>';
const DOWNLOAD_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v10m0 0l-4-4m4 4l4-4M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';

export const TOOLS = {
    'JPG Compressor': {
        type: 'image',
        accept: 'image/jpeg',
        icon: UPLOAD_ICON,
        color: '#ff4d4d',
        hint: 'Supports JPG/JPEG images'
    },
    'PNG Compressor': {
        type: 'image',
        accept: 'image/png',
        icon: IMAGE_ICON,
        color: '#3b82f6',
        hint: 'Supports PNG images'
    },
    'WEBP Compressor': {
        type: 'image',
        accept: 'image/webp',
        icon: DOWNLOAD_ICON,
        color: '#10b981',
        hint: 'Supports WEBP images'
    },
    'Bulk Compress': {
        type: 'image',
        accept: 'image/jpeg,image/png,image/webp',
        icon: BULK_ICON,
        color: '#8b5cf6',
        hint: 'Compress images in bulk'
    },
    'Fast Squeeze': {
        type: 'image',
        accept: 'image/jpeg,image/png,image/webp',
        icon: FAST_ICON,
        color: '#f59e0b',
        hint: 'Optimized fast compression'
    },
    'PDF Compressor': {
        type: 'pdf',
        accept: 'application/pdf',
        icon: DOC_ICON,
        color: '#ef4444',
        hint: 'Supports PDF documents'
    }
};

export const SECTIONS = {
    dashboard: {
        title: 'KBify Ultimate Suite',
        subtitle: 'Choose a tool to start compressing your files'
    },
    image: {
        title: 'KBify Image Suite',
        subtitle: 'Choose an image tool to start compressing'
    },
    pdf: {
        title: 'KBify Document Suite',
        subtitle: 'Choose a document tool to start compressing'
    }
};
