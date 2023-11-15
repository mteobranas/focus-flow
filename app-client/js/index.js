document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = 'login.html'
  }

  addTaskModal()
  getUserTasks()
  completeTask()

  var userDropdown = document.getElementById('userDropdown')
  var dropdownContent = document.getElementById('dropdownContent')

  userDropdown.addEventListener('click', function (event) {
    event.stopPropagation() // Evita que el clic se propague al listener global de clic
    dropdownContent.classList.toggle('show')
  })

  window.addEventListener('click', function () {
    // Cierra el dropdown si se hace clic fuera de él
    if (dropdownContent.classList.contains('show')) {
      dropdownContent.classList.remove('show')
    }
  })
})

document.getElementById('taskForm').addEventListener('submit', (e) => {
  e.preventDefault()
  createTask()
})

function logOut() {
  localStorage.removeItem('token')
  window.location.reload()
}

function getUserTasks() {
  const token = localStorage.getItem('token')

  fetch('http://localhost:3000/tasks', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      printUserInfo(data.user[0].firstName + ' ' + data.user[0].lastName)
      printTasks(data.tasks)
    })
}

function printUserInfo(user) {
  const userName = document.getElementById('userName')
  userName.innerHTML = user
}

function printTasks(tasks) {
  const task_container = document.getElementById('tasks-list')
  task_container.innerHTML = ''

  tasks.forEach((task) => {
    task_container.innerHTML += `
    <li class="task-item">
      <aside class="task-item-left">
        <input
          type="checkbox"
          name="completed"
          id="completed"
          class="task-checkbox"
          onchange="completeTask(this, ${task.id})"
        />
        <span class="task-name">${task.title}</span>
      </aside>
      <div class="task-item-righ">
        <span class="due-date">Due date</span>
        <button class="delete-task-btn" onclick="deleteTask(this, ${task.id})">&times;</button>
      </div>
    </li>
    `
  })
}

function createTask() {
  const token = localStorage.getItem('token')
  const title = document.getElementById('taskTitle').value
  const description = document.getElementById('taskDescription').value

  fetch('http://localhost:3000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
    body: JSON.stringify({
      title: title,
      description: description,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      printTasks(data)
    })

  let modal = document.getElementById('addTaskModal')
  modal.style.display = 'none'
}

function completeTask(task, task_id) {
  const token = localStorage.getItem('token')
  const completed_list = document.getElementById('completed-list')

  fetch('http://localhost:3000/tasks', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
    body: JSON.stringify({
      id: task_id,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      completed_list.innerHTML = ''
      data.forEach((task) => {
        completed_list.innerHTML += `
        <li class="task-item">
          <aside class="task-item-left">
            <span class="task-name">${task.title}</span>
          </aside>
          <div class="task-item-righ">
            <span class="due-date">Completed at</span>
            <button class="delete-task-btn" onclick="deleteTask(this, ${task.id})">&times;</button>
          </div>
        </li>
        `
      })
    })

  if (task) {
    task.parentElement.parentElement.remove()
  }
}

function deleteTask(task, task_id) {
  const token = localStorage.getItem('token')
  fetch('http://localhost:3000/tasks', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
    body: JSON.stringify({
      id: task_id,
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log(data.message))

  task.parentElement.parentElement.remove()
}

function addTaskModal() {
  let openModal = document.getElementById('addTaskBtn')
  let modal = document.getElementById('addTaskModal')
  let closeModal = document.getElementById('closeModal')

  openModal.addEventListener('click', () => {
    modal.style.display = 'flex'
  })

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none'
  })

  window.addEventListener('click', (e) => {
    if (e.target == modal) {
      modal.style.display = 'none'
    }
  })
}

function switchToTask() {
  let task = document.getElementById('id-app-main')
  let completed = document.getElementById('id-app-completed')
  task.classList.remove('hide')
  completed.classList.add('hide')
}

function switchToCompleted() {
  let task = document.getElementById('id-app-main')
  let completed = document.getElementById('id-app-completed')
  completed.classList.remove('hide')
  task.classList.add('hide')
}
