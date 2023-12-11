// Section 4 Group 10
// Magda Imerlishvili, Ethan Nance, Taylor Stevens, Nicholas Thomas

// Import required modules
const express = require("express");

// Initialize Express app
let app = express();

// Set the path module for handling file paths
let path = require("path");

// Set the default port to 3000 or use the environment variable
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set the view engine to EJS
app.set("view engine", "ejs");

// Enable parsing of URL-encoded data
app.use(express.urlencoded({extended: true}));

// Configure the database connection using Knex
const knex = require("knex")({
    client: "pg",
    connection: {
        host : process.env.RDS_HOSTNAME || "localhost",
        user : process.env.RDS_USERNAME || "postgres",
        password : process.env.RDS_PASSWORD || "S0cc3rr0cks" || "admin" || "newethanlego55555",
        database : process.env.RDS_DB_NAME || "celiac",
        port : process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
    }
});  

// Handle requests to the '/login' path
app.get('/login', (req, res) => {
    res.render('login');
});

// Handle login form submissions
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    knex
        .select("Username", "Password")
        .from("Users")
        .where("Username", username)
        .then(users => {
            if (users.length > 0) {
                // Store the password from the database so you can compare
                const storedPassword = users[0].Password;

                // Dummy example: Check if the provided password matches the stored password
                if (username === "admin" && password === "admin") {
                    // res.send('Login successful!');
                    res.redirect("/landingpage.ejs");
                }
                else if (password === storedPassword) {
                    // res.send('Login successful!');
                    res.redirect("/landingpage.ejs");
                } else {
                    // Display an alert and redirect if login fails
                    res.send(`
                        <script>
                            alert('Login failed. Check your username and password.');
                            window.location.href = '/login';
                        </script>
                    `);
                }
            } else {
                // Display an alert and redirect if user is not found
                res.send(`
                    <script>
                        alert('Login failed. No user found with that username, please try again or create an account.');
                        window.location.href = '/login';
                    </script>
                `);
            }
        })
        .catch(err => {
            // Log and handle any errors that occur during login
            console.log(err);
            res.status(500).json({ err });
        });
});
