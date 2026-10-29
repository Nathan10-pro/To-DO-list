const STORAGE_KEY = "ruangrencana-tasks";

const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const clearCompletedButton = document.getElementById("clear-completed");
const statusMessage = document.getElementById("status-message");
const filterButtons = document.querySelectorAll(".filter-button");

let activeFilter = "all";
let tasks = loadTasks();

function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);
        if (!savedTasks) return [];

        const parsedTasks = JSON.parse(savedTasks);
        if (!Array.isArray(parsedTasks)) {
            throw new TypeError("Data tugas tersimpan bukan daftar yang valid.");
        }

        return parsedTasks.filter((task) =>
            task
            && typeof task.id === "string"
            && typeof task.text === "string"
            && typeof task.completed === "boolean"
        );
    } catch (error) {
        console.error("Tugas tersimpan tidak dapat dibaca:", error);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        statusMessage.textContent = "";
    } catch (error) {
        console.error("Tugas tidak dapat disimpan:", error);
        statusMessage.textContent = "Tugas belum tersimpan di perangkat ini. Coba periksa pengaturan penyimpanan browser.";
    }
}

function getVisibleTasks() {
    if (activeFilter === "active") return tasks.filter((task) => !task.completed);
    if (activeFilter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
}

function createTaskItem(task) {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.className = "task-checkbox";
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.id = `task-${task.id}`;
    checkbox.setAttribute("aria-label", `Tandai "${task.text}" sebagai ${task.completed ? "belum selesai" : "selesai"}`);
    checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        saveTasks();
        renderTasks();
    });

    const label = document.createElement("label");
    label.className = "task-text";
    label.htmlFor = checkbox.id;
    label.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.setAttribute("aria-label", `Hapus tugas: ${task.text}`);
    deleteButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M10 11v6m4-6v6M5.5 7l1 13h11l1-13M9 7V4h6v3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    deleteButton.addEventListener("click", () => {
        tasks = tasks.filter((savedTask) => savedTask.id !== task.id);
        saveTasks();
        renderTasks();
    });

    item.append(checkbox, label, deleteButton);
    return item;
}

function renderTasks() {
    const visibleTasks = getVisibleTasks();
    taskList.replaceChildren();

    if (visibleTasks.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-state";

        const emptyIcon = document.createElement("span");
        emptyIcon.className = "empty-icon";
        emptyIcon.setAttribute("aria-hidden", "true");
        emptyIcon.textContent = activeFilter === "completed" ? "✦" : "☀";

        const emptyTitle = document.createElement("strong");
        emptyTitle.textContent = activeFilter === "completed"
            ? "Belum ada yang selesai"
            : activeFilter === "active"
                ? "Semua tugas sudah beres!"
                : "Daftarmu masih kosong";

        const emptyCopy = document.createElement("span");
        emptyCopy.textContent = activeFilter === "completed"
            ? "Tugas yang kamu selesaikan akan muncul di sini."
            : activeFilter === "active"
                ? "Nikmati waktu luangmu atau tambahkan tugas baru."
                : "Tambahkan satu tugas kecil untuk memulai harimu.";

        emptyItem.append(emptyIcon, emptyTitle, emptyCopy);
        taskList.append(emptyItem);
    } else {
        visibleTasks.forEach((task) => taskList.append(createTaskItem(task)));
    }

    const completedCount = tasks.filter((task) => task.completed).length;
    const totalCount = tasks.length;
    const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    document.getElementById("total-count").textContent = totalCount;
    document.getElementById("completed-count").textContent = completedCount;
    document.getElementById("progress-percent").textContent = `${progress}%`;
    document.getElementById("progress-fill").style.width = `${progress}%`;
    document.getElementById("progress-track").setAttribute("aria-valuenow", progress);
    document.getElementById("progress-message").textContent = totalCount === 0
        ? "Mulai dari satu langkah kecil."
        : progress === 100
            ? "Semua selesai, keren banget!"
            : `${totalCount - completedCount} tugas lagi. Kamu pasti bisa!`;
    document.getElementById("task-count").textContent = `${visibleTasks.length} tugas`;
    clearCompletedButton.hidden = completedCount === 0;
}

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = taskInput.value.trim();
    if (!text) {
        taskInput.focus();
        return;
    }

    tasks.unshift({
        id: typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        text,
        completed: false
    });
    activeFilter = "all";
    filterButtons.forEach((button) => {
        const isActive = button.dataset.filter === activeFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    saveTasks();
    renderTasks();
    taskForm.reset();
    taskInput.focus();
});

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        filterButtons.forEach((filterButton) => {
            const isActive = filterButton === button;
            filterButton.classList.toggle("is-active", isActive);
            filterButton.setAttribute("aria-pressed", String(isActive));
        });
        renderTasks();
    });
});

clearCompletedButton.addEventListener("click", () => {
    tasks = tasks.filter((task) => !task.completed);
    saveTasks();
    renderTasks();
});

document.getElementById("current-date").textContent = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
}).format(new Date());

renderTasks();
