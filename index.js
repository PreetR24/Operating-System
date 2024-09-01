const express = require('express');

const app = express();
const port = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/',(req,res)=>{
    res.sendFile(__dirname + "/main.html");
});

app.get('/fcfs',(req,res)=>{
    res.sendFile(__dirname + "/fcfs-disk/fcfs-disk.html");
});

app.get('/lru',(req,res)=>{
    res.sendFile(__dirname + "/lru-page/lru-page.html");
});

app.get('/priority',(req,res)=>{
    res.sendFile(__dirname + "/priority/index.html");
});

app.get('/reader_writer',(req,res)=>{
    res.sendFile(__dirname + "/reader-writer/reader-writer.html");
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});