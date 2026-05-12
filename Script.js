// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
let projects = [];
let currentProject = null;
let openFiles = [];
let activeFile = null;
let autoSaveTimeout = null;
let lastFixedCode = null;

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const newProjectBtn = document.getElementById('newProjectBtn');
const newFileBtn = document.getElementById('newFileBtn');
const newFolderBtn = document.getElementById('newFolderBtn');
const saveBtn = document.getElementById('saveBtn');
const projectManagerBtn = document.getElementById('projectManagerBtn');
const newProjectModal = document.getElementById('newProjectModal');
const projectManagerModal = document.getElementById('projectManagerModal');
const welcomeScreen = document.getElementById('welcomeScreen');
const editorContainer = document.getElementById('editorContainer');
const fileTree = document.getElementById('fileTree');
const codeEditor = document.getElementById('codeEditor');
const lineNumbers = document.getElementById('lineNumbers');
const cursorPosition = document.getElementById('cursorPosition');
const tabBar = document.getElementById('tabBar');
const breadcrumbs = document.getElementById('breadcrumbs');
const syncStatus = document.getElementById('syncStatus');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');
const consoleContent = document.getElementById('consoleContent');

// Side Panel Elements
const outputSlidePanel = document.getElementById('outputSlidePanel');
const closeOutputSlide = document.getElementById('closeOutputSlide');
const slideResizer = document.getElementById('slideResizer');

// API Helper Functions
async function apiRequest(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        showNotification('Error: ' + error.message, 'error');
        throw error;
    }
}

// Connection Status
async function checkConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        if (data.success) {
            updateConnectionStatus(true);
        } else {
            updateConnectionStatus(false);
        }
    } catch (error) {
        updateConnectionStatus(false);
    }
}

function updateConnectionStatus(isConnected) {
    if (isConnected) {
        statusIndicator.className = 'w-2 h-2 rounded-full bg-green-500';
        statusText.textContent = 'Connected';
    } else {
        statusIndicator.className = 'w-2 h-2 rounded-full bg-red-500';
        statusText.textContent = 'Disconnected';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const color = type === 'error' ? 'red' : type === 'success' ? 'green' : 'blue';
    consoleContent.innerHTML += `
        <div class="flex gap-2 mb-1">
            <span class="text-${color}-500">[${type.toUpperCase()}]</span>
            <span>${message}</span>
        </div>
    `;
    consoleContent.scrollTop = consoleContent.scrollHeight;
}

// Theme Toggle
themeToggle.addEventListener('click', () => {
    if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
});

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    htmlElement.classList.remove('dark');
}

// Modal Functions
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// New Project Modal
newProjectBtn.addEventListener('click', () => openModal(newProjectModal));
document.getElementById('createProjectBtn').addEventListener('click', () => openModal(newProjectModal));
document.getElementById('welcomeNewProject').addEventListener('click', () => openModal(newProjectModal));
document.getElementById('cancelProjectBtn').addEventListener('click', () => closeModal(newProjectModal));

document.getElementById('createProjectConfirm').addEventListener('click', async () => {
    const projectName = document.getElementById('projectNameInput').value.trim();
    const template = document.querySelector('input[name="projectTemplate"]:checked').value;
    
    if (projectName) {
        await createProject(projectName, template);
        closeModal(newProjectModal);
        document.getElementById('projectNameInput').value = '';
    } else {
        alert('Please enter a project name');
    }
});

// Project Manager Modal
projectManagerBtn.addEventListener('click', async () => {
    await loadProjects();
    renderProjectList();
    openModal(projectManagerModal);
});
document.getElementById('welcomeOpenProject').addEventListener('click', async () => {
    await loadProjects();
    renderProjectList();
    openModal(projectManagerModal);
});
document.getElementById('closeProjectManager').addEventListener('click', () => closeModal(projectManagerModal));
document.getElementById('newProjectFromManager').addEventListener('click', () => {
    closeModal(projectManagerModal);
    openModal(newProjectModal);
});

