function createUser() {
  const firstName = document.getElementById('first-name').value
  const lastName = document.getElementById('last-name').value
  const emailAddress = document.getElementById('email-address').value
  const password = document.getElementById('password').value

  if (!firstName || !lastName || !emailAddress || !password) {
    alert('Please fill in all fields')
    return
  } else {
    const user = {
      firstName: firstName,
      lastName: lastName,
      emailAddress: emailAddress,
      password: password,
    }
    return user
  }
}

document.getElementById('signup-btn').addEventListener('click', (event) => {
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
        throw new Error(response.statusText)
      }
      window.location.href = './login.html'
    })
    .catch((error) => {
      alert(error)
    })
})
