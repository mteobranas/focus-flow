function createUser() {
  const username = document.getElementById('username').value
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  if (!username || !email || !password) {
    console.log('Please fill in all fields')
    return
  } else {
    const user = {
      username: username,
      email: email,
      password: password,
    }
    return user
  }
}

document.getElementById('signup').addEventListener('submit', (event) => {
  event.preventDefault()
  const user = createUser()

  if (!user) {
    return
  }

  fetch('http://localhost:3000/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      window.location.href = './index.html'
    })
    .catch((error) => {
      console.error('Error:', error)
    })
})
