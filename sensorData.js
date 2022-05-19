class SensorData {
    gyro = {};
    ultrasound = {};
    magnetometer = {};
    temperature = {};
    gps = {};
    batteryPercentage = {};

    set magnetometer(mag) {
        this.magnetometer = mag;
    }

    set gyro(gyro) {
        this.gyro = gyro;
    }

    set ultrasound(us) {
        this.ultrasound = us;
    }

    set temperature(temp) {
        this.temperature = temp;
    }

    set gps(gps) {
        this.gps = gps;
    }

    set batteryPercentage(bat) {
        this.batteryPercentage = bat;
    }

    get getGps() {
        return this.gps;
    }

    get getTemperature() {
        return this.temperature;
    }

    get getUltrasoundData() {
        return this.ultrasonic;
    }

    get getGyroData() {
        return this.gyro;
    }

    get getBatteryPercentage() {
        return this.batteryPercentage;
    }

    get getMagnetometer() {
        return this.magnetometer;
    }

}

module.exports = SensorData;
