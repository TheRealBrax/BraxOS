    function updateTime() {
        var currentTime = new Date().toLocaleString();
        var timeText = document.querySelector("#timeElement");
        timeText.innerHTML = currentTime;
    }
    setInterval(updateTime, 1000);

    // Make all window elements draggable by their headers.
document.querySelectorAll('.window').forEach((win) => {
  dragElement(win);
});

// Step 1: Define a function called `dragElement` that makes an HTML element draggable.
function dragElement(element) {
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;

  if (document.getElementById(element.id + 'header')) {
    document.getElementById(element.id + 'header').onmousedown = startDragging;
  } else {
    element.onmousedown = startDragging;
  }

  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();
    initialX = e.clientX;
    initialY = e.clientY;
    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
  }

  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    currentX = initialX - e.clientX;
    currentY = initialY - e.clientY;
    initialX = e.clientX;
    initialY = e.clientY;
    element.style.top = (element.offsetTop - currentY) + 'px';
    element.style.left = (element.offsetLeft - currentX) + 'px';
  }

  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

var welcomeScreen = document.querySelector('#welcome');
function closeWindow(element) {
  element.classList.add('hidden');
}
function openWindow(element) {
  element.classList.remove('hidden');
  element.style.display = 'block';
  element.style.top = '50vh';
  element.style.left = '50vw';
  element.style.transform = 'translate(-50%, -50%)';
}

var welcomeScreenOpen = document.querySelector('#welcomeopen');
var dockButtons = document.querySelectorAll('.dockicon');
var closeButtons = document.querySelectorAll('.windowclose');
var appCards = document.querySelectorAll('.app-card');
var fileListContainer = document.querySelector('.file-list');
var previewWindow = document.querySelector('#filePreview');
var previewTitle = document.querySelector('#previewFileName');
var previewType = document.querySelector('#previewFileType');
var previewContent = document.querySelector('#previewFileContent');
var previewImage = document.querySelector('#previewFileImage');
var previewFrame = document.querySelector('#previewFileFrame');
var previewPlaceholder = document.querySelector('#previewPlaceholder');
var calcDisplay = document.querySelector('#calcDisplay');
var calcButtons = document.querySelectorAll('.calc-button');
var browserUrlInput = document.querySelector('#browserUrl');
var browserGoButton = document.querySelector('#browserGo');
var browserFrame = document.querySelector('#browserFrame');
var notesText = document.querySelector('#notesText');
var saveNotesButton = document.querySelector('#saveNotes');

var glassToggle = document.querySelector('#glassToggle');
var glowToggle = document.querySelector('#glowToggle');
var darkToggle = document.querySelector('#darkToggle');
var body = document.body;
var desktopGlow = document.querySelector('.desktop-glow');

var fileSystem = {
  notes: {
    name: 'Notes.txt',
    type: 'Text Document',
    content: 'Meeting notes:\n- Discuss roadmap\n- Assign tasks\n\nRemember to push changes.'
  },
  photos: {
    name: 'Photos.png',
    type: 'image/svg+xml',
    content: 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22200%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Crect%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%2369c0ff%22/%3E%3Ccircle%20cx%3D%22100%22%20cy%3D%22100%22%20r%3D%2270%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E'
  },
  resume: {
    name: 'Resume.pdf',
    type: 'PDF Document',
    content: '[Binary file — preview not available]'
  },
  projectplan: {
    name: 'ProjectPlan.md',
    type: 'Markdown Document',
    content: '# Project Plan\n\n- Goal: Build BraxOS\n- Milestones:\n  - MVP\n  - Apps\n'
  },
  budget: {
    name: 'Budget.xlsx',
    type: 'Spreadsheet',
    content: 'Quarter,Amount\nQ1,10000\nQ2,12000'
  }
};

var calcCurrent = '0';
var notesStorageKey = 'braxos-notes';
var filesStorageKey = 'braxos-files';
var currentPreviewFileId = null;

