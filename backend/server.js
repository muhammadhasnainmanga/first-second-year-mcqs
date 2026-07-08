require('dotenv').config();   
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();

const port = 4000; // Use the port from .env or default to 4000 
// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'quiz_app'
});

db.connect((err) => {
    if (err) {
        console.log('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL!');
});

// First API endpoint — get all questions by subject
app.get('/api/questions/:subject', (req, res) => {
    const subject = req.params.subject;
    db.query('SELECT * FROM questions WHERE subject = ?', [subject], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(results);
    });
});


// Second API endpoint — users data signup
app.post('/api/signup', async (req,res) => {
    const { username, email, password } = req.body;
    
    if( !username || !email || !password ) {
        return res.status(400).json({error : "All fields are required"});
    }

    try {

        const [existingUser] = await db.promise().query('Select * from users where email = ? OR username = ?', 
        [email, username]);

        if(existingUser.length > 0) {
            return res.status(409).json({error : "Username or Email already taken"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.promise().query(
            'Insert into users (username, email, password_hash) values (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({message : "User registered successfully"});

    } catch (err) {
        res.status(500).json({error : err.message});

    }
});

//Third api call - Login logic
app.post('/api/login', async (req,res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({error : "Email or Password are required"});
    }

    try{
        const [row] = await db.promise().query('Select * from users where email = ?', [email]);

        if(row.length === 0){
            return res.status(401).json({error : "Invalid email or password"});
        }

        const user = row[0];
        const PasswordMatch = await bcrypt.compare(password, user.password_hash);

        if(!PasswordMatch){
            return res.status(401).json({error : "Invalid email or password"});
        }

        res.status(200).json({
            id: user.id, 
            username: user.username, 
            email: user.email
        });

    }catch(err){
        
        res.status(500).json({error: err.message});
    }
});

//fourth call - leaderboard fetching
app.get('/api/results/leaderboard/:subject', async (req, res) => {
    const subject = req.params.subject;

    try{
        const [rows] = await db.promise().query(
            `SELECT users.username, results.score, results.achieve_score, results.played_at
            FROM results
            JOIN users ON results.user_name = users.username
            WHERE results.subject = ?
            ORDER BY results.score DESC
            LIMIT 10`,
            [subject]
        );

        res.json(rows);

    }
    catch(err){
        res.status(500).json({error: err.message});
    }

});


// Fifth call - saving results
app.post('/api/results/save', async (req, res) => {

    const{user_name, subject, score, achieve_score} = req.body;


    if(!user_name || !subject || !score || !achieve_score){
        return res.status(400).json({error : "All fields are required"});
    }

    try{

        await db.promise().query(
            `INSERT INTO results (user_name, subject, score, achieve_score) Values (?,?,?,?)`,
            [user_name, subject, score, achieve_score]
        );

        res.status(201).json({message : "Result saved successfully"});

    }
    catch(err){
        console.log(err.message);
        res.status(500).json({error: err.message});
    }

});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});