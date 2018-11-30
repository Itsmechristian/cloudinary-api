'use strict';

require('dotenv').config();


const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch');

const app = express();


// Connect to database
mongoose.connect(`mongodb://${process.env.DBUSER}:${process.env.DBPASSWORD}@ds115094.mlab.com:15094/cloudinary-data`, { useNewUrlParser: true })

const Schema = mongoose.Schema;

const CloudSchema = new Schema({
    resources: Array,
    next_cursor: String
})

const CloudImage = mongoose.model('cloudimage', CloudSchema)
const CloudRaw = mongoose.model('cloudraw', CloudSchema)

// Connect to cloudinary
const urlImage = `https://${process.env.API_KEY}:${process.env.API_SECRET}@api.cloudinary.com/v1_1/${process.env.DBUSER}/resources/image`;
const urlRaw =  `https://${process.env.API_KEY}:${process.env.API_SECRET}@api.cloudinary.com/v1_1/${process.env.DBUSER}/resources/raw`;


setInterval(() => {
    fetch(urlImage).then(res => res.json()).then(cDatas => {
        CloudImage.bulkWrite([
            {
                updateMany: {
                    filter: {},
                    update: cDatas
            }
            }
        ])
    })
    fetch(urlRaw).then(res => res.json()).then(rDatas => {
        CloudRaw.bulkWrite([
            {
                updateMany: {
                    filter: {},
                    update: rDatas
            }
            }
        ])
    })

}, 10000);


app.use(express.static('./public'));

app.get('/api/image', (req, res) => {

    // let cloudimage = new CloudImage(rDatas)
    // cloudimage.save()

    CloudImage.find().then(datas => {
        res.json(datas)
    })
})

app.get('/api/raw', (req, res) => {
    // let cloudraw = new CloudRaw(rDatas)
    // cloudraw.save()
        
    CloudRaw.find().then(datas => {
        res.json(datas)
    })
})

const port = 2000;

app.listen(port, () => console.log(`Connected to port ${port}`));