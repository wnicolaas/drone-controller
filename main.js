const arDrone = require("ar-drone");

const client = arDrone.createClient();

let last = 0;

client.on('navdata', (data) => {
    let now = new Date().getTime();
    if(now - last > 3000) {
        last = now;

        if (data.demo) {
            console.log('percentage: ' + data.demo.batteryPercentage);
        }
    }
});
