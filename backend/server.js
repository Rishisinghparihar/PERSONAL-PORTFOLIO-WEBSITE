require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Import the cors package

const app = express();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Use the cors middleware
app.use(cors());

app.use(express.json());

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const client = await pool.connect();
    const result = await client.query(`INSERT INTO "WASTE" (username, email, password) VALUES ($1, $2, $3)`, [username, email, password]);
    client.release();
    res.status(201).send('User created successfully');
  } catch (err) {
    console.error('Error executing query', err);
    res.status(500).send('An error occurred while creating the user');
  }
});

app.post('/login', async (req, res) => {
  const {email, password} = req.body;
  try {
      const client = await pool.connect();
      
      const dbResult = await client.query('SELECT username, password FROM "WASTE" WHERE email = $1', [email]); 
      
      if (dbResult.rows.length === 0) {
          console.log("EMAIL NOT FOUND!!");
          res.status(404).send("Email not found");
      } else {
          const dbPassword = dbResult.rows[0].password;
          if (dbPassword === password) {
              console.log("USER VERIFIED !!");
              res.status(200).send("User verified");
          } else {
              console.log("Invalid Password!!");
              res.status(401).send("Invalid Password");
          }
      }
      await client.release();
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).send('An error occurred while logging in');
  }
});

const port = process.env.SERVERPORT
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
