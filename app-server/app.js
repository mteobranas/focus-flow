const express = require('express')
const mariadb = require('mariadb')
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

const secret = 'ultra secret key'

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'todo-app',
})

const app = express()
const port = process.env.PORT ?? 3000

app.use(cors())
app.use(bodyParser.json())

app.post('/signup', async (req, res) => {
  let conn
  let user = req.body

  try {
    conn = await pool.getConnection()
    const rows = await conn.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [user.username, user.email, user.password]
    )
    res.status(200).json({ message: 'Usuario registrado correctamente' })
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El usuario ya está registrado' })
    } else {
      console.error(e)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  } finally {
    if (conn) conn.release()
  }
})

app.post('/login', async (req, res) => {
  let conn
  let { email, password } = req.body
  try {
    // verifica si existe un usuario con ese email y con esa password
    conn = await pool.getConnection()
    const rows = await conn.query(
      'SELECT email, password FROM users WHERE email = ? AND password = ?',
      [email, password]
    )
    if (rows.length === 0) {
      res.status(401).json({ message: 'Credenciales incorrectas' })
      console.log('tenés un error, maestro')
    } else {
      // encripta el email del usuario en un token para después autenticarlo
      const token = jwt.sign({ email }, secret)
      res.status(200).json({ token })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    if (conn) conn.release()
  }
})

app.use('/tasks', (req, res, next) => {
  try {
    // verifica si el user tiene autenticación
    const token = req.headers.authorization
    jwt.verify(token, secret)
    next()
  } catch (err) {
    res.status(401).json({ error: 'No autorizado' })
  }
})

app.get('/tasks', async (req, res) => {
  console.log('si')
  let conn
  let email
  try {
    // decodifica el correo
    const token = req.headers.authorization
    const decoded = jwt.verify(token, secret)
    email = decoded.email

    // hace la consulta a la bd para traer la id del user
    conn = await pool.getConnection()
    let user_id = await conn.query('SELECT id FROM users WHERE email = ?', [
      email,
    ])
    user_id = user_id[0].id

    // a partir la id, trae las tareas del user
    const tasks = await conn.query(
      'SELECT id, title, description, completed FROM tasks WHERE user_id = ?',
      [user_id]
    )

    // envía las tareas como json para mostrarlas en el front
    res.status(200).json(tasks)
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    if (conn) conn.release()
  }
})

app.post('/tasks', async (req, res) => {
  let conn
  let email
  try {
    // decodifica el correo
    const token = req.headers.authorization
    const decoded = jwt.verify(token, secret)
    email = decoded.email

    // hace la consulta a la bd para traer la id del user
    conn = await pool.getConnection()
    let user_id = await conn.query('SELECT id FROM users WHERE email = ?', [
      email,
    ])
    user_id = user_id[0].id

    // trae la tarea desde el cuerpo de la petición
    const { title, description, completed } = req.body

    // crea una nueva tarea con el id del usuario
    await conn.query(
      'INSERT INTO tasks (title, description, completed, user_id) VALUES (?, ?, ?, ?)',
      [title, description, completed, user_id]
    )

    // trae las tareas actualizadas
    const updatedTasks = await conn.query(
      'SELECT id, title, description, completed FROM tasks WHERE user_id = ?',
      [user_id]
    )

    // envía las tareas como json para mostrarlas en el front
    res.status(200).json(updatedTasks)
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    if (conn) conn.release()
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
