const arDrone = require("ar-drone");
const SensorData = require("./sensorData");

const client = arDrone.createClient();

const sensorData = new SensorData();

client.config('general:navdata_demo', 'FALSE'); // Disables demo mode, allows access to more sensor data
client.config('general:navdata_options', 777060865);

client.on('navdata', (data) => {
    if (data.demo) {
        sensorData.batteryPercentage = data.demo.batteryPercentage;
    }

    if (data.rawMeasures) {
        sensorData.gyro = data.rawMeasures.gyroscopes;
        sensorData.ultrasound = data.rawMeasures.us;
    }

    if (data.gps) {
        sensorData.gps = data.gps;
    }

    if (data.magneto) {
        sensorData.magnetometer = data.magneto.mx;
    }
});

function logAllData() {
    console.log("Battery percentage: " + sensorData.batteryPercentage + '%');
    console.log("Gyro X value: " + sensorData.gyro.x);
    console.log("Gyro Y value: " + sensorData.gyro.y);
    console.log("Gyro Z value: " + sensorData.gyro.z);
    console.log("GPS latitude: " + sensorData.gps.latitude);
    console.log("Ultrasound distance measurement: " + sensorData.ultrasound.echo.distance);
    console.log("Magneto X value: " + sensorData.magnetometer.mx);
    console.log("Magneto Y value: " + sensorData.magnetometer.my);
    console.log("Magneto Z value: " + sensorData.magnetometer.mz);
}

setTimeout(logAllData, 2000);

console.log('Hello');
