let taskInput = document.getElementById("task-input");
let taskList = document.getElementById("task-list");
let addTaskButton = document.getElementById("add-task-button");

let tasks = [];

function renderTasks() {
    taskList.innerHTML = ''; // Clear the existing list
    tasks.forEach((task, index) => {
        let taskItem = document.createElement("li");
        taskItem.textContent = task;
        taskList.appendChild(taskItem);
        
        let deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add('delete');
        taskItem.appendChild(deleteButton);

        deleteButton.addEventListener("click" , () => {
            deleteTask(index);
        });
    });
}

renderTasks()

function deleteTask(index) {
    tasks.splice(index, 1);
    renderTasks();
}

function addTask() {
    let task = taskInput.value.trim();

    if (task === "") {
        alert("Fill !");
    } else {
        tasks.push(task);
        renderTasks();
        taskInput.value = "";
    }
}

addTaskButton.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (e) => {
    if (e.key === "enter") {
        addTask();
    }
});
