// const arDrone = require("ar-drone");
// var control = arDrone.createUdpControl();
// var ref = {};
// var pcmd = {};
// console.log('Recovering from emergency mode if there was one ...');
// ref.emergency = true;


let pythonpath = '../gyro/gyro.py';

gyro = require("child_process").spawn('unbuffer', ["python3", pythonpath], {
    cwd: process.cwd(),
    detached: false,
    stdio: "pipe"
});

gyro.stdout.on("data", (data) => {
    console.log(data.toString().trimEnd());
})


// gyro.stdout.setEncoding('utf8');
// gyro.stdout.on('data', (data) => {
//     console.log(data);
// })


// setTimeout(function() {
//     console.log('Takeoff ...');
//
//     ref.emergency = false;
//     ref.fly       = true;
//
// }, 1000);
//
// setTimeout(function() {
//     console.log('Landing ...');
//
//     ref.fly = false;
//     pcmd = {};
// }, 16000);

// pyshell.on('message', function (message) {
//     switch(message) {
//         case "counting up..":
//             console.log("counting up")
//             break;
//
//         case "counting down..":
//             console.log("counting down")
//             break;
//     }
// });

// end the input stream and allow the process to exit
// pyshell.end(function (err) {
//     if (err){
//         throw err;
//     }
//
//     console.log('finished');
// });



// setInterval(function() {
//     // The emergency: true option recovers your drone from emergency mode that can
//     // be caused by flipping it upside down or the drone crashing into something.
//     // In a real program you probably only want to send emergency: true for one
//     // second in the beginning, otherwise your drone may attempt to takeoff again
//     // after a crash.
//     control.ref(ref);
//     // This command makes sure your drone hovers in place and does not drift.
//     control.pcmd(pcmd);
//     // This causes the actual udp message to be send (multiple commands are
//     // combined into one message)
//     control.flush();
// }, 30);
