const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
// Imports routes :
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// For MongoDB Connection.
mongoose.connect(process.env.DB).then(() => console.log("MongoDB Connected Successfully !")).catch((err) => console.log("MongoDB Connection Failed", error.message));

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Routes-Middleware - API Endpoints.

// Users related routes.
app.use("/api/users", userRoutes); 

// Posts related routes.
app.use("/api/posts", postRoutes);  


app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

