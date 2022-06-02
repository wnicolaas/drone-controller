const arDrone = require("ar-drone");
var control = arDrone.createUdpControl();
var ref = {};
var pcmd = {};
console.log('Recovering from emergency mode if there was one ...');
ref.emergency = true;

setTimeout(function() {
    console.log('Takeoff ...');

    ref.emergency = false;
    ref.fly       = true;

}, 1000);

setTimeout(function() {
    console.log('Landing ...');

    ref.fly = false;
    pcmd = {};
}, 30000);

let pythonpath = '../gyro/gyro.py';

gyro = require("child_process").spawn('unbuffer', ["python3", pythonpath], {
    cwd: process.cwd(),
    detached: false,
    stdio: "pipe"
});

gyro.stdout.on("data", (data) => {
    let message = data.toString().trimEnd();
    switch(message) {
        case "Left":
            pcmd = {
                left: 0.2, // fly left at 20% speed
            };
            console.log("Going Left...");
            break;
        case "Right":
            pcmd = {
                right: 0.2, // fly forward with 50% speed
            };
            console.log("Going Right...");
            break;
        case "Down":
            pcmd = {
                back: 0.2, // fly back with 50% speed
            };
            console.log("Going backwards...");
            break;
        case "Up":
            pcmd = {
                front: 0.2, //fly forward with 50% speed
            };
            console.log("Going forwards..");
            break;
        case "Upright":
            pcmd = {
                front: 0,
                up: 0,
                right: 0,
                clockwise: 0
            };
            console.log("Neutral mode...");
            break;
    }
});



setInterval(function() {
    // The emergency: true option recovers your drone from emergency mode that can
    // be caused by flipping it upside down or the drone crashing into something.
    // In a real program you probably only want to send emergency: true for one
    // second in the beginning, otherwise your drone may attempt to takeoff again
    // after a crash.
    control.ref(ref);
    // This command makes sure your drone hovers in place and does not drift.
    control.pcmd(pcmd);
    // This causes the actual udp message to be send (multiple commands are
    // combined into one message)
    control.flush();
}, 30);
