document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const activeTab = document.querySelector('.tab');
    const cursorPosDisplay = document.getElementById('cursor-pos');
    const welcomePage = document.getElementById('welcome-page');
    const editorContentArea = document.getElementById('editor-content-area');
    const fileInput = document.getElementById('file-input');
    const newFileMenu = document.getElementById('new-file-menu');
    const newFileAction = document.getElementById('new-file-action');
    const openFileMenu = document.getElementById('open-file-menu');
    const openFileAction = document.getElementById('open-file-action');
    const saveFileMenu = document.getElementById('save-file-menu');
    const minBtn = document.getElementById('min-btn');
    const maxBtn = document.getElementById('max-btn');
    const closeBtn = document.getElementById('close-btn');
    const fileListContainer = document.getElementById('file-list');
    const sidebarNewFileBtn = document.getElementById('new-file-sidebar');
    const terminalPanel = document.querySelector('.terminal-panel');
    const sidebar = document.getElementById('sidebar');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const languageDisplay = document.getElementById('language-display');
    const newTerminalMenu = document.getElementById('new-terminal-menu');

    // State Management
    let files = [
        { name: 'VS Clone.html', content: '<!-- Initial Content -->' },
        { name: 'stylesheet.css', content: '/* Initial CSS */' },
        { name: 'script.js', content: '// Initial JS' }
    ];
    let activeFileName = null;

    // Language detection helpers
    function getLanguage(filename) {
        if (filename.endsWith('.html')) return 'HTML';
        if (filename.endsWith('.js')) return 'JavaScript';
        if (filename.endsWith('.css')) return 'CSS';
        return 'Plain Text';
    }

    function getInitialContent(filename) {
        if (filename.endsWith('.html')) {
            return '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <title>Document</title>\n</head>\n<body>\n\n</body>\n</html>';
        }
        if (filename.endsWith('.js')) {
            return '// JavaScript file\n\nconsole.log("Hello, World!");';
        }
        if (filename.endsWith('.css')) {
            return '/* CSS file */\n\nbody {\n    margin: 0;\n    padding: 0;\n}';
        }
        return '';
    }

    // Reusable HTML for the Welcome Tab
    const welcomeTabHTML = `<svg width="14" height="14" viewBox="0 0 100 100" fill="#007acc" style="margin-right: 6px;"><path d="M78.5 13.5L10 65.5V81L78.5 30.5V13.5Z"/><path d="M78.5 86.5L10 34.5V19L78.5 69.5V86.5Z"/><path d="M25 50L78.5 13.5V86.5L25 50Z"/></svg> Welcome`;

    // Update cursor position in status bar
    function updateCursorPos() {
        const textBeforeCursor = editor.value.substring(0, editor.selectionStart);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const col = lines[lines.length - 1].length + 1;
        if (cursorPosDisplay) {
            cursorPosDisplay.innerText = `Ln ${line}, Col ${col}`;
        }
    }

    editor.addEventListener('keyup', updateCursorPos);
    editor.addEventListener('click', updateCursorPos);
    editor.addEventListener('input', updateCursorPos);

    // Function to show/hide welcome page and editor
    function showWelcomePage() {
        activeFileName = null;
        welcomePage.style.display = 'flex';
        editorContentArea.style.display = 'none';
        if (terminalPanel) terminalPanel.style.display = 'none';
        if (searchContainer) searchContainer.style.display = 'none';
        if (languageDisplay) languageDisplay.innerText = 'Plain Text';
        
        // Collapse sidebar and deactivate activity bar icons
        if (sidebar) sidebar.style.display = 'none';
        document.querySelectorAll('.action-item').forEach(i => i.classList.remove('active'));

        activeTab.innerHTML = welcomeTabHTML;
        renderSidebar();
    }

    function showEditor() {
        welcomePage.style.display = 'none';
        editorContentArea.style.display = 'flex'; // Use flex for editor-content-area
        
        // Show sidebar and activate explorer when editor is shown
        if (sidebar) sidebar.style.display = 'flex';
        const explorerItem = document.querySelector('.action-item[title="Explorer"]');
        if (explorerItem) {
            explorerItem.classList.add('active');
        }
    }

    // Initially show the welcome page
    showWelcomePage();

    function hideAllDropdowns() {
        document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }

    // Logic for New File: Adds to list and opens it
    function handleNewFile() {
        const name = prompt("Enter file name:", "untitled.txt");
        if (name) {
            if (files.some(f => f.name === name)) {
                alert("File already exists!");
                return;
            }
            const content = getInitialContent(name);
            files.push({ name: name, content: content });
            openFile(name);
            hideAllDropdowns();
        }
    }

    function openFile(name) {
        const file = files.find(f => f.name === name);
        if (!file) return;
        activeFileName = name;
        editor.value = file.content;
        activeTab.innerHTML = name;

        if (languageDisplay) {
            languageDisplay.innerText = getLanguage(name);
        }

        showEditor();
        renderSidebar();
        updateCursorPos();
    }

    // Logic for Open File: Triggers file picker
    function handleOpenFile() {
        fileInput.click();
        hideAllDropdowns();
    }

    // Logic for Save File
    function handleSaveFile() {
        const text = editor.value;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = activeTab.innerText.trim() || 'untitled.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Handle actual file reading after user selects a file
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const existing = files.find(f => f.name === file.name);
            if (!existing) {
                files.push({ name: file.name, content: event.target.result });
            } else {
                existing.content = event.target.result;
            }
            openFile(file.name);
        };
        reader.readAsText(file);
    });

    // Render File Tree
    function renderSidebar(filesToRender = files) {
        fileListContainer.innerHTML = '';
        filesToRender.forEach(file => {
            const li = document.createElement('li');
            li.className = `file-item ${file.name === activeFileName ? 'active' : ''}`;
            li.innerHTML = `
                <span>${file.name}</span>
                <span class="delete-btn" data-name="${file.name}" title="Delete File">×</span>
            `;
            
            li.addEventListener('click', (e) => {
                if (e.target.classList.contains('delete-btn')) return;
                openFile(file.name);
            });

            li.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                deleteFile(file.name);
            });

            fileListContainer.appendChild(li);
        });
    }

    function handleSearch() {
        const query = searchInput.value.toLowerCase();
        const filtered = files.filter(f => 
            f.name.toLowerCase().includes(query) || 
            f.content.toLowerCase().includes(query)
        );
        renderSidebar(filtered);
    }

    function deleteFile(name) {
        if (confirm(`Delete '${name}'?`)) {
            files = files.filter(f => f.name !== name);
            if (activeFileName === name) {
                showWelcomePage();
            } else {
                renderSidebar();
            }
        }
    }

    // Save content to memory when typing
    editor.addEventListener('input', () => {
        const file = files.find(f => f.name === activeFileName);
        if (file) file.content = editor.value;
    });

    if (searchInput) searchInput.addEventListener('input', handleSearch);

    // Event Listeners for Menu and Welcome Page Actions
    if (newFileMenu) newFileMenu.addEventListener('click', handleNewFile);
    if (newFileAction) newFileAction.addEventListener('click', handleNewFile);
    if (openFileMenu) openFileMenu.addEventListener('click', handleOpenFile);
    if (openFileAction) openFileAction.addEventListener('click', handleOpenFile);
    if (sidebarNewFileBtn) sidebarNewFileBtn.addEventListener('click', handleNewFile);

    // Customize Button Logic
    const customizeBtn = document.getElementById('customize-btn');
    const customizeThemes = document.getElementById('customize-themes');
    if (customizeBtn && customizeThemes) {
        customizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = customizeThemes.style.display === 'none';
            customizeThemes.style.display = isHidden ? 'block' : 'none';
            // Change arrow direction
            const arrow = customizeBtn.querySelector('span');
            if (arrow) arrow.innerText = isHidden ? '▲' : '▼';
        });
    }

    if (newTerminalMenu) {
        newTerminalMenu.addEventListener('click', () => {
            if (terminalPanel) terminalPanel.style.display = 'flex';
            hideAllDropdowns();
        });
    }

    // Window Controls Logic
    if (minBtn) {
        minBtn.addEventListener('click', () => {
            alert("Note: Browsers do not allow scripts to minimize windows to the taskbar.");
        });
    }

    if (maxBtn) {
        maxBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) document.documentElement.requestFullscreen();
            else document.exitFullscreen();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (confirm("Are you sure you want to close this window?")) window.close();
        });
    }

    // Initial Render
    renderSidebar();

    // Generic Dropdown Toggle Logic for all menu items
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const dropdown = item.querySelector('.dropdown-content');
            if (!dropdown) return;

            e.stopPropagation();

            // Close other open dropdowns
            document.querySelectorAll('.dropdown-content.show').forEach(openDropdown => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('show');
                }
            });

            dropdown.classList.toggle('show');
        });
    });

    // Close dropdown when clicking anywhere else
    document.addEventListener('click', () => {
        document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            handleNewFile();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 'o') {
            e.preventDefault();
            handleOpenFile();
        }
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            handleSaveFile();
        }
        if (e.key === 'Escape') {
            if (searchContainer && searchContainer.style.display === 'block') {
                searchContainer.style.display = 'none';
                const searchIcon = document.querySelector('.action-item[title="Search"]');
                if (searchIcon && searchIcon.classList.contains('active')) {
                    searchIcon.classList.remove('active');
                    if (sidebar) sidebar.style.display = 'none';
                }
            }
        }
    });

    // Activity Bar Functionality
    const actionItems = document.querySelectorAll('.action-item');
    const sidebarHeader = document.querySelector('.sidebar-header');
    const fileList = document.querySelector('.file-list');
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');

    actionItems.forEach(item => {
        item.addEventListener('click', () => {
            const viewTitle = item.getAttribute('title').toUpperCase();
            const isCurrentlyActive = item.classList.contains('active');
            const isSidebarVisible = sidebar && sidebar.style.display !== 'none';

            if (isCurrentlyActive && isSidebarVisible) {
                // Toggle off if clicking the same active item
                if (sidebar) sidebar.style.display = 'none';
                if (searchContainer) searchContainer.style.display = 'none';
                item.classList.remove('active');
            } else {
                // Show and/or switch view
                if (sidebar) sidebar.style.display = 'flex';
                actionItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Update header content (preserving actions for Explorer)
                sidebarHeader.innerHTML = `${viewTitle} ${viewTitle === 'EXPLORER' ? '<div class="sidebar-actions"><span id="new-file-sidebar" title="New File">📄+</span></div>' : ''}`;
                
                if (viewTitle === 'EXPLORER') {
                    const newBtn = document.getElementById('new-file-sidebar');
                    if (newBtn) newBtn.addEventListener('click', handleNewFile);
                    if (searchContainer) searchContainer.style.display = 'none';
                    fileList.style.display = 'block';
                    sidebarPlaceholder.style.display = 'none';
                    renderSidebar();
                } else if (viewTitle === 'SEARCH') {
                    if (searchContainer) {
                        searchContainer.style.display = 'block';
                        searchInput.focus();
                    }
                    fileList.style.display = 'block';
                    sidebarPlaceholder.style.display = 'none';
                    handleSearch();
                } else {
                    if (searchContainer) searchContainer.style.display = 'none';
                    fileList.style.display = 'none';
                    sidebarPlaceholder.style.display = 'block';
                    sidebarPlaceholder.innerText = `${item.getAttribute('title')} view is active.`;
                }
            }
        });
    });

    // Add event listener for the "Welcome" menu item
    const showWelcomeMenuItem = document.getElementById('show-welcome');
    if (showWelcomeMenuItem) {
        showWelcomeMenuItem.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent dropdown from closing immediately
            showWelcomePage();
        });
    }

    // Theme Switching Logic
    const themeOptions = document.querySelectorAll('.theme-option');
    const themeConfigs = {
        'default': {
            '--bg-dark': '#1e1e1e',
            '--sidebar-bg': '#252526',
            '--activity-bg': '#333333',
            '--menu-bg': '#3c3c3c',
            '--text-color': '#cccccc',
            '--editor-text': '#9cdcfe',
            '--border-color': '#3c3c3c',
            '--accent-color': '#007acc'
        },
        'black': {
            '--bg-dark': '#000000',
            '--sidebar-bg': '#000000',
            '--activity-bg': '#000000',
            '--menu-bg': '#181818',
            '--text-color': '#cccccc',
            '--editor-text': '#9cdcfe',
            '--border-color': '#2b2b2b',
            '--accent-color': '#ffffff'
        },
        'white': {
            '--bg-dark': '#ffffff',
            '--sidebar-bg': '#f3f3f3',
            '--activity-bg': '#eeeeee',
            '--menu-bg': '#e8e8e8',
            '--text-color': '#000000',
            '--menu-bg': '#ffffff',
            '--text-color': '#333333',
            '--editor-text': '#000000',
            '--border-color': '#cccccc',
            '--border-color': '#dddddd',
            '--accent-color': '#007acc'
        }
    };

    function applyTheme(themeName) {
        const config = themeConfigs[themeName];
        if (!config) return;

        Object.keys(config).forEach(property => {
            document.documentElement.style.setProperty(property, config[property]);
        });
        
        hideAllDropdowns();
    }

    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const selectedTheme = option.getAttribute('data-theme');
            applyTheme(selectedTheme);
        });
    });
});
