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
var fileRows = document.querySelectorAll('.file-row');
var previewWindow = document.querySelector('#filePreview');
var previewTitle = document.querySelector('#previewFileName');
var previewType = document.querySelector('#previewFileType');
var previewContent = document.querySelector('#previewFileContent');
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
  documents: {
    name: 'Documents.txt',
    type: 'Text Document',
    content: 'This is your document.\n\nBraxOS file system simulation is working properly!'
  },
  photos: {
    name: 'Photos.png',
    type: 'Image File',
    content: '[Image preview is not supported in this demo]'
  },
  projects: {
    name: 'Projects.zip',
    type: 'Archive File',
    content: 'Archive contents:\n- project1/\n- project2/\n- readme.md'
  }
};

var calcCurrent = '0';
var notesStorageKey = 'braxos-notes';


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

function openFilePreview(fileId) {
  var file = fileSystem[fileId];
  if (!file) return;

  previewTitle.textContent = file.name;
  previewType.textContent = file.type;
  previewContent.textContent = file.content;
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

fileRows.forEach(function(row) {
  row.addEventListener('click', function() {
    var fileId = row.dataset.fileid;
    if (fileId) {
      openFilePreview(fileId);
    }
  });
});

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

applySettings();
