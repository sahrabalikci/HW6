// Task management class
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.editingId = null;
        this.init();
    }

    init() {
        const form = document.getElementById('taskForm');
        form.addEventListener('submit', (e) => this.handleAddTask(e));
        
        // Set today's date as default for due date input
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskDueDate').value = today;
        
        this.render();
    }

    // Load tasks from LocalStorage
    loadTasks() {
        const stored = localStorage.getItem('todoTasks');
        return stored ? JSON.parse(stored) : [];
    }

    // Save tasks to LocalStorage
    saveTasks() {
        localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
    }

    // Handle form submission for adding new task
    handleAddTask(e) {
        e.preventDefault();
        
        const titleInput = document.getElementById('taskTitle');
        const dueDateInput = document.getElementById('taskDueDate');
        
        const title = titleInput.value.trim();
        const dueDate = dueDateInput.value;
        
        if (!title) {
            alert('Please enter a task title');
            return;
        }
        
        const newTask = {
            id: Date.now().toString(),
            title: title,
            dueDate: dueDate,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(newTask);
        this.saveTasks();
        this.render();
        
        // Reset form
        titleInput.value = '';
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.value = today;
    }

    // Toggle task completion
    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // Delete a task
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
        }
    }

    // Start editing a task
    startEdit(id) {
        this.editingId = id;
        this.render();
    }

    // Cancel editing
    cancelEdit() {
        this.editingId = null;
        this.render();
    }

    // Save edited task
    saveEdit(id, newTitle, newDueDate) {
        const task = this.tasks.find(t => t.id === id);
        if (task && newTitle.trim()) {
            task.title = newTitle.trim();
            task.dueDate = newDueDate;
            this.saveTasks();
            this.editingId = null;
            this.render();
        }
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDate = new Date(date);
        taskDate.setHours(0, 0, 0, 0);
        
        const diffTime = taskDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return { text: `Overdue (${Math.abs(diffDays)} days ago)`, class: 'overdue' };
        } else if (diffDays === 0) {
            return { text: 'Due today', class: 'due-today' };
        } else if (diffDays === 1) {
            return { text: 'Due tomorrow', class: '' };
        } else {
            return { text: `Due in ${diffDays} days`, class: '' };
        }
    }

    // Create task element
    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const dateInfo = this.formatDate(task.dueDate);
        
        if (this.editingId === task.id) {
            // Edit mode
            taskDiv.innerHTML = `
                <div class="edit-form">
                    <input type="text" id="editTitle_${task.id}" value="${task.title}" placeholder="Task title">
                    <input type="date" id="editDueDate_${task.id}" value="${task.dueDate}">
                    <div class="edit-form-actions">
                        <button class="btn-save" onclick="app.saveEdit('${task.id}', document.getElementById('editTitle_${task.id}').value, document.getElementById('editDueDate_${task.id}').value)">Save</button>
                        <button class="btn-cancel" onclick="app.cancelEdit()">Cancel</button>
                    </div>
                </div>
            `;
        } else {
            // Display mode
            taskDiv.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                </div>
                <div class="task-due-date ${dateInfo.class}">
                    📅 ${dateInfo.text} (${new Date(task.dueDate).toLocaleDateString()})
                </div>
                <div class="task-actions">
                    ${task.completed 
                        ? `<button class="btn-action btn-undo" onclick="app.toggleComplete('${task.id}')">Undo</button>`
                        : `<button class="btn-action btn-complete" onclick="app.toggleComplete('${task.id}')">Complete</button>`
                    }
                    <button class="btn-action btn-edit" onclick="app.startEdit('${task.id}')">Edit</button>
                    <button class="btn-action btn-delete" onclick="app.deleteTask('${task.id}')">Delete</button>
                </div>
            `;
        }
        
        return taskDiv;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Render all tasks
    render() {
        const activeTasksContainer = document.getElementById('activeTasks');
        const completedTasksContainer = document.getElementById('completedTasks');
        const activeCount = document.getElementById('activeCount');
        const completedCount = document.getElementById('completedCount');
        
        // Clear containers
        activeTasksContainer.innerHTML = '';
        completedTasksContainer.innerHTML = '';
        
        // Separate active and completed tasks
        const activeTasks = this.tasks.filter(t => !t.completed);
        const completedTasks = this.tasks.filter(t => t.completed);
        
        // Update counts
        activeCount.textContent = activeTasks.length;
        completedCount.textContent = completedTasks.length;
        
        // Render active tasks
        if (activeTasks.length === 0) {
            activeTasksContainer.innerHTML = '<div class="empty-state">No active tasks. Add one above!</div>';
        } else {
            activeTasks.forEach(task => {
                activeTasksContainer.appendChild(this.createTaskElement(task));
            });
        }
        
        // Render completed tasks
        if (completedTasks.length === 0) {
            completedTasksContainer.innerHTML = '<div class="empty-state">No completed tasks yet.</div>';
        } else {
            completedTasks.forEach(task => {
                completedTasksContainer.appendChild(this.createTaskElement(task));
            });
        }
    }
}

// Initialize the app
const app = new TodoApp();

