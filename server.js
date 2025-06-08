
require("dotenv").config();
const logger = require("./src/config/logger");
const server = require("./src/Web/web");






server.listen(process.env.PORT,()=>{
logger.info("Server is running on port 3001");
})