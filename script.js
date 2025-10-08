document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const searchInput = document.getElementById('search-input'); // Novo: Campo de Busca
    const taskList = document.getElementById('task-list');

    // --- FUNÇÕES DE ARMAZENAMENTO NO LOCAL STORAGE ---

    const getTasks = () => {
        const tasks = localStorage.getItem('tasks');
        return tasks ? JSON.parse(tasks) : [];
    };

    const saveTasks = (tasks) => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // --- FUNÇÕES DE RENDERIZAÇÃO E EVENTOS ---

    // Cria o elemento HTML de uma tarefa, AGORA com botão de EDITAR
    const createTaskElement = (task) => {
        const listItem = document.createElement('li');
        listItem.classList.add('task-item');
        if (task.completed) {
            listItem.classList.add('completed');
        }
        
        listItem.innerHTML = `
            <span class="task-text" data-id="${task.id}">${task.text}</span>
            <div class="action-btns">
                <button class="complete-btn" data-id="${task.id}" title="Marcar/Desmarcar">
                    ${task.completed ? '✅' : '☑️'}
                </button>
                
                <button class="edit-btn" data-id="${task.id}" title="Editar Tarefa">
                    ✏️
                </button>
                
                <button class="delete-btn" data-id="${task.id}" title="Excluir">
                    🗑️
                </button>
            </div>
        `;

        return listItem;
    };

    // Renderiza a lista completa ou filtrada na tela
    const renderTasks = (filterText = '') => {
        taskList.innerHTML = '';
        let tasks = getTasks();
        
        // Aplica o filtro se houver texto
        if (filterText) {
            const lowerCaseFilter = filterText.toLowerCase();
            tasks = tasks.filter(task => 
                task.text.toLowerCase().includes(lowerCaseFilter)
            );
        }

        tasks.forEach(task => {
            taskList.appendChild(createTaskElement(task));
        });
    };

    // --- LÓGICA DE EDIÇÃO ---
    const handleEdit = (taskId, textElement) => {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex === -1) return;

        // 1. Cria o campo de edição (input)
        const currentText = textElement.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input'; // Classe para estilização opcional

        // 2. Substitui o <span> pelo <input>
        textElement.replaceWith(input);
        input.focus();
        
        // 3. Função para salvar a edição
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                tasks[taskIndex].text = newText;
                saveTasks(tasks);
            }
            renderTasks(searchInput.value); // Re-renderiza para mostrar o novo texto
        };

        // Salva ao pressionar Enter
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            }
        });

        // Salva ao perder o foco (clicar fora)
        input.addEventListener('blur', saveEdit);
    };


    // --- EVENT LISTENERS ---

    // 1. Adicionar Tarefa
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();

        if (text) {
            const tasks = getTasks();
            const newTask = {
                id: Date.now(),
                text: text,
                completed: false
            };
            
            tasks.push(newTask);
            saveTasks(tasks);
            taskInput.value = '';
            renderTasks(searchInput.value); // Renderiza, mantendo o filtro se houver
        }
    });

    // 2. Ações na Lista (Excluir, Concluir, Editar)
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const taskId = parseInt(target.getAttribute('data-id'));

        if (target.classList.contains('delete-btn')) {
            let tasks = getTasks().filter(task => task.id !== taskId);
            saveTasks(tasks);
            renderTasks(searchInput.value);
            
        } else if (target.classList.contains('complete-btn')) {
            const tasks = getTasks().map(task => 
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );
            saveTasks(tasks);
            renderTasks(searchInput.value);
            
        } else if (target.classList.contains('edit-btn')) {
            // Ação de Editar
            const listItem = target.closest('.task-item');
            const taskTextElement = listItem.querySelector('.task-text');
            
            handleEdit(taskId, taskTextElement);
        }
    });
    
    // 3. Busca/Filtro de Tarefa
    searchInput.addEventListener('input', (e) => {
        const filterText = e.target.value.trim();
        renderTasks(filterText);
    });


    // Carrega as tarefas salvas quando a página carrega
    renderTasks();
});