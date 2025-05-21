document.addEventListener("DOMContentLoaded", () => {
    // ========== PESTANYES ==========
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
  
    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        tabContents.forEach(c => c.style.display = "none");
        const targetTab = document.getElementById(btn.dataset.tab);
        if (targetTab) targetTab.style.display = "block";
      });
    });
  
    if (tabButtons.length) tabButtons[0].click(); // Activa la primera pestanya
  
    // ========== NOTES ==========
    const notesInput = document.getElementById("notesInput");
    const saveNote = document.getElementById("saveNote");
    const savedNotes = document.getElementById("savedNotes");
  
    if (notesInput && saveNote && savedNotes) {
      chrome.storage.local.get("notes", (data) => {
        if (data.notes) {
          notesInput.value = data.notes;
          savedNotes.textContent = "✅ Nota carregada";
        }
      });
  
      saveNote.addEventListener("click", () => {
        chrome.storage.local.set({ notes: notesInput.value }, () => {
          savedNotes.textContent = "💾 Nota desada!";
        });
      });
    }
    const notesList = document.getElementById("notesList");
const newNoteBtn = document.getElementById("newNoteBtn");
const noteTitleInput = document.getElementById("noteTitleInput");
const noteContentInput = document.getElementById("noteContentInput");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const deleteNoteBtn = document.getElementById("deleteNoteBtn");
const savedNotesMsg = document.getElementById("savedNotesMsg");

let notesData = {};  // Objecte amb totes les notes { id: {title, content} }
let currentNoteId = null;

// Carregar notes desades al iniciar
function loadNotes() {
  chrome.storage.local.get(["notesData"], data => {
    notesData = data.notesData || {};
    renderNotesList();
    clearNoteEditor();
  });
}

// Mostrar la llista de notes
function renderNotesList() {
  notesList.innerHTML = "";
  for (const id in notesData) {
    const li = document.createElement("li");
    li.textContent = notesData[id].title || "(Sense títol)";
    li.style.cursor = "pointer";
    li.addEventListener("click", () => openNote(id));
    notesList.appendChild(li);
  }
}

// Obre una nota per editar
function openNote(id) {
  currentNoteId = id;
  noteTitleInput.value = notesData[id].title;
  noteContentInput.value = notesData[id].content;
  savedNotesMsg.textContent = "";
}

// Neteja l'editor per crear una nota nova
function clearNoteEditor() {
  currentNoteId = null;
  noteTitleInput.value = "";
  noteContentInput.value = "";
  savedNotesMsg.textContent = "";
}

// Crea una nova nota (botó)
newNoteBtn.addEventListener("click", () => {
  clearNoteEditor();
});

// Desa la nota actual
saveNoteBtn.addEventListener("click", () => {
  const title = noteTitleInput.value.trim();
  const content = noteContentInput.value.trim();

  if (!title) {
    alert("El títol de la nota és obligatori!");
    return;
  }

  if (currentNoteId === null) {
    // Nova nota: generem un id únic (timestamp)
    currentNoteId = "note_" + Date.now();
  }

  notesData[currentNoteId] = { title, content };
  chrome.storage.local.set({ notesData }, () => {
    savedNotesMsg.textContent = "💾 Nota desada!";
    renderNotesList();
  });
});

// Elimina la nota actual
deleteNoteBtn.addEventListener("click", () => {
  if (currentNoteId && notesData[currentNoteId]) {
    if (confirm(`Segur que vols eliminar la nota "${notesData[currentNoteId].title}"?`)) {
      delete notesData[currentNoteId];
      chrome.storage.local.set({ notesData }, () => {
        savedNotesMsg.textContent = "🗑️ Nota eliminada";
        clearNoteEditor();
        renderNotesList();
      });
    }
  } else {
    alert("Cap nota seleccionada per eliminar.");
  }
});

