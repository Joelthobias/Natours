const app=require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const port=7081;
const DB = process.env.DB_URL.replace('<password>', process.env.DB_PASSWORD);

mongoose
.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Database Connected 👍 ");
  })
  .catch((error) => {
    if (error.name === "MongoServerError" || error.code === 18) {
      console.error("Authentication failed. Please check your credentials.");
    } else {
      console.error("Failed to connect to the database:", error);
    }
});

process.on('unhandledRejection',(err)=>{
    console.log(err.name ," ",err.message);
})
const server=app.listen(port, () => {
    console.log(`Sever Started at ${port}`);
})
debugger;
