const express = require('express')
const mariadb = require('mariadb')
const cors = require('cors')
const bodyParser = require('body-parser')

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

app.post('/users', async (req, res) => {
  let conn
  let user = req.body
  try {
    conn = await pool.getConnection()
    const rows = await conn.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [user.username, user.email, user.password]
    )
  } catch (e) {
    console.log(e)
  } finally {
    if (conn) conn.release()
  }
})

app.get('/', async (req, res) => {
  let conn
  try {
    conn = await pool.getConnection()
    const rows = await conn.query('SELECT * FROM tasks')
    res.json(rows)
  } catch (e) {
    console.log(e)
  } finally {
    if (conn) conn.release()
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