function loadFileSystem() {
  try {
    var saved = localStorage.getItem(filesStorageKey);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        fileSystem = parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load file system:', e);
  }
}

function saveFileSystem() {
  try {
    localStorage.setItem(filesStorageKey, JSON.stringify(fileSystem));
  } catch (e) {
    console.warn('Failed to save file system:', e);
  }
}

function renderFileList() {
  if (!fileListContainer) return;
  fileListContainer.innerHTML = '';
  Object.keys(fileSystem).forEach(function(id) {
    var file = fileSystem[id];
    var div = document.createElement('div');
    div.className = 'file-row';
    div.dataset.fileid = id;
    div.textContent = file.name || id;
    div.addEventListener('click', function() {
      openFilePreview(this.dataset.fileid);
    });
    fileListContainer.appendChild(div);
  });
}


function handleCalcClick() {
  var value = this.dataset.value;

  if (value === 'clear') {
    calcCurrent = '0';
  } else if (value === '=') {
    try {
      calcCurrent = String(eval(calcCurrent));
    } catch (error) {
      calcCurrent = 'Error';
    }
  } else {
    if (calcCurrent === '0' && value !== '.') {
      calcCurrent = value;
    } else if (calcCurrent === 'Error') {
      calcCurrent = value;
    } else {
      calcCurrent += value;
    }
  }

  calcDisplay.textContent = calcCurrent;
}

function isTextFile(file) {
  if (!file || !file.type) return false;
  return file.type.indexOf('text/') === 0 || file.name.match(/\.(txt|md|json|csv|js|html|css|xml)$/i);
}

function isImageFile(file) {
  return file && file.type && file.type.indexOf('image/') === 0;
}

function isPdfFile(file) {
  return file && file.type && file.type.indexOf('pdf') !== -1;
}

function previewFileElements(options) {
  if (previewImage) previewImage.classList.toggle('hidden', !options.image);
  if (previewFrame) previewFrame.classList.toggle('hidden', !options.frame);
  if (previewContent) previewContent.classList.toggle('hidden', !options.text);
  if (previewPlaceholder) previewPlaceholder.classList.toggle('hidden', !options.placeholder);
}

function openFilePreview(fileId) {
  var file = fileSystem[fileId];
  if (!file) return;

  currentPreviewFileId = fileId;
  previewTitle.textContent = file.name;
  previewType.textContent = file.type;
  previewFrame.src = '';

  if (isImageFile(file) && previewImage) {
    previewImage.src = file.content;
    previewImage.alt = file.name;
    previewFileElements({ image: true, frame: false, text: false, placeholder: false });
  } else if (isPdfFile(file) && previewFrame) {
    previewFrame.src = file.content;
    previewFileElements({ image: false, frame: true, text: false, placeholder: false });
  } else if (isTextFile(file) && previewContent) {
    previewContent.value = file.content || '';
    previewFileElements({ image: false, frame: false, text: true, placeholder: false });
  } else if (file.content && file.content.startsWith('data:')) {
    if (file.content.indexOf('image/') !== -1 && previewImage) {
      previewImage.src = file.content;
      previewImage.alt = file.name;
      previewFileElements({ image: true, frame: false, text: false, placeholder: false });
    } else if (file.content.indexOf('application/pdf') !== -1 && previewFrame) {
      previewFrame.src = file.content;
      previewFileElements({ image: false, frame: true, text: false, placeholder: false });
    } else {
      previewFileElements({ image: false, frame: false, text: false, placeholder: true });
    }
  } else if (previewContent) {
    previewContent.value = file.content || '';
    previewFileElements({ image: false, frame: false, text: true, placeholder: false });
  } else {
    previewFileElements({ image: false, frame: false, text: false, placeholder: true });
  }

  openWindow(previewWindow);
}

function normalizeUrl(value) {
  var trimmed = value.trim();
  if (!trimmed) {
    return 'about:blank';
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    return 'https://' + trimmed;
  }
  return trimmed;
}

