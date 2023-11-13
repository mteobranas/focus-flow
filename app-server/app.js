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
    conn = await pool.getConnection()
    const rows = await conn.query(
      'SELECT email, password FROM users WHERE email = ? AND password = ?',
      [email, password]
    )
    if (rows.length === 0) {
      res.status(401).json({ message: 'Credenciales incorrectas' })
      console.log("tenés un error, maestro")
    } else {
      const token = jwt.sign({ email }, secret)
      res.status(200).json({ token, rows})
      console.log("todo piola maestro")
    }
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    if (conn) conn.release()
  }
})

app.use('/tasks', (req, res, next) => {
  try {
    const token = jwt.verify(req.headers['authorization'], secret)
    console.log(token)
    next()
  } catch (err) {
    res.status(401).json({ error: 'No autorizado' })
  }
})

app.get('./tasks', async (req, res) => {
  console.log("si")
  let conn
  let email = req.headers.email
  try {
    conn = await pool.getConnection()
    const rows = await conn.query('SELECT id FROM users WHERE email = ?', [email])
    console.log(rows)
    res.status(200).json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  } finally {
    if (conn) conn.release()
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
