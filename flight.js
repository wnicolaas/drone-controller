const arDrone = require("ar-drone");
const setBatteryPercentage = require("./rgbController");
let client = arDrone.createClient();
let ref = {};
let pcmd = {};
let isFlying = false;
let isAwaiting = false;
client.config('general:navdata_demo', 'FALSE');
client.config('general:navadata_options', 777060865);
console.log('Recovering from emergency mode if there was one ...');
ref.emergency = true;
let counter = 250;

let pythonpath = '../gyro/gyro.py';

gyro = require("child_process").spawn('unbuffer', ["python3", pythonpath], {
    cwd: process.cwd(),
    detached: false,
    stdio: "pipe"
});

gyro.stdout.on("data", async (data) => {
    try {
        let sensorData = JSON.parse(data);
        let accX = sensorData.accelerometer.acc_X;
        let accY = sensorData.accelerometer.acc_Y;
        let accZ = sensorData.accelerometer.acc_Z;

        let gyroX = sensorData.gyroscope.gyro_X;

        let rotationX = sensorData.rotation.x;

        let xSpeed = getSpeed(Math.abs(accX));
        let ySpeed = getSpeed(Math.abs(accY));
        let zSpeed = 0; // Disable going up or down for now

        let xDirection = getDirection("X", accX);
        let yDirection = getDirection("Y", accY);
        let zDirection = getDirection("Z", accZ);

        let isFlexed = sensorData.flex > 2.5

        // Detect Takeoff
        if(gyroX < 15000 && -20 > rotationX > -40 && isAwaiting === false && isFlying === false && isFlexed) {
            takeOff();
            isAwaiting = true;
            await sleep(3000);
        }

        // Detect Land
        if(gyroX > -15000 && -20 > rotationX > -40 && isAwaiting === false && isFlying === true && isFlexed) {
            land();
            isAwaiting = true;
            await sleep(3000);
        }

        pcmd = {
            [xDirection]: xSpeed,
            [yDirection]: ySpeed,
            [zDirection]: zSpeed
        }

        // console.log(pcmd);
    } catch (e) {
        pcmd = {}
    }
});

function getDirection(axis, value){
    if(value > 0){
        switch (axis) {
            case "X":
                return "left";
            case "Y":
                return "back";
            case "Z":
                return "up";
        }
    } else {
        switch (axis) {
            case "X":
                return "right";
            case "Y":
                return "front";
            case "Z":
                return "down";
        }
    }
}

function getSpeed(accelerometerAxisData) {
    const SPEED_LEVEL_ONE = 0.1;
    const SPEED_LEVEL_TWO = 0.3;
    const SPEED_LEVEL_THREE = 0.5;

    if(accelerometerAxisData > 9000) {
        if(accelerometerAxisData > 12500) {
            if(accelerometerAxisData > 16000) {
                return SPEED_LEVEL_THREE;
            }
            return SPEED_LEVEL_TWO;
        }
        return SPEED_LEVEL_ONE;
    }

    return 0;
}

function land() {
    console.log('Landing ...');

    client.land();
    // ref.fly = false;
    pcmd = {};
    isFlying = false;
}

function takeOff() {
    console.log('Takeoff ...');

    client.takeoff();
    // ref.emergency = false;
    // ref.fly       = true;
    isFlying = true;
}

function sleep(ms) {
    return new Promise((() => {
        setTimeout(() => isAwaiting = false, ms);
    }))
}


client.on('navdata',  (data)=> {
    counter = counter +1;
    if(counter>250) {
        counter = 0;
        if(data.demo) {
            setBatteryPercentage(data.demo.batteryPercentage);
        } else {
            console.log("error getting sensor data")
        }
    }
});

setInterval(function() {
    client._ref = ref;

    client._pcmd = pcmd;

    client._sendCommands();
}, 30);
