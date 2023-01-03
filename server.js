const express = require("express");
const cors = require("cors")
const mongodb = require("mongodb")
const dotenv = require("dotenv").config()
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3100;


const app = express();
const mongoClient = mongodb.MongoClient
// const URL = "mongodb://localhost:27017"
const URL = process.env.DB;
const DB = "sofc"

app.use(express.json())
app.use(cors({
    origin: "*",
    credentials: true
}))

let authenticate = (req, res, next) => {
    console.log(req.headers.authorization);
    if (req.headers.authorization) {
        try {
            let decode = jwt.verify(req.headers.authorization, process.env.SECRET)
            if (decode) {
                next();
            }
        } catch (error) {
            res.status(401).json({ message: "Unauthorized" })
        }
    } else {
        res.status(401).json({ message: "Unauthorized" })
    }

}



// get All users
app.get("/users", authenticate, async function (req, res) {

    try {
        // Step 1 : Create a Connection between Nodejs and MongoDb
        const connection = await mongoClient.connect(URL)

        // Step 2 : Select the db
        const db = connection.db(DB)

        // Step 3 : Select the Collections
        // Step 4 : Do the Operations (Create, Update, read, delete)
        let users = await db.collection("users").find().toArray()


        // Step 5 : Close the Connection
        await connection.close()

        res.json(users);

    } catch (error) {
        //  If any error throw error
        res.status(500).json({ message: "Something went Wrong" })
    }



});

// get all Questions
app.get("/questions", authenticate, async function (req, res) {

    try {
        // Step 1 : Create a Connection between Nodejs and MongoDb
        const connection = await mongoClient.connect(URL)

        // Step 2 : Select the db
        const db = connection.db(DB)

        // Step 3 : Select the Collections
        // Step 4 : Do the Operations (Create, Update, read, delete)
        let users = await db.collection("questions").find().toArray()


        // Step 5 : Close the Connection
        await connection.close()

        res.json(users);

    } catch (error) {
        //  If any error throw error
        res.status(500).json({ message: "Something went Wrong" })
    }



});


// Post user method
app.post("/signup", async function (req, res) {
    // const hashPassword = await hashGenerate(req.body.password);

    try {
        // Step 1 : Create a Connection between Nodejs and MongoDb
        const connection = await mongoClient.connect(URL)

        // Step 2 : Select the db
        const db = connection.db(DB)

        const salt = await bcrypt.genSalt(10);
        // console.log(salt);
        const hash = await bcrypt.hash(req.body.password, salt);
        // console.log(hash);

        req.body.password = hash;

        // Step 3 : Select the Collections
        // Step 4 : Do the Operations (Create, Update, read, delete)
        await db.collection("users").insertOne(req.body)

        // Step 5 : Close the Connection
        await connection.close()

        res.status(200).json({ message: "User Registered Successfully " })
    } catch (error) {
        //  If any error throw error
        res.status(500).json({ message: "Something went Wrong" })
    }

    // console.log(req.body);
    // req.body.id = users.length + 1;
    // users.push(req.body);
    // res.json({ message: "User Created Successfully" });
});

// Post Questions method
app.post("/postquestions", authenticate, async function (req, res) {

    try {
        // Step 1 : Create a Connection between Nodejs and MongoDb
        const connection = await mongoClient.connect(URL)

        // Step 2 : Select the db
        const db = connection.db(DB)

        // Step 3 : Select the Collections
        // Step 4 : Do the Operations (Create, Update, read, delete)
        await db.collection("questions").insertOne(req.body)

        // Step 5 : Close the Connection
        await connection.close()

        res.status(200).json({ message: "Your Question Added Successfully " })
    } catch (error) {
        //  If any error throw error
        res.status(500).json({ message: "Something went Wrong" })
    }

    // console.log(req.body);
    // req.body.id = users.length + 1;
    // users.push(req.body);
    // res.json({ message: "User Created Successfully" });
});

//  get Questions By Id
app.get("/answer/:id", authenticate, async function (req, res) {

    try {
        // Step 1 : Create a Connection between Nodejs and MongoDb
        const connection = await mongoClient.connect(URL)

        // Step 2 : Select the db
        const db = connection.db(DB)

        // Step 3 : Select the Collections
        // Step 4 : Do the Operations (Create, Update, read, delete)
        let answer = await db.collection("questions").findOne({ _id: mongodb.ObjectId(req.params.id) });


        // Step 5 : Close the Connection
        await connection.close()

        res.json(answer);

    } catch (error) {
        //  If any error throw error
        res.status(500).json({ message: "Something went Wrong" })
    }



})

// Post Answer BY id
// app.put("/answer/:id", async function (req, res) {
//     // let userId = req.params.id;
//     // let userIndex = users.findIndex((item) => item.id == userId);

//     // if (userIndex != -1) {
//     //     Object.keys(req.body).forEach((item) => {
//     //         users[userIndex][item] = req.body[item]
//     //     })

//     //     res.json({ message: "done" })
//     // } else {
//     //     res.json({ message: "User Not found" })
//     // }

//     try {
//         // Step 1 : Create a Connection between Nodejs and MongoDb
//         const connection = await mongoClient.connect(URL)

//         // Step 2 : Select the db
//         const db = connection.db(DB)

//         // Step 3 : Select the Collections
//         // Step 4 : Do the Operations (Create, Update, read, delete)
//         let answer =   await db.collection("questions").findOneAndUpdate({_id: mongodb.ObjectId(req.params.id)},{$set:req.body});


//         // Step 5 : Close the Connection
//         await connection.close()

//         res.json(answer);

//       } catch (error) {
//        //  If any error throw error
//        res.status(500).json({message:"Something went Wrong"})
//       }


// })


app.post("/login", async function (req, res) {
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db(DB);

        let user = await db.collection("users").findOne({ email: req.body.email });
        console.log(user);
        if (user) {
            let compare = await bcrypt.compare(req.body.password, user.password);
            if (compare) {
                let token = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "3h" });

                res.json({ token })
            } else {
                res.json({ message: "Username / Password is Wrong" })
            }
        } else {
            res.status(401).json({ message: "Username / Password is Wrong" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went Wrong" })
    }
})



app.listen(PORT, () => console.log(`Server is Running on port ${PORT}`));