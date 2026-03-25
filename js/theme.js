// Theme Management Module
import { store } from './state.js';

export function toggleTheme() {
    const newTheme = store.theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    store.theme = newTheme;
}

export function initTheme() {
    setTheme(store.theme);
}

function setTheme(theme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    
    const themeIcon = document.getElementById('themeIcon');
    const themeText = document.getElementById('themeText');
    if (!themeIcon || !themeText) return;

    if (theme === 'light') {
        themeIcon.innerHTML = '<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" />';
        themeText.textContent = 'Light';
    } else {
        themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />';
        themeText.textContent = 'Dark';
    }
}
