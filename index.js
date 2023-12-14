// Section 4 Group 10
// Magda Imerlishvili, Ethan Nance, Taylor Stevens, Nicholas Thomas
// Import required modules
const express = require("express");
const multer = require("multer");
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
        password : process.env.RDS_PASSWORD || "S0cc3rr0cks" || "admin" || "newethanlego55555" || "chickenugget410" || "chichennugget410",
        database : process.env.RDS_DB_NAME || "celiac",
        port : process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
    }
});
const storage = multer.memoryStorage(); // Store the file in memory as a Buffer
const upload = multer({ storage: storage });
// Handle requests to the '/' path
app.get('/', (req, res) => {
    res.render('landingpage');
});
//route to createuser
app.get('/createuser', (req, res) => {
    res.render('createuser');
});
//post create new user
app.post('/createuser', (req, res) => {
    const { username, password } = req.body;
    // Check if the username already exists
    knex
        .select("Username")
        .from("Users")
        .where("Username", username)
        .then(Users => {
            if (Users.length > 0) {
                // An account already exists with that username
                res.send(`
                    <script>
                        alert('An account already exists with that Username');
                        window.location.href = '/createuser';
                    </script>
                `);
            } else {
                // Insert the new user into the database
                knex("Users")
                    .insert({ Username: username, Password: password })
                    .returning("*")  // This line returns the inserted user data
                    .then(insertedUsers => {
                        // Check if the insertion was successful
                        if (insertedUsers.length > 0) {
                            res.send(`
                                <script>
                                    alert('Account created successfully!');
                                    window.location.href = '/';
                                </script>
                            `);
                        } else {
                            // Handle the case where insertion failed
                            res.send(`
                                <script>
                                    alert('Account creation failed. Please try again.');
                                    window.location.href = '/createuser';
                                </script>
                            `);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ err });
                    });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err });
        });
});
//route to displayData
app.get('/displayData', (req, res) => {
    res.render('displayData');
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
                    res.redirect("/displayRestaurants");
                }
                else if (password === storedPassword) {
                    // res.send('Login successful!');
                    res.redirect("/displayRestaurants");
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

// Handle display restaurant
app.get("/displayRestaurant", (req, res) => {
    knex.select("Restaurant_Id",
                "Restaurant_Name", 
                "Address", 
                "Photo",
                "Item_Name")
                .from("Restaurant")
                .where("Restaurant_Name", req.query.searchRestaurantName)
                .then(restaurant => {
                    res.render("displayData", { myRestaurant: restaurant });
                }).catch(err => { 
                    console.log(err);
                    res.status(500).json({ err });
                });
            });

    
// Handle display restaurants
app.get('/displayRestaurants', (req, res) => {
    knex
        .select("Restaurant_Id",
            "Restaurant_Name",
            "Address",
            "Photo",
            "Item_Name")
             .from("Restaurant")
             .then(restaurants => {
                                // Render the 'restaurantDisplay' view with the retrieved survey responses
                                res.render("displayRestaurants", { Restaurants: restaurants });
                            })
                            .catch(err => {
                                // Log and handle any errors that occur during data retrieval
                                console.log(err);
                                res.status(500).json({ err });
                            });
                    });

// Handle update restaurant
app.get("/editRestaurant/:id", (req, res) => {
    const restaurantId = req.params.id;

    knex.select("Restaurant_Id", "Restaurant_Name", "Address", "Photo", "Item_Name")
        .from("Restaurant")
        .where("Restaurant_Id", restaurantId)
        .then(restaurant => {
            res.render("editRestaurant", { myRestaurant: restaurant[0] }); // Pass the first element of the array
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err });
        });
});






// Handle update restaurant
app.post('/updateRestaurant', upload.single('restaurantPhoto'), (req, res) => {
    const { restaurantId, restaurantName, address, itemName } = req.body;
    const restaurantPhoto = req.file ? req.file.buffer : undefined;
    console.log('req.file:', req.file); // Log the contents of req.file
    // Check if req.file is defined before accessing its properties
    if (req.file && req.file.buffer) {
        const restaurantPhoto = req.file.buffer;
        knex("Restaurant")
            .where({ Restaurant_Id: restaurantId })
            .update({ Restaurant_Name: restaurantName, Address: address, Photo: restaurantPhoto, Item_Name: itemName })
            .returning("*")
            .then(updatedRestaurant => {
                res.send(`
                    <script>
                        alert('Restaurant updated successfully!');
                        window.location.href = '/displayRestaurants';
                    </script>
                `);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ err });
            });
    } else {
        // Handle the case where req.file or req.file.buffer is undefined
        knex("Restaurant")
            .where({ Restaurant_Id: restaurantId })
            .update({ Restaurant_Name: restaurantName, Address: address, Item_Name: itemName })
            .returning("*")
            .then(updatedRestaurant => {
                res.send(`
                    <script>
                        alert('Restaurant updated successfully!');
                        window.location.href = '/displayRestaurants';
                    </script>
                `);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ err });
            });
    }
});


app.post('/addRestaurant', upload.single('restaurantPhoto'), (req, res) => {
    const { restaurantName, restaurantAddress, restaurantGluten } = req.body;
    console.log('req.file:', req.file); // Log the contents of req.file
    // Check if req.file is defined before accessing its properties
    if (req.file && req.file.buffer) {
        const restaurantPhoto = req.file.buffer;
        knex("Restaurant")
            .insert({ Restaurant_Name: restaurantName, Address: restaurantAddress, Photo: restaurantPhoto, Item_Name: restaurantGluten })
            .returning("*")
            .then(insertedRestaurant => {
                res.send(`
                    <script>
                        alert('Restaurant added successfully!');
                        window.location.href = '/displayRestaurants';
                    </script>
                `);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({ err });
            });
    } else {
        // Handle the case where req.file or req.file.buffer is undefined
        res.status(400).send('Bad Request: Missing or invalid file.');
    }
});

// Handle delete restaurant
app.post('/deleteRestaurant/:id', (req, res) => {
    const restaurantId = req.params.id;
    knex("Restaurant")
        .where({ Restaurant_Id: restaurantId })
        .del()
        .then(() => {
            res.send(`
                <script>
                    alert('Restaurant deleted successfully!');
                    window.location.href = '/displayRestaurants';
                </script>
            `);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err });
        });
});

// Start the Express app and listen on the specified port
app.listen(port, () => console.log("The Express App has started and server is listening!"));