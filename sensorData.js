class SensorData {
    gyro;
    ultrasonic;
    temperature;
    gps;
    batteryPercentage;

    set gyro(gyro) {
        this.gyro = gyro;
    }

    set ultrasonic(us) {
        this.ultrasonic = us;
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

    get getUltrasonicData() {
        return this.ultrasonic;
    }

    get getGyroData() {
        return this.gyro;
    }

    get getBatteryPercentage() {
        return this.batteryPercentage;
    }

}

module.exports = SensorData;
