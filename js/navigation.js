// js/navigation.js
import { store, subscribe } from './state.js';
import { TOOLS, SECTIONS } from './tools/registry.js';
import { reset } from './tools/common.js';
import { renderInEditor } from './tools/pdf/editor.js';

// --- Reactive State Subscriptions ---

subscribe('currentSection', (sectionId) => {
    updateSectionUI(sectionId);
});

subscribe('activeTool', (toolName) => {
    if (toolName) {
        renderTool(toolName);
    } else {
        renderDashboard();
    }
});

// --- Public Navigation API ---

export function switchSection(sectionId) {
    store.activeTool = null;
    store.currentSection = sectionId;
    reset();
}

export function openTool(toolName) {
    if (TOOLS[toolName]) {
        store.activeTool = toolName;
    }
}

export function closeTool() {
    store.activeTool = null;
    reset();
}

// --- UI Rendering Logic ---

/**
 * Initialize the tool grid from the Registry
 */
export function initToolGrid() {
    const grid = UI.toolDashboard;
    if (!grid) return;

    grid.innerHTML = Object.entries(TOOLS).map(([name, config]) => `
        <div class="tool-card ${config.type}-tool" data-tool="${name}">
            <div class="tool-card-icon" style="color: ${config.color}; background: ${config.color}1A;">
                ${config.icon}
            </div>
            <div class="tool-card-title">${name}</div>
        </div>
    `).join('');
    
    updateSectionUI(store.currentSection);
}

function updateSectionUI(sectionId) {
    const section = SECTIONS[sectionId] || SECTIONS.dashboard;
    
    if (UI.mainTitle) UI.mainTitle.textContent = section.title;
    if (UI.mainSubtitle) UI.mainSubtitle.textContent = section.subtitle;

    // Toggle Nav Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.${sectionId}-nav`)?.classList.add('active');

    // Filter Tool Grid
    document.querySelectorAll('.tool-card').forEach(card => {
        const toolName = card.getAttribute('data-tool');
        const tool = TOOLS[toolName];
        card.style.display = (sectionId === 'dashboard' || tool?.type === sectionId) ? 'flex' : 'none';
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTool(toolName) {
    const tool = TOOLS[toolName];
    if (!tool) return;

    const isPDF = tool.type === 'pdf';
    const isEditor = toolName === 'PDF Editor';

    UI.toolDashboard.style.display = 'none';
    UI.mainCompressorCard.classList.add('active');
    UI.activeToolIndicator.textContent = toolName;
    UI.activeToolIndicator.style.color = tool.color;
    UI.mainTitle.textContent = toolName;
    
    // Dynamic Subtitle
    UI.mainSubtitle.textContent = isEditor 
        ? "Click anywhere on the PDF pages to add new text. Drag to move, or click text to edit."
        : `Upload your file to begin ${toolName.toLowerCase()}`;
    
    // Toggle Tool-Specific UI Elements
    UI.imageOptions.style.display = isPDF ? 'none' : 'block';
    UI.pdfOptions.style.display = (isPDF && !isEditor) ? 'block' : 'none';
    UI.pdfEditorWorkspace.style.display = isEditor ? 'block' : 'none';
    
    // Manage Global Sections visibility
    if (isEditor) {
        UI.previewSection.classList.remove('active');
        UI.actionButtons.classList.remove('active');
    }
    
    // Update Button Text
    UI.processBtn.textContent = isEditor ? 'Save & Download' : (isPDF ? 'Process PDF' : 'Compress Now');

    // Trigger visual editor if file already exists
    if (isEditor && store.originalFile) {
        renderInEditor(store.originalFile);
    }

    // Update file input configuration
    UI.fileInput.accept = tool.accept;
    UI.uploadHint.textContent = tool.hint;
    
    store.currentFileType = tool.type;
}

function renderDashboard() {
    UI.mainCompressorCard.classList.remove('active');
    UI.toolDashboard.style.display = 'grid';
    updateSectionUI(store.currentSection);
}

export function selectSize(size, element) {
    store.selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => btn.classList.remove('active'));
    if (element) element.classList.add('active');

    if (size !== 'custom' && UI.customSizeInput) {
        UI.customSizeInput.value = size;
    }
}

// --- DOM Cache for performance ---
const UI = {
    get mainTitle() { return document.getElementById('mainTitle'); },
    get mainSubtitle() { return document.getElementById('mainSubtitle'); },
    get toolDashboard() { return document.getElementById('toolDashboard'); },
    get mainCompressorCard() { return document.getElementById('mainCompressorCard'); },
    get activeToolIndicator() { return document.getElementById('activeToolIndicator'); },
    get uploadHint() { return document.getElementById('uploadHint'); },
    get fileInput() { return document.getElementById('fileInput'); },
    get imageOptions() { return document.getElementById('imageOptions'); },
    get pdfOptions() { return document.getElementById('pdfOptions'); },
    get pdfEditorWorkspace() { return document.getElementById('pdfEditorWorkspace'); },
    get previewSection() { return document.getElementById('previewSection'); },
    get actionButtons() { return document.getElementById('actionButtons'); },
    get processBtn() { return document.getElementById('processActionButton'); },
    get customSizeInput() { return document.getElementById('customSize'); }
};
