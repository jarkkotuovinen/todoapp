const API_URL = "http://localhost:3000";

// Display current date
document.getElementById("currentDate").textContent =
  new Date().toLocaleDateString("fi-FI", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// Load tasks on page load
loadTasks();

// Add task event listeners
document.getElementById("addButton").addEventListener("click", addTask);
document.getElementById("taskInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") addTask();
});

async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}/tasks`);
    const tasks = await response.json();
    renderTasks(tasks);
  } catch (error) {
    console.error("Error loading tasks:", error);
  }
}

async function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();

  if (!text) return;

  try {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      input.value = "";
      loadTasks();
    }
  } catch (error) {
    console.error("Error adding task:", error);
  }
}

async function toggleTask(id) {
  try {
    await fetch(`${API_URL}/tasks/${id}/toggle`, {
      method: "PUT",
    });
    loadTasks();
  } catch (error) {
    console.error("Error toggling task:", error);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
    });
    loadTasks();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}

function renderTasks(tasks) {
  const taskList = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");

  if (tasks.length === 0) {
    taskList.style.display = "none";
    emptyState.style.display = "block";
    updateStats(0, 0, 0);
    return;
  }

  taskList.style.display = "block";
  emptyState.style.display = "none";

  taskList.innerHTML = tasks
    .map(
      (task) => `
        <li class="task-item ${task.completed ? "completed" : ""}">
            <div class="task-content">
                <input
                    type="checkbox"
                    ${task.completed ? "checked" : ""}
                    onchange="toggleTask(${task.id})"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${task.id})">Poista</button>
        </li>
    `,
    )
    .join("");

  const completed = tasks.filter((t) => t.completed).length;
  updateStats(tasks.length, completed, tasks.length - completed);
}

function updateStats(total, completed, pending) {
  document.getElementById("totalTasks").textContent = `Yhteensä: ${total}`;
  document.getElementById("completedTasks").textContent =
    `Valmiit: ${completed}`;
  document.getElementById("pendingTasks").textContent = `Kesken: ${pending}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