function setBrowserUrl(value) {
  var url = normalizeUrl(value);
  browserUrlInput.value = url;
  browserFrame.src = url;
}

function saveNotes() {
  if (!notesText) return;
  localStorage.setItem(notesStorageKey, notesText.value);
  saveNotesButton.textContent = 'Saved';
  setTimeout(function() {
    saveNotesButton.textContent = 'Save Notes';
  }, 2000);
}

function loadNotes() {
  if (!notesText) return;
  notesText.value = localStorage.getItem(notesStorageKey) || '';
}

function applySettings() {
  if (glassToggle.checked) {
    body.classList.remove('no-glass');
  } else {
    body.classList.add('no-glass');
  }

  if (glowToggle.checked) {
    body.classList.remove('no-glow');
  } else {
    body.classList.add('no-glow');
  }

  if (darkToggle.checked) {
    body.classList.add('dark-mode');
  } else {
    body.classList.remove('dark-mode');
  }
}

glassToggle.addEventListener('change', applySettings);
glowToggle.addEventListener('change', applySettings);
darkToggle.addEventListener('change', applySettings);

welcomeScreenOpen.addEventListener('click', function() {
  openWindow(welcomeScreen);
});

dockButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    var targetId = button.dataset.target;
    var targetWindow = document.getElementById(targetId);
    if (targetWindow) {
      openWindow(targetWindow);
    }
  });
});

appCards.forEach(function(card) {
  card.addEventListener('click', function() {
    var targetId = card.dataset.target;
    if (targetId) {
      var targetWindow = document.getElementById(targetId);
      if (targetWindow) {
        openWindow(targetWindow);
      }
    }
  });
});

if (browserGoButton) {
  browserGoButton.addEventListener('click', function() {
    setBrowserUrl(browserUrlInput.value);
  });
}

if (browserUrlInput) {
  browserUrlInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      setBrowserUrl(browserUrlInput.value);
    }
  });
}

if (saveNotesButton) {
  saveNotesButton.addEventListener('click', saveNotes);
}

if (notesText) {
  notesText.addEventListener('input', function() {
    localStorage.setItem(notesStorageKey, notesText.value);
  });
}

loadNotes();

// Initialize persistent file system and render
loadFileSystem();
renderFileList();

var newFileBtn = document.getElementById('newFile');
var uploadFileBtn = document.getElementById('uploadFile');
var uploadInput = document.getElementById('uploadInput');
var previewSaveBtn = document.getElementById('previewSave');
var previewRenameBtn = document.getElementById('previewRename');
var previewDeleteBtn = document.getElementById('previewDelete');
var previewDownloadBtn = document.getElementById('previewDownload');

function slugifyName(name) {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_\-.]/g, '');
}

if (newFileBtn) {
  newFileBtn.addEventListener('click', function() {
    var name = prompt('New file name', 'untitled.txt');
    if (!name) return;
    var id = slugifyName(name);
    if (!id) id = 'file_' + Date.now();
    var baseId = id;
    var i = 1;
    while (fileSystem[id]) {
      id = baseId + '_' + i;
      i++;
    }
    fileSystem[id] = { name: name, type: 'Text Document', content: '' };
    saveFileSystem();
    renderFileList();
    openFilePreview(id);
  });
}

