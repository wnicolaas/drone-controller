const arDrone = require("ar-drone");
let client = arDrone.createClient();
let ref = {};
let pcmd = {};
let isFlying = false;
let isAwaiting = false;
console.log('Recovering from emergency mode if there was one ...');
ref.emergency = true;

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

        let xSpeed = getSpeed(Math.abs(accX));
        let ySpeed = getSpeed(Math.abs(accY));
        let zSpeed = 0; // Disable going up or down for now

        let xDirection = getDirection("X", accX);
        let yDirection = getDirection("Y", accY);
        let zDirection = getDirection("Z", accZ);

        if (zDirection === "down" && isAwaiting === false) {
            if (isFlying) {
                land();
                isAwaiting = true;
                await sleep(3000);
            }
            else {
                takeOff();
                isAwaiting = true;
                await sleep(3000);
            }
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
                return "right";
            case "Y":
                return "front";
            case "Z":
                return "up";
        }
    } else {
        switch (axis) {
            case "X":
                return "left";
            case "Y":
                return "back";
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


setInterval(function() {
    client._ref = ref;

    client._pcmd = pcmd;

    client._sendCommands();
}, 30);
