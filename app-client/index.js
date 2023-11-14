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
  const TASK_CONTAINER = document.getElementById('task-container')
  TASK_CONTAINER.innerHTML = ''
  tasks.forEach((task) => {
    TASK_CONTAINER.innerHTML += `<li>
    <h3>${task.title}</h3>
    <p>${task.description}</p>
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
      completed: 'false',
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      printTasks(data)
    })
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
})
