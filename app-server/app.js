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
      'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
      [user.firstName, user.lastName, user.emailAddress, user.password]
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
  let { emailAddress, password } = req.body
  try {
    // verifica si existe un usuario con ese email y con esa password
    conn = await pool.getConnection()
    const rows = await conn.query(
      'SELECT email, password FROM users WHERE email = ? AND password = ?',
      [emailAddress, password]
    )
    if (rows.length === 0) {
      res.status(401).json({ message: 'Credenciales incorrectas' })
      console.log('tenés un error, maestro')
    } else {
      // encripta el email del usuario en un token para después autenticarlo
      const token = jwt.sign({ emailAddress }, secret)
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
  let conn
  let emailAddress
  try {
    // decodifica el correo
    const token = req.headers.authorization
    const decoded = jwt.verify(token, secret)
    emailAddress = decoded.emailAddress

    // hace la consulta a la bd para traer la id del user
    conn = await pool.getConnection()
    let user = await conn.query('SELECT id, firstName, lastName FROM users WHERE email = ?', [
      emailAddress,
    ])
    user_id = user[0].id

    // a partir la id, trae las tareas del user
    const tasks = await conn.query(
      'SELECT id, title, description, completed FROM tasks WHERE user_id = ? AND completed = ?',
      [user_id, "false"]
    )
    // envía las tareas como json para mostrarlas en el front
    res.status(200).json({ tasks, user })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    if (conn) conn.release()
  }
})

app.post('/tasks', async (req, res) => {
  let conn
  let emailAddress
  try {
    // decodifica el correo
    const token = req.headers.authorization
    const decoded = jwt.verify(token, secret)
    emailAddress = decoded.emailAddress

    // hace la consulta a la bd para traer la id del user
    conn = await pool.getConnection()
    let user_id = await conn.query('SELECT id FROM users WHERE email = ?', [
      emailAddress,
    ])
    user_id = user_id[0].id

    // trae la tarea desde el cuerpo de la petición
    const { title, description } = req.body

    // crea una nueva tarea con el id del usuario
    await conn.query(
      'INSERT INTO tasks (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, user_id]
    )

    // trae las tareas actualizadas
    const updatedTasks = await conn.query(
      'SELECT id, title, description, completed FROM tasks WHERE user_id = ? AND completed = ?',
      [user_id, "false"]
    )

    // envía las tareas como json para mostrarlas en el front
    res.status(201).json(updatedTasks)
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    if (conn) conn.release()
  }
})

app.delete('/tasks', async (req, res) => {
  let conn
  let emailAddress
  try {
    // decodifica el correo
    const token = req.headers.authorization
    const decoded = jwt.verify(token, secret)
    emailAddress = decoded.emailAddress

    // hace la consulta a la bd para traer la id del user
    conn = await pool.getConnection()
    let user_id = await conn.query('SELECT id FROM users WHERE email = ?', [
      emailAddress,
    ])
    user_id = user_id[0].id

    // a partir la id, trae las tareas del user
    await conn.query('DELETE FROM tasks where id = ?', [req.body.id])

    // envía las tareas como json para mostrarlas en el front
    res.status(200).json({ message: 'Tarea eliminada con éxito' })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    if (conn) conn.release()
  }
})

app.patch('/tasks', async (req, res) => {
  let conn
  let emailAddress
  try {
    // decodifica el correo
    const token = req.headers.authorization
    const decoded = jwt.verify(token, secret)
    emailAddress = decoded.emailAddress

    // hace la consulta a la bd para traer la id del user
    conn = await pool.getConnection()
    let user_id = await conn.query('SELECT id FROM users WHERE email = ?', [
      emailAddress,
    ])
    user_id = user_id[0].id

    // a partir la id, trae las tareas del user
    await conn.query('UPDATE tasks set completed = ? WHERE id = ?', [
      "true", req.body.id,
    ])

    // trae las tareas actualizadas
    const updatedTasks = await conn.query(
      'SELECT id, title, description, completed FROM tasks WHERE completed = ?', ["true"]
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
