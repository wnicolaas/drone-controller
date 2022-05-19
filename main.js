const arDrone = require("ar-drone");
const SensorData = require("./sensorData");

const client = arDrone.createClient();

const sensorData = new SensorData();

client.config('general:navdata_demo', 'FALSE');
client.config('general:navdata_options', 777060865);

client.on('navdata', (data) => {
    if (data.demo) {
        sensorData.batteryPercentage = data.demo.batteryPercentage;
    }

    if (data.rawMeasures) {
        sensorData.gyro = data.rawMeasures.gyroscopes;
    }

    if (data.gps) {
        sensorData.gps = data.gps;
    }
});

function retrieveAllData() {
    console.log("Battery percentage: " + sensorData.batteryPercentage + '%');
    console.log("Gyro X value: " + sensorData.gyro.x);
    console.log("Gyro Y value: " + sensorData.gyro.y);
    console.log("Gyro Z value: " + sensorData.gyro.z);
    console.log("GPS latitude: " + sensorData.gps.latitude);
}

setTimeout(retrieveAllData, 2000);

console.log('Hello');
