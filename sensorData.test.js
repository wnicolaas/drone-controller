const SensorData = require("./sensorData");

test("test SensorData getters & Setters", ()=>{
    const sensorData = new SensorData();


    Object.defineProperty(sensorData, "getGyro",{
        get: jest.fn(()=>'123'),
        set: jest.fn()
    });
    Object.defineProperty(sensorData, "getUltrasound",{
        get: jest.fn(()=>'2000'),
        set: jest.fn()
    });
    Object.defineProperty(sensorData, "getMagnetometer",{
        get: jest.fn(()=>'bar'),
        set: jest.fn()
    });
    Object.defineProperty(sensorData, "getTemperature",{
        get: jest.fn(()=>'21'),
        set: jest.fn()
    });
    Object.defineProperty(sensorData, "getGps",{
        get: jest.fn(()=>'Latitude: 67.62282, Longitude: 81.42909'),
        set: jest.fn()
    });
    Object.defineProperty(sensorData, "getBatteryPercentage",{
        get: jest.fn(()=>'69'),
        set: jest.fn()
    });


    expect(sensorData.getGyro).toBe('123');
    expect(sensorData.getUltrasound).toBe('2000');
    expect(sensorData.getMagnetometer).toBe('bar');
    expect(sensorData.getTemperature).toBe('21');
    expect(sensorData.getGps).toBe('Latitude: 67.62282, Longitude: 81.42909');
    expect(sensorData.getBatteryPercentage).toBe('69');
})
