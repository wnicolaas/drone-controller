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

        let gyroX = sensorData.gyroscope.gyro_X;

        let rotationX = sensorData.rotation.x;

        let xSpeed = getSpeed(Math.abs(accX));
        let ySpeed = getSpeed(Math.abs(accY));

        let xDirection = getDirection("X", accX);
        let yDirection = getDirection("Y", accY);

        let isFlexed = sensorData.flex > 2.5

        // Detect Takeoff
        if(gyroX > 20000 && -20 > rotationX > -40 && !isAwaiting && !isFlying && isFlexed) {
            takeOff();
            isAwaiting = true;
            await sleep(3000);
        }

        // Detect Land
        if(gyroX < -20000 && -20 > rotationX > -40 && !isAwaiting && isFlying && isFlexed) {
            land();
            isAwaiting = true;
            await sleep(3000);
        }

        // if(!isAwaiting){
        //     pcmd = {}
        // }

        if(!isFlexed) {
            pcmd = {
                [xDirection]: xSpeed,
                [yDirection]: ySpeed
            }
        }

        // Detect Ascend
        if(20 < rotationX < 75 && accX < -5000 && accY > 0 && isFlexed && isFlying && !isAwaiting){
            console.log(iteration + ": Ascending...");
            pcmd = {
                "up": 0.3
            }
        }

        // Detect Descend
        if(rotationX > -60 && rotationX < -20 && accX < 0 && accY < 0 && isFlexed && isFlying && !isAwaiting){
            console.log(iteration + "Descending...");
            pcmd = {
                "down": 0.3
            }
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
        if(accelerometerAxisData > 12000) {
            if(accelerometerAxisData > 14000) {
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
