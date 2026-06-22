import express from "express";
const app = express();
app.use(cors(
  {
    credentials: true,
    origin: "http://localhost:5000"
  }
));
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.listen(3000,()=>{
    console.log("Server is running on port 3000");
})