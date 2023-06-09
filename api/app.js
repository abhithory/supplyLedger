const express = require('express');

const app = express();
app.use(express.json())


app.get("/", (req, res) => {
    res.status(200).json({
        status: "working fine",
    })
})

app.get("/api/:shipmentid", (req, res) => {
    const id = Number(req.params.shipmentid)
    res.status(200).json({
        ID: id,
        STATUS:4
    })
})



app.listen(3000, () => {
    console.log("Listening on port 3000");
})