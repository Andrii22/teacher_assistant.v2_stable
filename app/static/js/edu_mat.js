let currentFolderElement;
let currentFolderId = null; 
let currentLinkElement;
let currentFolderIdFile ;
let currentFileElement;
function attachGlobalListeners() {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', hideAllContextMenus);
    document.querySelectorAll('.folder').forEach(folder => {
        folder.addEventListener('click', toggleChildFolders);
    });
}
function handleContextMenu(e) {
    e.preventDefault();
    hideAllContextMenus();
    let target = e.target;
    while (target && target.id !== 'content-educational-materials') {
        if (target.classList.contains('folder')) {
            currentFolderElement = target;
            if (target.classList.contains('root-folder')) {
                showContextMenu('root-folder-context-menu', e);
                currentFolderIdFile = 1;
                e.stopPropagation();
                return;
            } else {
                showContextMenu('created-folder-context-menu', e);
                currentFolderIdFile  = target.getAttribute('data-folder-id');
                e.stopPropagation();
                return;
            }
        } else if (target.classList.contains('file')) {
            currentFileElement = target;
            showContextMenu('file-context-menu', e);
            e.stopPropagation();
            return;
        } else if (target.tagName.toLowerCase() === 'a') {
            currentLinkElement = target;
            showContextMenu('link-context-menu', e);
            e.stopPropagation();
            return;
        }
        target = target.parentElement;
    }
    showRootContextMenu(e);
}

function showContextMenu(menuId, event) {
    const menu = document.getElementById(menuId);
    if (!menu) {
        console.error(`Element with ID ${menuId} not found!`);
        return;
    }
    menu.style.top = `${event.clientY}px`;
    menu.style.left = `${event.clientX}px`;
    menu.style.display = 'block';
}
function showRootContextMenu(e) {
    e.preventDefault();
    e.stopPropagation(); 
    hideAllContextMenus();
    showContextMenu('root-folder-context-menu', e);
}
function hideAllContextMenus() {
    ['root-folder-context-menu', 'created-folder-context-menu','file-context-menu' ,'link-context-menu'].forEach(menuId => {
        const menu = document.getElementById(menuId);
        if (menu) menu.style.display = 'none';
    });
}

function toggleChildFolders(e) {
    e.stopPropagation();

    const folder = e.currentTarget;
    const icon = folder.querySelector('.folder-icon');
    const childrenContainer = folder.querySelector('.folder-children');

    if (childrenContainer) {
        if (childrenContainer.style.display === 'none' || !childrenContainer.style.display) {
            childrenContainer.style.display = 'block';
            icon.classList.remove('closed-icon');
            icon.classList.add('open-icon');
        } else {
            childrenContainer.style.display = 'none';
            icon.classList.remove('open-icon');
            icon.classList.add('closed-icon');
        }
    }
}
function createFolderElement(name, id) {
    const folderDiv = document.createElement('div');
    folderDiv.classList.add('folder');
    folderDiv.setAttribute('data-folder-id', id);
    
    const closedIcon = document.createElement('span');
    closedIcon.classList.add('folder-icon', 'closed-icon');
    folderDiv.appendChild(closedIcon);

    const folderLabel = document.createElement('span');
    folderLabel.textContent = name;
    folderDiv.appendChild(folderLabel);

    const childContainer = document.createElement('div');
    childContainer.classList.add('folder-children');
    folderDiv.appendChild(childContainer);
    folderDiv.addEventListener('click', toggleChildFolders);

    return folderDiv;
}

function populateFolders(parentElement, folders) {
    folders.forEach(folder => {
        const folderDiv = createFolderElement(folder.name, folder.id);
        parentElement.appendChild(folderDiv);
        if (folder.children && folder.children.length > 0) {
            populateFolders(folderDiv.querySelector('.folder-children'), folder.children);
        }
    });
}

function loadAllFolders() {
    return new Promise((resolve, reject) => {
        fetch('/folder/getAll')
            .then(response => response.json())
            .then(data => {
                const rootFolderChildren = document.querySelector('.root-folder > .folder-children');
                populateFolders(rootFolderChildren, data);
                resolve(); 
            })
            .catch(error => {
                console.error('Error fetching folders:', error);
                reject(error); 
            });
    });
}