// Inicialitzar
loadNotes();
  
    // ========== TASQUES ==========
    const taskInput = document.getElementById("taskInput");
    const addTask = document.getElementById("addTask");
    const taskList = document.getElementById("taskList");
    const taskDeadline = document.getElementById("taskDeadline");
  
    function renderTasks(tasks) {
      if (!taskList) return;
      taskList.innerHTML = "";
      tasks.forEach((task, i) => {
        const li = document.createElement("li");
        const deadlineText = task.deadline
          ? ` ⏳ (${getDaysLeft(task.deadline)} dies restants)`
          : "";
        li.textContent = `${task.text}${deadlineText}`;
  
        const delBtn = document.createElement("button");
        delBtn.textContent = "❌";
        delBtn.addEventListener("click", () => {
          tasks.splice(i, 1);
          chrome.storage.local.set({ tasks });
          renderTasks(tasks);
        });
  
        li.appendChild(delBtn);
        taskList.appendChild(li);
      });
    }
  
    function getDaysLeft(dateString) {
      const today = new Date();
      const deadline = new Date(dateString);
      const diffTime = deadline - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  
    if (addTask && taskInput && taskDeadline) {
      addTask.addEventListener("click", () => {
        chrome.storage.local.get("tasks", (data) => {
          const tasks = data.tasks || [];
          const taskText = taskInput.value.trim();
          const deadline = taskDeadline.value;
          if (taskText) {
            tasks.push({ text: taskText, deadline });
            chrome.storage.local.set({ tasks });
            renderTasks(tasks);
            taskInput.value = "";
            taskDeadline.value = "";
          }
        });
      });
    }
  
    chrome.storage.local.get("tasks", (data) => {
      if (data.tasks) renderTasks(data.tasks);
    });
  
    // ========== CALENDARI ==========
const calendarGrid = document.getElementById("calendarGrid");
const dayNote = document.getElementById("dayNote");
const dayNoteText = document.getElementById("dayNoteText");
const selectedDateTitle = document.getElementById("selectedDateTitle");
const saveDayNote = document.getElementById("saveDayNote");
const savedDayNoteMsg = document.getElementById("savedDayNoteMsg");

// Afegim controls (hauries de tenir aquests botons al popup.html)
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");
const monthYearTitle = document.getElementById("monthYearTitle");

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

function generateCalendar(year, month) {
    if (!calendarGrid) return;
  
    chrome.storage.local.get(["dayNotes"], data => {
      const notes = data.dayNotes || {};
  
      calendarGrid.innerHTML = "";
  
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
  
      let emptyDays = firstDay.getDay(); // Comença diumenge (0)
  
      for (let i = 0; i < emptyDays; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "calendar-day empty";
        calendarGrid.appendChild(emptyDiv);
      }
  
      for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "calendar-day";
  
        const key = `${year}-${month + 1}-${day}`; // clau per a la nota
  
        if (notes[key]) {
          dayDiv.classList.add("has-note");  // marca el dia amb nota
        }
  
        dayDiv.textContent = day;
        dayDiv.addEventListener("click", () => selectDay(year, month, day));
        calendarGrid.appendChild(dayDiv);
      }
    });
  }

function updateMonthYearTitle() {
  const monthNames = [
    "Gener", "Febrer", "Març", "Abril", "Maig", "Juny",
    "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"
  ];
  if (monthYearTitle) {
    monthYearTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }
}

function selectDay(year, month, day) {
  if (!selectedDateTitle || !dayNoteText || !dayNote || !savedDayNoteMsg) return;

  const key = `${year}-${month + 1}-${day}`;
  selectedDateTitle.textContent = `Nota per al ${key}`;

  chrome.storage.local.get(["dayNotes"], data => {
    const notes = data.dayNotes || {};
    dayNoteText.value = notes[key] || "";
    dayNote.style.display = "block";
    savedDayNoteMsg.textContent = "";
  });
}

if (saveDayNote && selectedDateTitle && dayNoteText && savedDayNoteMsg) {
  saveDayNote.addEventListener("click", () => {
    const key = selectedDateTitle.textContent.split(" ").pop();
    const value = dayNoteText.value;
    chrome.storage.local.get(["dayNotes"], data => {
      const notes = data.dayNotes || {};
      notes[key] = value;
      chrome.storage.local.set({ dayNotes: notes }, () => {
        savedDayNoteMsg.textContent = "💾 Nota guardada!";
      });
    });
  });
}

if (prevMonthBtn && nextMonthBtn) {
  prevMonthBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateMonthYearTitle();
    generateCalendar(currentYear, currentMonth);
    dayNote.style.display = "none"; // oculta la nota al canviar de mes
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateMonthYearTitle();
    generateCalendar(currentYear, currentMonth);
    dayNote.style.display = "none"; // oculta la nota al canviar de mes
  });
}

// Inicialitzem calendari i títol
updateMonthYearTitle();
generateCalendar(currentYear, currentMonth);
  
    // ========== EXPORTACIÓ ==========
    const exportDataBtn = document.getElementById("exportData");
    if (exportDataBtn) {
      exportDataBtn.addEventListener("click", () => {
        chrome.storage.local.get(null, (data) => {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "miniagenda_dades.json";
          a.click();
          URL.revokeObjectURL(url);
        });
      });
    }
  
    // ========== IMPORTACIÓ ==========
    const importDataInput = document.getElementById("importData");
    if (importDataInput) {
      importDataInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
  
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            chrome.storage.local.set(importedData, () => {
              alert("Dades importades correctament!");
              location.reload();
            });
          } catch (error) {
            alert("Fitxer invàlid.");
          }
        };
        reader.readAsText(file);
      });
    }
  });
  