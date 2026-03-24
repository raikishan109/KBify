// js/navigation.js
import { store, subscribe } from './state.js';
import { TOOLS, SECTIONS } from './tools/registry.js';
import { reset } from './tools/common.js';

// Reactive UI Updates
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

/**
 * Initialize the tool grid from the Registry
 * This makes the project highly scalable for new tools.
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
    
    // Refresh UI to apply correct filtering
    updateSectionUI(store.currentSection);
}

function updateSectionUI(sectionId) {
    const section = SECTIONS[sectionId] || SECTIONS.dashboard;
    
    // Update Titles
    if (UI.mainTitle) UI.mainTitle.textContent = section.title;
    if (UI.mainSubtitle) UI.mainSubtitle.textContent = section.subtitle;

    // Toggle Nav Active State
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`.${sectionId}-nav`)?.classList.add('active');

    // Filter Tool Grid
    document.querySelectorAll('.tool-card').forEach(card => {
        const toolName = card.getAttribute('data-tool');
        const tool = TOOLS[toolName];
        
        if (sectionId === 'dashboard') {
            card.style.display = 'flex';
        } else {
            card.style.display = tool?.type === sectionId ? 'flex' : 'none';
        }
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderTool(toolName) {
    const tool = TOOLS[toolName];
    if (!tool) return;

    UI.toolDashboard.style.display = 'none';
    UI.mainCompressorCard.classList.add('active');
    UI.activeToolIndicator.textContent = toolName;
    UI.activeToolIndicator.style.color = tool.color;
    UI.mainTitle.textContent = toolName;
    UI.mainSubtitle.textContent = `Upload your file to begin ${toolName.toLowerCase()}`;
    
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

    const customSizeInput = document.getElementById('customSize');
    if (size !== 'custom' && customSizeInput) {
        customSizeInput.value = size;
    }
}

// DOM Cache for performance
const UI = {
    get mainTitle() { return document.getElementById('mainTitle'); },
    get mainSubtitle() { return document.getElementById('mainSubtitle'); },
    get toolDashboard() { return document.getElementById('toolDashboard'); },
    get mainCompressorCard() { return document.getElementById('mainCompressorCard'); },
    get activeToolIndicator() { return document.getElementById('activeToolIndicator'); },
    get uploadHint() { return document.getElementById('uploadHint'); },
    get fileInput() { return document.getElementById('fileInput'); }
};
