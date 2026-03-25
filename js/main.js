// main.js - Application Bootstrapper
import { store } from './state.js';
import { initTheme, toggleTheme } from './theme.js';
import { toggleSidebar } from './sidebar.js';
import { switchSection, openTool, closeTool, selectSize, initToolGrid } from './navigation.js';
import { handleFileSelect, initDragAndDrop } from './utils/file-utils.js';
import { processFile, downloadFile } from './tools/image/compressor.js';
import { reset } from './tools/common.js';
import { Modal } from './components/Modal.js';
import { Toast } from './utils/ui-utils.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        // 1. Initialize core systems
        initTheme();
        initToolGrid();
        initDragAndDrop();
        registerSW();

        // 2. Setup event delegation & listeners
        setupEvents();

        // 3. Bootstrap from initial state
        bootstrap();
    } catch (error) {
        console.error('Bootstrapping failed:', error);
        Toast.show('Application failed to load correctly. Please refresh.', 'error');
    }
});

function registerSW() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .catch(err => console.error('SW Registration failed:', err));
    }
}

function setupEvents() {
    // Navbar & Settings
    on('#menuToggle', 'click', toggleSidebar);
    on('.theme-toggle', 'click', toggleTheme);
    on('#sidebarOverlay', 'click', toggleSidebar);

    // Navigation - Sidebar & Tools
    on('.dashboard-nav', 'click', (e) => (e.preventDefault(), switchSection('dashboard'), toggleSidebar()));
    on('.image-nav',     'click', (e) => (e.preventDefault(), switchSection('image'),    toggleSidebar()));
    on('.doc-nav',       'click', (e) => (e.preventDefault(), switchSection('pdf'),      toggleSidebar()));

    // Automatic tool detection from grid clicks
    on('.tool-card', 'click', (e, card) => {
        const toolName = card.getAttribute('data-tool');
        if (toolName) openTool(toolName);
    });

    // Compression Controller
    on('.main-card .btn.secondary', 'click', (e) => (e.preventDefault(), closeTool()));
    on('#fileInput', 'change', handleFileSelect);
    on('.options-section .btn', 'click', processFile);

    // Size Selection
    on('.size-options', 'click', (e) => {
        const btn = e.target.closest('.size-btn');
        if (btn) {
            const val = btn.textContent.includes('KB') ? parseInt(btn.textContent) : 'custom';
            selectSize(val, btn);
        }
    });

    // PDF Actions Selection
    on('#pdfOptions .size-btn', 'click', (e, btn) => {
        document.querySelectorAll('#pdfOptions .size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });

    // Quality Control
    on('#qualitySlider', 'input', (e) => {
        const valEl = document.getElementById('qualityValue');
        if (valEl) valEl.textContent = e.target.value;
    });

    // Modal & Footer Actions
    on('.modal-close', 'click', Modal.close);
    on('.modal-buttons .modal-btn.secondary', 'click', Modal.close);
    on('.modal-buttons .modal-btn:not(.secondary)', 'click', () => (downloadFile(), Modal.close()));
    
    // Bottom Action Buttons
    const bottomBtns = document.querySelectorAll('#actionButtons .btn');
    bottomBtns[0]?.addEventListener('click', downloadFile);
    bottomBtns[1]?.addEventListener('click', reset);
}

function bootstrap() {
    if (store.activeTool) openTool(store.activeTool);
    else switchSection(store.currentSection);
}

function on(selector, event, callback) {
    if (selector.startsWith('#')) {
        const el = document.querySelector(selector);
        if (el) el.addEventListener(event, callback);
    } else {
        document.addEventListener(event, (e) => {
            const target = e.target.closest(selector);
            if (target) callback(e, target);
        });
    }
}
