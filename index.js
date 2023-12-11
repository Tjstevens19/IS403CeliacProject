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

