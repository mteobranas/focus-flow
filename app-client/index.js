document.getElementById('tasks').addEventListener('submit', (e) => {
  e.preventDefault()
  createTask()
})

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
      printTasks(data)
    })
}

function printTasks(tasks) {
  const TASK_CONTAINER = document.getElementById('tasks_list')
  TASK_CONTAINER.innerHTML = ''
  tasks.forEach((task) => {
    TASK_CONTAINER.innerHTML += `<li>
    <h3>${task.title}</h3>
    <p>${task.description}</p>
    <label for="completed">Completed</label>
    <input type="checkbox" id="completed" name="completed" onchange="completeTask(this, ${task.id})">
    <button onclick="deleteTask(this, ${task.id})">Delete</button>
    </li>`
  })
}

function createTask() {
  const token = localStorage.getItem('token')
  const title = document.getElementById('title').value
  const description = document.getElementById('description').value

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
}

function completeTask(task, task_id) {
  const token = localStorage.getItem('token')
  const COMPLETED_TASKS = document.getElementById('completed_tasks')

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
      COMPLETED_TASKS.innerHTML = ''
      data.forEach((task) => {
        COMPLETED_TASKS.innerHTML += `<li>
      <h3>${task.title}</h3>
      <p>${task.description}</p>
      <button onclick="deleteTask(this, ${task.id})">Delete</button>
      </li>`
      })
    })

  if (task) {
    task.parentElement.remove()
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

  task.parentElement.remove()
}

document.addEventListener('DOMContentLoaded', () => {
  getUserTasks()
  completeTask()
})
