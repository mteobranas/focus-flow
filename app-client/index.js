document.getElementById('tasks').addEventListener('submit', (e) => {
  e.preventDefault()
  const email = localStorage.getItem('email')
  const token = localStorage.getItem('token')

  fetch('http://localhost:3000/tasks', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': token,
      'email': email,
    },
  })
})
