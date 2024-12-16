import express from "express";
import cors from 'cors'
import routes from './routes/routes'
import path from "path";


const app = express()
app.use(express.json())

app.use(cors({
    origin:['http://localhost:5173'],
    methods:['GET','POST']
}))

app.use('/uploads', express.static(path.join(__dirname, '..','uploads')));

app.use('/',routes)

app.listen(3000,()=>{
    console.log('Server is running');
}) 