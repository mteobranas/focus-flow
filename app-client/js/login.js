function getUser() {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  if (!email || !password) {
    console.log('Please fill in all fields')
    return
  } else {
    const user = {
      email: email,
      password: password,
    }
    return user
  }
}

document.getElementById('login').addEventListener('submit', (e) => {
  e.preventDefault()
  let user = getUser()

  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
    .then((data) => data.json())
    .then((data) => {
      if (data) {
        localStorage.setItem('token', data.token)

        window.location.href = './index.html'
      } else {
        alert('Credenciales incorrectas')
        return
      }
    })
    .catch((error) => {
      console.error('Error:', error)
    })
})
