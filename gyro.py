#!/usr/bin/python

import smbus
import math
import json
from adafruit_ads1x15.analog_in import AnalogIn
import adafruit_ads1x15.ads1115 as ADS
import board
import busio
from datetime import datetime

i2c = busio.I2C(board.SCL, board.SDA)

ads = ADS.ADS1115(i2c)

chan = AnalogIn(ads, ADS.P0)

# Power management registers
power_mgmt_1 = 0x6b
power_mgmt_2 = 0x6c


def read_byte(adr):
    return bus.read_byte_data(address, adr)


def read_word(adr):
    high = bus.read_byte_data(address, adr)
    low = bus.read_byte_data(address, adr+1)
    val = (high << 8) + low
    return val


def read_word_2c(adr):
    val = read_word(adr)
    if val >= 0x8000:
        return -((65535 - val) + 1)
    else:
        return val


def dist(a, b):
    return math.sqrt((a*a)+(b*b))


def get_y_rotation(x, y, z):
    radians = math.atan2(x, dist(y, z))
    return -math.degrees(radians)


def get_x_rotation(x, y, z):
    radians = math.atan2(y, dist(x, z))
    return math.degrees(radians)


bus = smbus.SMBus(1)
address = 0x68       # This is the address value read via the i2cdetect command

# Now wake the 6050 up as it starts in sleep mode

bus.write_byte_data(address, power_mgmt_1, 128)

time_start = datetime.now()

while 1:
    # print("---------")
    # print("gyro data")
    #
    gyro_xout = read_word_2c(0x43)
    gyro_yout = read_word_2c(0x45)
    gyro_zout = read_word_2c(0x47)
    #
    # print("gyro_xout: ", gyro_xout, " scaled: ", (gyro_xout / 131))
    # print("gyro_yout: ", gyro_yout, " scaled: ", (gyro_yout / 131))
    # print("gyro_zout: ", gyro_zout, " scaled: ", (gyro_zout / 131))
    #
    # print()
    # print("accelerometer data")
    # print("------------------")

    accel_xout = read_word_2c(0x3b)
    accel_yout = read_word_2c(0x3d)
    accel_zout = read_word_2c(0x3f)

    accel_xout_scaled = accel_xout / 16384.0
    accel_yout_scaled = accel_yout / 16384.0
    accel_zout_scaled = accel_zout / 16384.0

    time_end = datetime.now()

    timestamp = time_end - time_start

    sensorData = {
        "accelerometer": {
            "acc_X": accel_xout,
            "acc_Y": accel_yout,
            "acc_Z": accel_zout
        },
        "gyroscope": {
            "gyro_X": gyro_xout,
            "gyro_Y": gyro_yout,
            "gyro_Z": gyro_zout
        },
        "rotation": {
            "x": get_x_rotation(accel_xout_scaled, accel_yout_scaled, accel_zout_scaled),
            "y": get_y_rotation(accel_xout_scaled, accel_yout_scaled, accel_zout_scaled)
        },
        "flex": chan.voltage,
        "timestamp": timestamp.total_seconds() * 1000
    }

    # print("accel_xout: ", accel_xout, " scaled: ", accel_xout_scaled)
    # print("accel_yout: ", accel_yout, " scaled: ", accel_yout_scaled)
    # print("accel_zout: ", accel_zout, " scaled: ", accel_zout_scaled)
    #
    # print("x rotation: ", get_x_rotation(accel_xout_scaled, accel_yout_scaled, accel_zout_scaled))
    # print("y rotation: ", get_y_rotation(accel_xout_scaled, accel_yout_scaled, accel_zout_scaled))
    #

    result = json.dumps(sensorData)
    print(result)
