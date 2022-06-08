const pigpio = require('pigpio'); //include pigpio to interact with the GPIO
const Gpio = pigpio.Gpio;

pigpio.configureSocketPort(8884);

var ledRed = new Gpio(4, {mode: Gpio.OUTPUT}), //use GPIO pin 4 as output for RED
    ledGreen = new Gpio(17, {mode: Gpio.OUTPUT}), //use GPIO pin 17 as output for GREEN
    redRGB = 0, //set starting value of RED variable to off (0 for common cathode)
    greenRGB = 0, //set starting value of GREEN variable to off (0 for common cathode)
    percentageBattery = 100;
//RESET RGB LED
ledRed.digitalWrite(0); // Turn RED LED off
ledGreen.digitalWrite(0); // Turn GREEN LED off



setInterval(function(){
    redRGB = (255 * (100 - parseInt(percentageBattery))) / 100
    greenRGB = (255 *parseInt(percentageBattery)) / 100

    ledRed.pwmWrite(parseInt(redRGB)); //set RED LED to specified value
    ledGreen.pwmWrite(parseInt(greenRGB)); //set GREEN LED to specified value

},1000);


process.on('SIGINT', function () { //on ctrl+c
    ledRed.digitalWrite(0); // Turn RED LED off
    ledGreen.digitalWrite(0); // Turn GREEN LED off
    process.exit(); //exit completely
});

module.exports = function setBatterPercentage(percentage){
	percentageBattery = percentage;
}
