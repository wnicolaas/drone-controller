// Emergency stop in case node app crashes

const arDrone = require("ar-drone");
const client = arDrone.createClient();

client.land();
