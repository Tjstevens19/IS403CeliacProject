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
                    res.redirect("/");
                }
                else if (password === storedPassword) {
                    // res.send('Login successful!');
                    res.redirect("/");
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

app.get('/displayData', (req, res) => {
    knex
        .select("Restaurant_Id", 
            "Restaurant_Name", 
            "Address",
            "Photo",)
             .from("Restaurant")
             .then(restaurants => {
                                // Render the 'restaurantDisplay' view with the retrieved survey responses
                                res.render("restaurantDisplay", { Restaurants: restaurants });
                            })
                            .catch(err => {
                                // Log and handle any errors that occur during data retrieval
                                console.log(err);
                                res.status(500).json({ err });
                            });
                    });

app.post('/addRestaurant', upload.single('restaurantPhoto'), (req, res) => {
    const { restaurantName, restaurantAddress } = req.body;
    const restaurantPhoto = req.file.buffer;

    knex("Restaurant")
        .insert({ Restaurant_Name: restaurantName, Address: restaurantAddress, Photo: restaurantPhoto })
        .returning("*")
        .then(insertedRestaurant => {
            res.send(`
                <script>
                    alert('Restaurant added successfully!');
                    window.location.href = '/displayData';
                </script>
            `);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err });
        });
});


// app.get('/displayData', (req, res) => {

//     knex.select("Survey_Responses.User_Id", 
//             "Timestamp", 
//             "Age",
//             "Gender",
//             "Location",
//             "Relationship_Status",
//             "Social_Media_User", 
//             "Occupation",
//             "Avg_Social_Media_Hours_Daily",
//             "Purposeless_Usage_Frequency",
//             "Distracted_Use_Frequency",
//             "Restless_Without_Social_Media_Level", 
//             "General_Distraction_Level",
//             "General_Worry_Level",
//             "General_Difficulty_Concentrating_Level",
//             "Comparison_To_Others_Frequency",
//             "Feeling_About_Comparison_Level",
//             "Seeking_Validation_Frequency", 
//             "Depression_Frequency",
//             "Interest_Fluctuation_Frequency",
//             "Sleep_Issue_Frequency",
//             "Comments",
//             "Organization_Info.Organization_Num",
//             "Organization_Info.Organization_Type" ,
//              "User_Engagement_Info.Platform_Num",
//              "Platform_Info.Platform_Name",
//          knex.raw(`
//          (
//              SELECT STRING_AGG(DISTINCT "Platform_Info"."Platform_Name", ', ') 
//              FROM "User_Engagement_Info" 
//              JOIN "Platform_Info" ON "User_Engagement_Info"."Platform_Num" = "Platform_Info"."Platform_Num" 
//              WHERE "User_Engagement_Info"."User_Id" = "Survey_Responses"."User_Id"
//              GROUP BY "User_Engagement_Info"."User_Id"
//          ) AS "Platform_Names"
//      `),
     
//      // Organization Types subquery
//      knex.raw(`
//          (
//              SELECT STRING_AGG(DISTINCT "Organization_Info"."Organization_Type", ', ') 
//              FROM "User_Engagement_Info" 
//              JOIN "Organization_Info" ON "User_Engagement_Info"."Organization_Num" = "Organization_Info"."Organization_Num" 
//              WHERE "User_Engagement_Info"."User_Id" = "Survey_Responses"."User_Id"
//              GROUP BY "User_Engagement_Info"."User_Id"
//          ) AS "Organization_Types"
//          `) 
//     )
//             .from('Survey_Responses')
//             .join('User_Engagement_Info', 'Survey_Responses.User_Id', '=', 'User_Engagement_Info.User_Id')
//             .join('Organization_Info', 'User_Engagement_Info.Organization_Num', '=', 'Organization_Info.Organization_Num')
//             .join('Platform_Info', 'User_Engagement_Info.Platform_Num', '=', 'Platform_Info.Platform_Num')
//             .orderBy('Survey_Responses.User_Id')
//             .distinctOn('Survey_Responses.User_Id')
//             .then(responses => {
//                 // Render the 'displayData' view with the retrieved survey responses
//                 res.render("displayData", { SurveyResponses: responses });
//             })
//             .catch(err => {
//                 // Log and handle any errors that occur during data retrieval
//                 console.log(err);
//                 res.status(500).json({ err });
//             });
//     });

// Start the Express app and listen on the specified port
app.listen(port, () => console.log("The Express App has started and server is listening!"));