// Load Projects from Backend
async function loadProjects() {
    try {
        const result = await apiRequest('/projects');
        projects = result.projects;
        showNotification('Projects loaded successfully', 'success');
    } catch (error) {
        console.error('Failed to load projects:', error);
    }
}

// Create Project
async function createProject(name, template) {
    try {
        const result = await apiRequest('/projects', 'POST', {
            name: name,
            template: template
        });
        
        projects.push(result.project);
        showNotification(`Project "${name}" created successfully`, 'success');
        await openProject(result.project);
    } catch (error) {
        console.error('Failed to create project:', error);
    }
}

// Open Project
async function openProject(project) {
    try {
        const result = await apiRequest(`/projects/${project.id}`);
        currentProject = result.project;
        
        welcomeScreen.style.display = 'none';
        editorContainer.style.display = 'flex';
        renderFileTree();
        syncStatus.textContent = 'Project synced';
        
        showNotification(`Opened project: ${currentProject.name}`, 'success');
        
        if (currentProject.files.length > 0) {
            await openFile(currentProject.files[0]);
        }
    } catch (error) {
        console.error('Failed to open project:', error);
    }
}

// Render File Tree
function renderFileTree() {
    if (!currentProject) {
        fileTree.innerHTML = `
            <div id="emptyState" class="flex flex-col items-center justify-center py-12 text-center">
                <span class="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">folder_open</span>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">No project open</p>
                <button id="createProjectBtn" class="text-xs text-primary hover:underline">Create New Project</button>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50">
            <span class="material-symbols-outlined text-sm text-slate-400">keyboard_arrow_down</span>
            <span class="material-symbols-outlined text-sm text-primary">folder</span>
            <span class="text-sm font-medium">${currentProject.name}</span>
        </div>
    `;
    
    currentProject.folders.forEach(folder => {
        html += `
            <div class="ml-4 space-y-1">
                <div class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300">
                    <span class="material-symbols-outlined text-sm text-slate-400">keyboard_arrow_down</span>
                    <span class="material-symbols-outlined text-sm text-amber-400">folder_open</span>
                    <span class="text-sm">${folder}</span>
                </div>
        `;
        
        const folderFiles = currentProject.files.filter(f => f.path.startsWith(folder));
        if (folderFiles.length > 0) {
            html += '<div class="ml-6 space-y-1 border-l border-slate-200 dark:border-slate-800 pl-2">';
            folderFiles.forEach(file => {
                const isActive = activeFile && activeFile.path === file.path;
                html += `
                    <div class="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'}" data-file-path="${file.path}">
                        <span class="material-symbols-outlined text-sm">description</span>
                        <span class="text-sm">${file.name}</span>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        html += '</div>';
    });
    
    fileTree.innerHTML = html;
    
    fileTree.querySelectorAll('[data-file-path]').forEach(el => {
        el.addEventListener('click', async () => {
            const filePath = el.getAttribute('data-file-path');
            const file = currentProject.files.find(f => f.path === filePath);
            if (file) await openFile(file);
        });
    });
}

// Open File
async function openFile(file) {
    try {
        const result = await apiRequest(`/projects/${currentProject.id}/files/${file.path}`);
        
        activeFile = { ...file, content: result.content };
        codeEditor.value = result.content;
        updateLineNumbers();
        renderFileTree();
        updateBreadcrumbs(file.path);
        
        if (!openFiles.find(f => f.path === file.path)) {
            openFiles.push(activeFile);
        }
        renderTabs();
        
        showNotification(`Opened file: ${file.name}`, 'info');
    } catch (error) {
        console.error('Failed to open file:', error);
    }
}

// Update Breadcrumbs
function updateBreadcrumbs(path) {
    const parts = path.split('/');
    let html = '';
    parts.forEach((part, i) => {
        if (i > 0) html += '<span class="mx-1.5">/</span>';
        html += `<span class="${i === parts.length - 1 ? 'text-slate-600 dark:text-slate-300 font-medium' : 'hover:text-primary cursor-pointer'}">${part}</span>`;
    });
    breadcrumbs.innerHTML = html;
}

// Render Tabs
function renderTabs() {
    let html = '';
    openFiles.forEach(file => {
        const isActive = activeFile && activeFile.path === file.path;
        html += `
            <div class="flex items-center px-4 py-2 border-r border-slate-200 dark:border-slate-800 ${isActive ? 'bg-white dark:bg-[#0d1117] border-t-2 border-t-primary' : 'opacity-60 hover:bg-slate-100 dark:hover:bg-slate-800/30'} min-w-[140px] cursor-pointer" data-file-path="${file.path}">
                <span class="material-symbols-outlined text-sm mr-2 ${isActive ? 'text-primary' : ''}">description</span>
                <span class="text-xs font-medium truncate">${file.name}</span>
                <span class="material-symbols-outlined text-xs ml-auto cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded" data-close-file="${file.path}">close</span>
            </div>
        `;
    });
    tabBar.innerHTML = html;
    
    tabBar.querySelectorAll('[data-file-path]').forEach(el => {
        el.addEventListener('click', async (e) => {
            if (!e.target.hasAttribute('data-close-file')) {
                const filePath = el.getAttribute('data-file-path');
                const file = currentProject.files.find(f => f.path === filePath);
                if (file) await openFile(file);
            }
        });
    });
    
    tabBar.querySelectorAll('[data-close-file]').forEach(el => {
        el.addEventListener('click', async (e) => {
            e.stopPropagation();
            const filePath = el.getAttribute('data-close-file');
            await closeFile(filePath);
        });
    });
}

// Close File
async function closeFile(filePath) {
    openFiles = openFiles.filter(f => f.path !== filePath);
    if (activeFile && activeFile.path === filePath) {
        if (openFiles.length > 0) {
            await openFile(openFiles[0]);
        } else {
            activeFile = null;
            codeEditor.value = '';
            breadcrumbs.innerHTML = '';
        }
    }
    renderTabs();
}

// Render Project List
function renderProjectList() {
    const projectList = document.getElementById('projectList');
    if (projects.length === 0) {
        projectList.innerHTML = `
            <div class="text-center py-12 text-slate-500 dark:text-slate-400">
                <span class="material-symbols-outlined text-4xl mb-2">folder_off</span>
                <p class="text-sm">No projects yet. Create your first project!</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    projects.forEach(project => {
        html += `
            <div class="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-2xl text-primary">folder</span>
                    <div>
                        <div class="font-medium text-slate-900 dark:text-slate-100">${project.name}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">${project.template} • ${project.files.length} files</div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button class="px-3 py-1.5 text-xs font-medium bg-primary hover:bg-blue-600 text-white rounded-lg transition-colors" data-open-project="${project.id}">
                        Open
                    </button>
                    <button class="p-1.5 text-slate-400 hover:text-red-500 transition-colors" data-delete-project="${project.id}">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>
        `;
    });
    
    projectList.innerHTML = html;
    
    projectList.querySelectorAll('[data-open-project]').forEach(el => {
        el.addEventListener('click', async () => {
            const projectId = el.getAttribute('data-open-project');
            const project = projects.find(p => p.id === projectId);
            if (project) {
                await openProject(project);
                closeModal(projectManagerModal);
            }
        });
    });
    
    projectList.querySelectorAll('[data-delete-project]').forEach(el => {
        el.addEventListener('click', async () => {
            const projectId = el.getAttribute('data-delete-project');
            if (confirm('Are you sure you want to delete this project?')) {
                await deleteProject(projectId);
            }
        });
    });
}

// Delete Project
async function deleteProject(projectId) {
    try {
        await apiRequest(`/projects/${projectId}`, 'DELETE');
        projects = projects.filter(p => p.id !== projectId);
        renderProjectList();
        showNotification('Project deleted successfully', 'success');
        
        if (currentProject && currentProject.id === projectId) {
            currentProject = null;
            welcomeScreen.style.display = 'flex';
            editorContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to delete project:', error);
    }
}

// New File Button
newFileBtn.addEventListener('click', async () => {
    if (!currentProject) {
        alert('Please open or create a project first');
        return;
    }
    
    const fileName = prompt('Enter file name (e.g., MyClass.java):');
    if (fileName) {
        await createFile(fileName);
    }
});

// Create File
async function createFile(fileName) {
    try {
        const filePath = `src/${fileName}`;
        const result = await apiRequest(`/projects/${currentProject.id}/files`, 'POST', {
            name: fileName,
            path: filePath,
            content: ''
        });
        
        currentProject.files.push(result.file);
        renderFileTree();
        await openFile(result.file);
        showNotification(`File "${fileName}" created successfully`, 'success');
    } catch (error) {
        console.error('Failed to create file:', error);
    }
}

// New Folder Button
newFolderBtn.addEventListener('click', async () => {
    if (!currentProject) {
        alert('Please open or create a project first');
        return;
    }
    
    const folderName = prompt('Enter folder name:');
    if (folderName) {
        await createFolder(folderName);
    }
});

// Create Folder
async function createFolder(folderName) {
    try {
        await apiRequest(`/projects/${currentProject.id}/folders`, 'POST', {
            name: folderName
        });
        
        currentProject.folders.push(folderName);
        renderFileTree();
        showNotification(`Folder "${folderName}" created successfully`, 'success');
    } catch (error) {
        console.error('Failed to create folder:', error);
    }
}

// Auto-save file content
async function saveFileContent() {
    if (activeFile && currentProject) {
        try {
            await apiRequest(`/projects/${currentProject.id}/files/${activeFile.path}`, 'PUT', {
                content: codeEditor.value
            });
            
            activeFile.content = codeEditor.value;
            syncStatus.textContent = 'Saved';
            
            setTimeout(() => {
                syncStatus.textContent = 'Project synced';
            }, 2000);
        } catch (error) {
            console.error('Failed to save file:', error);
            syncStatus.textContent = 'Save failed';
        }
    }
}

// Save content when typing (with debounce)
codeEditor.addEventListener('input', () => {
    updateLineNumbers();
    syncStatus.textContent = 'Saving...';
    
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    autoSaveTimeout = setTimeout(saveFileContent, 1000);
});

// Manual Save Button
saveBtn.addEventListener('click', async () => {
    if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
    }
    await saveFileContent();
    showNotification('File saved successfully', 'success');
});

// Code Editor Functions
function updateLineNumbers() {
    const lines = codeEditor.value.split('\n').length;

    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) =>
        `<div>${i + 1}</div>`
    ).join('');
}

codeEditor.addEventListener('scroll', () => {
    lineNumbers.scrollTop = codeEditor.scrollTop;
});

function updateCursorPosition() {
    const text = codeEditor.value.substring(0, codeEditor.selectionStart);
    const lines = text.split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    cursorPosition.textContent = `Line ${currentLine}, Col ${currentCol}`;
}

codeEditor.addEventListener('keyup', updateCursorPosition);
codeEditor.addEventListener('click', updateCursorPosition);

codeEditor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = codeEditor.selectionStart;
        const end = codeEditor.selectionEnd;
        codeEditor.value = codeEditor.value.substring(0, start) + '    ' + codeEditor.value.substring(end);
        codeEditor.selectionStart = codeEditor.selectionEnd = start + 4;
    }
});

function formatCode(code) {
    let indent = 0;
    return code.split('\n').map(line => {
        line = line.trim();

        if (line.endsWith('}')) indent--;

        let formatted = '    '.repeat(Math.max(indent, 0)) + line;

        if (line.endsWith('{')) indent++;

        return formatted;
    }).join('\n');
}

// Console Functions
const clearConsoleBtn = document.getElementById('clearConsole');

clearConsoleBtn.addEventListener('click', () => {
    consoleContent.innerHTML = '';
});

// Panel Tab Switching
const consoleTab = document.getElementById('consoleTab');
const errorTab = document.getElementById('errorTab');
const terminalTab = document.getElementById('terminalTab');

function switchTab(activeTab) {
    [consoleTab, errorTab, terminalTab].forEach(tab => {
        tab.classList.remove('border-b-2', 'border-primary', 'text-primary');
        tab.classList.add('text-slate-500');
    });
    activeTab.classList.add('border-b-2', 'border-primary', 'text-primary');
    activeTab.classList.remove('text-slate-500');
}

consoleTab.addEventListener('click', () => switchTab(consoleTab));
errorTab.addEventListener('click', () => switchTab(errorTab));
terminalTab.addEventListener('click', () => switchTab(terminalTab));

// --- SIDE PANEL DRAG RESIZE LOGIC ---
let isResizing = false;

slideResizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    slideResizer.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    outputSlidePanel.style.transition = 'none'; // Prevent stutter while dragging
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    // Calculate new width (from right edge)
    let newWidth = window.innerWidth - e.clientX;
    
    // Set boundaries (min 300px, max 80% of window)
    if (newWidth < 300) newWidth = 300;
    if (newWidth > window.innerWidth * 0.8) newWidth = window.innerWidth * 0.8;
    
    outputSlidePanel.style.width = `${newWidth}px`;
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        slideResizer.classList.remove('resizing');
        document.body.style.cursor = '';
        // Re-enable transition for smooth open/close animations
        outputSlidePanel.style.transition = 'transform 0.3s ease-in-out';
    }
});

