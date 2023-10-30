const express = require("express");
const cors = require("cors");
require('./db/config');
const User = require('./db/User');
const Product = require('./db/Product');

const Jwt = require('jsonwebtoken');
const jwtKey = 'e-com';

const app = express();


// Middleware
app.use(express.json());
app.use(cors());



// Routes
app.post("/register", async (req, res) => {

    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    Jwt.sign({ result }, jwtKey, { expiresIn: "2h" }, (err, token) => {
        if (err) {
            res.send({ result: "something wrong, Plese try after some time." })
        }
        res.send({ result, auth: token })
    })

});

app.post("/login", async (req, res) => {
    console.log(req.body);
    if (req.body.email && req.body.password) {
        let user = await User.findOne(req.body).select("-password")  //single input and password is not showing or remove password
        if (user) {
            Jwt.sign({ user }, jwtKey, { expiresIn: "2h" }, (err, token) => {
                if (err) {
                    res.send({ result: "something wrong, Plese try after some time." })
                }
                res.send({ user, auth: token })
            })
        }
        else {
            res.send({ result: 'No User Found' })
        }
    }
    else {
        res.send({ result: 'No User Found' });
    }

})

app.post("/add-product", async (req, res) => {
    let product = new Product(req.body);
    let result = await product.save();
    res.send(result);
});

app.get("/products", async (req, res) => {
    let products = await Product.find();
    if (products.length > 0) {
        res.send(products);
    }
    else {
        res.send({ result: "No Products found" })
    }
});

app.delete("/product/:id", async (req, res) => {
    const result = await Product.deleteOne({ _id: req.params.id })
    res.send(result);
})

app.get("/product/:id", async (req, res) => {
    const result = await Product.findOne({ _id: req.params.id });
    if (result) {
        res.send(result);
    }
    else {
        res.send({ result: "No Record Found." })
    }
})

app.put("/product/:id", async (req, res) => {
    const result = await Product.updateOne(
        { _id: req.params.id },
        {
            $set: req.body
        }
    )
    res.send(result);
});

app.get("/search/:key", veriftToken, async (req, res) => {
    const result = await Product.find({
        "$or": [
            { name: { $regex: req.params.key } },
            { company: { $regex: req.params.key } },
            { catagory: { $regex: req.params.key } }
        ]
    })
    res.send(result);
})

function veriftToken(req, res, next) {
    const token = req.headers['Authorization'];

    console.warn("middleware called", token);
    next();
}

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