function saveFolder() {
    const folderName = document.getElementById('folder-name').value;
    if (!folderName) {
        alert("Назва папки не може бути пустою!");
        return;
    }

    const parentFolderId = currentFolderElement ? currentFolderElement.getAttribute('data-folder-id') : null;

    fetch('/folder/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: folderName,
            parent_folder_id: parentFolderId
        }),
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
    

        if (data && folderName && typeof data.folder_id !== 'undefined') {
            const targetContainer = currentFolderElement ? currentFolderElement.querySelector('.folder-children') : document.querySelector('.root-folder .folder-children');
            const newFolder = createFolderElement(folderName, data.folder_id); 
            targetContainer.appendChild(newFolder);

            const addFolderForm = document.getElementById('add-folder-form');
            addFolderForm.style.display = 'none';

            document.getElementById('folder-name').value = "";
        } else {
            console.error("Unexpected data format from server:", data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
function showAddFolderForm() {
    const addFolderForm = document.getElementById('add-folder-form');
    addFolderForm.style.display = 'block';
}
function ClosesaveFolder() {
    const addFolderForm = document.getElementById('add-folder-form');
    addFolderForm.style.display = 'none'
}
function handleFolderClick(event) {
    let folder = event.currentTarget;
    let icon = folder.querySelector('.folder-icon');
    let children = folder.querySelector('.folder-children');
    if (icon.classList.contains('closed-icon')) {
        icon.classList.remove('closed-icon');
        icon.classList.add('open-icon');
        children.style.display = 'block';
    } else {
        icon.classList.remove('open-icon');
        icon.classList.add('closed-icon');
        children.style.display = 'none';
    }
}
function deleteFolder() {
    if (!currentFolderElement) return; 

    const folderId = currentFolderElement.getAttribute('data-folder-id');
    if (!folderId) {
        console.error("Folder ID is missing!");
        return;
    }

    fetch(`/folder/${folderId}/delete`, { method: 'DELETE' })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        
        alert("Папку видалено!"); 
        currentFolderElement.remove();

    })
    .catch(error => {
        console.error("Помилка при видаленні папки:", error);
        alert("Сталася помилка при видаленні папки!");
    });
}
function editFolder() {
    if (!currentFolderElement) return;

    const currentFolderName = currentFolderElement.querySelector('span:not(.folder-icon)').textContent;
    const newName = prompt('Введіть нову назву папки:', currentFolderName);

    if (newName && newName !== currentFolderName) {
        const folderId = currentFolderElement.getAttribute('data-folder-id');
        fetch(`/folder/${folderId}/update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "name": newName
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            
            alert("Папку оновлено!");
            currentFolderElement.querySelector('span:not(.folder-icon)').textContent = newName;
        })
        .catch(error => {
            console.error("Error updating folder:", error);
            alert("An error occurred while updating the folder!");
        });
    }
}

function showAddLinkForm() {
    const addLinkFields = document.getElementById('add-link-form');
    addLinkFields.style.display = 'block';
}
function ClosesaveLink() {
    const addLinkFields = document.getElementById('add-link-form');
    addLinkFields.style.display = 'none'
}

function saveLink() {
    const linkName = document.getElementById('link-name').value;
    const linkURL = document.getElementById('link-url').value;

    if (!linkName || !linkURL) {
        alert("І назва посилання, і URL-адреса не можуть бути порожніми!");
        return;
    }

    let folderId = currentFolderElement ? currentFolderElement.getAttribute('data-folder-id') : null;
    if (folderId === null) {
        folderId = 1; 
    }

    fetch('/link/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: linkName,
            url: linkURL,
            folder_id: folderId
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        

        if (data && typeof data.link_id !== 'undefined') {
            fetchLinkFromDatabaseAndDisplay(folderId);
            
            const addLinkFields = document.getElementById('add-link-form');
            addLinkFields.style.display = 'none';

            document.getElementById('link-name').value = "";
            document.getElementById('link-url').value = "";

        } else {
            console.error("Unexpected data format from server:", data);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("An error occurred while adding the link!");
    });
}

function fetchLinkFromDatabaseAndDisplay(folderId) {
    const folderElement = document.querySelector(`[data-folder-id="${folderId}"]`);
    if (!folderId) {
        console.error('folderId not provided to fetchLinkFromDatabaseAndDisplay');
        return;
    }
    fetch(`/folder/${folderId}/links`, { method: 'GET' })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(links => {
        links.forEach(link => {
            displayLinkInUI(link.name, link.url, link.id, folderElement);

        });
    })
    .catch(error => {
        console.error("Error fetching links:", error);
    });
}


function loadAllLinksOnPageLoad() {
    

    fetch('/all-links')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(links => {
        

        links.forEach(link => {
            const folderElement = document.querySelector(`[data-folder-id="${link.folder_id}"]`);
            if (folderElement) {
                displayLinkInUI(link.name, link.url, link.id, folderElement);
            } else {
            }
        });
    })
    .catch(error => {
        console.error("Error fetching links:", error);
    });
}
function displayLinkInUI(name, url, id, folderElement) {
    if (!folderElement) {
        console.error('No folderElement provided to displayLinkInUI');
        return;
    }

    const linkElement = document.createElement('a');
    linkElement.href = url;
    linkElement.textContent = name;
    linkElement.setAttribute('data-link-id', id);

    const linkWrapper = document.createElement('div'); 
    linkWrapper.appendChild(linkElement); 

    const targetContainer = folderElement ? folderElement.querySelector('.folder-children') : document.querySelector('.root-folder .folder-children');
    if (targetContainer) {
        targetContainer.appendChild(linkWrapper); 
    } else {
        
    }
}

function editLink() {
    hideAllContextMenus();

    const linkId = currentLinkElement.getAttribute('data-link-id');
    const currentLinkName = currentLinkElement.textContent.trim();
    const currentLinkUrl = currentLinkElement.getAttribute('href');

    const newLinkName = prompt("Введіть нову назву посилання", currentLinkName);
    if (newLinkName === null || newLinkName.trim() === "") return; 
    const newLinkUrl = prompt("Введіть нову URL посилання:", currentLinkUrl);
    if (newLinkUrl === null || newLinkUrl.trim() === "") return;

    updateLinkInDatabase(linkId, newLinkName, newLinkUrl);
}

function updateLinkInDatabase(linkId, linkName, linkUrl) {
    fetch(`/link/${linkId}/update`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: linkName,
            url: linkUrl
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Посилання оновлено!') {
            currentLinkElement.textContent = linkName;
            currentLinkElement.setAttribute('href', linkUrl);
        } else {
            alert(data.error || 'Failed to update link.');
        }
    })
    .catch(error => {
        console.error('Error updating link:', error);
    });
}
function deleteLink() {
    const linkId = currentLinkElement.getAttribute('data-link-id');

    const requestOptions = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: linkId })
    };

    fetch(`/link/${linkId}/delete`, requestOptions)
        .then(response => response.json())
        .then(data => {
            if (data.message && data.message === 'Link deleted!') {
                currentLinkElement.remove();
                alert('Посилання успішно видалено!');
            } else {
                throw new Error(data.error || 'Unknown error occurred while deleting link.');
            }
        })
        .catch(error => {
            alert(`Error: ${error.message}`);
        });
}



function ClosesaveFile() {
    const addLinkFields = document.getElementById('add-file-form');
    addLinkFields.style.display = 'none'
}

function showAddFileForm() {
    const addLinkFields = document.getElementById('add-file-form');
    addLinkFields.style.display = 'block';
}

function uploadFile() {
    console.log("Current Folder ID:", currentFolderIdFile);
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];

    if (!file) {
        alert('No file selected!');
        return;
    }

    const allowedExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        alert('Тільки ' + allowedExtensions.join(', ') + ' файли підтримуються.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder_id', currentFolderIdFile);

    fetch('/file/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.message && data.message === 'File uploaded!') {
            alert('Файл успішно завантажено!');
            const addLinkFields = document.getElementById('add-file-form');
            addLinkFields.style.display = 'none';
            fetchFilesFromDatabaseAndDisplay(currentFolderIdFile);
        }
    })
    .catch(error => {
        alert(`Error: ${error.message}`);
    });
}
function getFileIcon(fileExtension) {
    switch (fileExtension) {
        case 'pdf': return '/static/uploads/system_icon/pdf.png'; 
        case 'txt': return '/static/uploads/system_icon/txt.png'; 
        case 'doc':
        case 'docx': return '/static/uploads/system_icon/doc.png';
        case 'xls':
        case 'xlsx': return '/static/uploads/system_icon/xls.png';
        case 'ppt':
        case 'pptx': return '/static/uploads/system_icon/ppt.png';
        default: return '/static/uploads/system_icon/txt.png'; 
    }
}

function displayFileInUI(fileName, fileSize, fileId, folderElement) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    const fileWrapper = document.createElement('div');
    fileWrapper.classList.add('file');
    fileWrapper.setAttribute('data-file-id', fileId);

    const fileIcon = document.createElement('img');
    fileIcon.src = getFileIcon(fileExtension);  
    fileIcon.alt = fileExtension;  
    fileIcon.style.width = '30px';  
    fileIcon.style.height = '30px';  
    fileIcon.style.marginRight = '10px'; 
    fileIcon.style.verticalAlign = 'middle';
    fileWrapper.appendChild(fileIcon);


    const fileNameElement = document.createElement('span');
    fileNameElement.textContent = fileName;
    fileWrapper.appendChild(fileNameElement);

    const viewButton = document.createElement('button');
    viewButton.textContent = 'Завантажити';
    viewButton.style.fontSize = '1em'; 
    viewButton.style.marginLeft = '20px'; 
    viewButton.style.padding = '2px 8px'; 
    viewButton.style.height = '25px'; 
    viewButton.addEventListener('click', function() {
        const fileLocation = `/static/uploads/uploads_file/${fileName}`;
        window.open(fileLocation, '_blank');
    });
    fileWrapper.appendChild(viewButton); 

    const targetContainer = folderElement ? folderElement.querySelector('.folder-children') : document.querySelector('.root-folder .folder-children');
    
    if (targetContainer) {
        targetContainer.appendChild(fileWrapper);
    } else {
        console.warn(`No .folder-children container found in folder: ${folderElement ? folderElement.getAttribute('data-folder-id') : 'root'}`);
    }
}
function loadAllFilesOnPageLoad() {
    fetch('/all-files')
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(files => {
        files.forEach(file => {
            const folderElement = file.folder_id ? document.querySelector(`[data-folder-id="${file.folder_id}"]`) : null;
            displayFileInUI(file.name, file.size, file.id, folderElement);
        });
    })
    .catch(error => {
        console.error("Error fetching files:", error);
    });
}
function fetchFilesFromDatabaseAndDisplay(currentFolderIdFile) {
    const folderElement = document.querySelector(`[data-folder-id="${currentFolderIdFile}"]`);
    const targetContainer = folderElement ? folderElement.querySelector('.folder-children') : document.querySelector('.root-folder .folder-children');
    while (targetContainer && targetContainer.firstChild) {
        targetContainer.firstChild.remove();
    }
    if (!currentFolderIdFile) {
        console.error('folderId not provided to fetchFilesFromDatabaseAndDisplay');
        return;
    }

    fetch(`/folder/${currentFolderIdFile}/files`, { method: 'GET' })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(files => {
        files.forEach(file => {
            displayFileInUI(file.name, file.size, file.id, folderElement);
        });
    })
    .catch(error => {
        console.error("Error fetching files:", error);
    });
}
function deleteFile() {
    hideAllContextMenus();

    const fileId = currentFileElement.getAttribute('data-file-id');

    if (confirm('Ви впевнені, що хочете видалити цей файл?')) {
        deleteFileFromDatabase(fileId);
    }
}

function deleteFileFromDatabase(fileId) {
    fetch(`/file/${fileId}/delete`, {
        method: 'DELETE'
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error || 'Failed to delete file.');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.message === 'File deleted!') {
            currentFileElement.remove();
        } else {
            throw new Error('Unexpected response from server.');
        }
    })
    .catch(error => {
        console.error('Error deleting file:', error);
        alert(error.message);
    });
}

function performSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const previouslyHighlighted = document.querySelectorAll('.highlighted');
    previouslyHighlighted.forEach(item => {
        item.classList.remove('highlighted');
    });

    if (query === '') {
        return; 
    }
    const items = document.querySelectorAll('.folder, .file, .link');
    items.forEach(item => {
        const itemName = item.textContent.trim().toLowerCase();
        if (itemName.includes(query)) {
            item.classList.add('highlighted'); 
            let parent = item.parentElement;
            while (parent) {
                if (parent.classList.contains('folder')) {
                    openFolder(parent); 
                }
                parent = parent.parentElement;
            }
        }
    });
}

function openFolder(folder) {
    const icon = folder.querySelector('.folder-icon');
    const childrenContainer = folder.querySelector('.folder-children');

    if (childrenContainer && childrenContainer.style.display !== 'block') {
        childrenContainer.style.display = 'block';
        icon.classList.remove('closed-icon');
        icon.classList.add('open-icon');
    }
}

document.getElementById('searchInput').addEventListener('input', performSearch);


document.addEventListener('DOMContentLoaded', function() {
    loadAllFolders().then(() => {
        console.log("Folders loaded");
        return loadAllLinksOnPageLoad();
    })
    .then(() => {
        console.log("Links loaded");
        return attachGlobalListeners();
    })
    .then(() => {
        console.log("Listeners attached");
        return loadAllFilesOnPageLoad();
    })
    .catch(error => {
        console.error('Error:', error);
    });
});