if (uploadFileBtn && uploadInput) {
  uploadFileBtn.addEventListener('click', function() { uploadInput.click(); });
  uploadInput.addEventListener('change', function(e) {
    var f = this.files && this.files[0];
    if (!f) return;
    var name = f.name;
    var id = slugifyName(name) || ('file_' + Date.now());
    var baseId = id;
    var idx = 1;
    while (fileSystem[id]) {
      id = baseId + '_' + idx;
      idx++;
    }
    var type = f.type || 'File';
    var reader = new FileReader();
    reader.onload = function(ev) {
      var result = ev.target.result;
      if (type.indexOf('image/') === 0 || type.indexOf('pdf') !== -1) {
      fileSystem[id] = { name: name, type: type, content: result };
    } else if (type.indexOf('text') === 0 || name.match(/\.(txt|md|json|csv|js|html|css|xml)$/i)) {
      fileSystem[id] = { name: name, type: type, content: result };
    } else {
      fileSystem[id] = { name: name, type: type || 'Binary', content: '[Binary file — preview not available]' };
    }
      saveFileSystem();
      renderFileList();
      openFilePreview(id);
      uploadInput.value = '';
    };
    if (type.indexOf('image/') === 0 || type.indexOf('pdf') !== -1) {
      reader.readAsDataURL(f);
    } else {
      reader.readAsText(f);
    }
  });
}

if (previewSaveBtn) {
  previewSaveBtn.addEventListener('click', function() {
    if (!currentPreviewFileId) return;
    var file = fileSystem[currentPreviewFileId];
    if (!file) return;
    if (file.type && file.type.indexOf('image/') === 0) {
      alert('Image files cannot be edited as text here. Use the upload button to replace them.');
      return;
    }
    var txt = previewContent.value;
    file.content = txt;
    saveFileSystem();
    renderFileList();
    alert('Saved.');
  });
}

if (previewRenameBtn) {
  previewRenameBtn.addEventListener('click', function() {
    if (!currentPreviewFileId) return;
    var newName = prompt('Rename file to', fileSystem[currentPreviewFileId].name || '');
    if (!newName) return;
    fileSystem[currentPreviewFileId].name = newName;
    saveFileSystem();
    renderFileList();
    previewTitle.textContent = newName;
  });
}

if (previewDeleteBtn) {
  previewDeleteBtn.addEventListener('click', function() {
    if (!currentPreviewFileId) return;
    if (!confirm('Delete "' + (fileSystem[currentPreviewFileId].name || currentPreviewFileId) + '"?')) return;
    delete fileSystem[currentPreviewFileId];
    saveFileSystem();
    renderFileList();
    closeWindow(previewWindow);
    currentPreviewFileId = null;
  });
}

if (previewDownloadBtn) {
  previewDownloadBtn.addEventListener('click', function() {
    if (!currentPreviewFileId) return;
    var file = fileSystem[currentPreviewFileId];
    if (!file) return;
    var content = file.content || '';
    var a = document.createElement('a');
    if (content.startsWith('data:')) {
      a.href = content;
    } else {
      var type = file.type && file.type.indexOf('text') === 0 ? file.type : 'text/plain';
      var blob = new Blob([content], { type: type });
      a.href = URL.createObjectURL(blob);
    }
    a.download = file.name || 'download.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (!content.startsWith('data:')) {
      URL.revokeObjectURL(a.href);
    }
  });
}

calcButtons.forEach(function(button) {
  button.addEventListener('click', handleCalcClick);
});

closeButtons.forEach(function(button) {
  button.addEventListener('click', function() {
    var parentWindow = button.closest('.window');
    if (parentWindow) {
      closeWindow(parentWindow);
    }
  });
});

// Click sound using Web Audio API: short per-click pop, skipped for text inputs.
var _braxosAudioCtx = null;
function playClickSound() {
  try {
    if (!_braxosAudioCtx) _braxosAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var ctx = _braxosAudioCtx;
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    var f = ctx.createBiquadFilter();
    o.type = 'sine';
    o.frequency.value = 600;
    f.type = 'lowpass';
    f.frequency.value = 2500;
    o.connect(g);
    g.connect(f);
    f.connect(ctx.destination);
    var now = ctx.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.06, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    o.start(now);
    o.stop(now + 0.2);
  } catch (e) {
    // ignore audio errors on unsupported browsers
  }
}

document.addEventListener('click', function(e) {
  // only primary (left) clicks
  if (e.button && e.button !== 0) return;
  var t = e.target;
  var tag = (t.tagName || '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  if (t.isContentEditable) return;
  playClickSound();
}, true);

applySettings();