// Close Slide Panel
closeOutputSlide.addEventListener('click', () => {
    outputSlidePanel.classList.add('translate-x-full');
});

// Run Button
// Run Button
document.getElementById('runBtn').addEventListener('click', async () => {
    if (!activeFile || !currentProject) {
        alert('No file is open');
        return;
    }
    
    try {
        await saveFileContent(); 
        
        syncStatus.textContent = 'Fixing code...';
        showNotification(`Sending ${activeFile.name} to AutoFixer...`, 'info');
        
        // Open panel
        outputSlidePanel.classList.remove('translate-x-full');
        switchTab(consoleTab); 
        
        const result = await apiRequest(`/projects/${currentProject.id}/run`, 'POST', {
            filePath: activeFile.path
        });

        console.log("DEBUG RESULT:", result);

        // 🔥 Prefer clean backend response
        let fixedCode = result.fixed_code || result.output;

        console.log("RAW OUTPUT:", fixedCode);

        // ✅ SAFETY CHECK
        if (!fixedCode || typeof fixedCode !== "string" || fixedCode.trim().length === 0) {
            console.warn("Empty or invalid output received");
            showNotification("AutoFixer returned empty result", "error");
            return;
        }

        lastFixedCode = fixedCode;
        // ✅ Format nicely
        const formattedCode = formatCode(fixedCode);

        // ✅ Update editor safely
        // codeEditor.value = formattedCode;
        updateLineNumbers();

        // ✅ Append console output (clean)
        consoleContent.innerHTML += `
        <div class="mb-4">
            <div class="text-green-500 text-xs mb-1">[AUTO FIX RESULT]</div>
            <pre class="whitespace-pre font-mono text-sm bg-[#0d1117] text-gray-200 p-3 rounded overflow-auto"></pre>
        </div>
        `;

        const lastPre = consoleContent.querySelector("pre:last-of-type");
        lastPre.textContent = fixedCode;

        consoleContent.scrollTop = consoleContent.scrollHeight;

        showNotification('AutoFixer completed successfully', 'success');
        syncStatus.textContent = 'Project synced';

    } catch (error) {
        console.error('FULL ERROR:', error);

        showNotification(`Failed: ${error.message}`, 'error');

        consoleContent.innerHTML += `
            <div class="mb-4 text-red-500">
                <div class="text-xs mb-1">[ERROR]</div>
                <pre class="whitespace-pre-wrap">${error.stack || error.message}</pre>
            </div>
        `;

        syncStatus.textContent = 'Fix failed';
    }
});

document.getElementById('applyFixBtn').addEventListener('click', () => {
    if (!lastFixedCode) {
        showNotification("No fix available", "error");
        return;
    }

    codeEditor.value = formatCode(lastFixedCode);
    updateLineNumbers();

    showNotification("Fix applied to editor", "success");
});

// Initialize on page load
window.addEventListener('load', async () => {
    await checkConnection();
    await loadProjects();
    
    // Check connection every 30 seconds
    setInterval(checkConnection, 30000);
});
