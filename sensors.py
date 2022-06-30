#!/usr/bin/python

import smbus
import math
import time
import json
from adafruit_ads1x15.analog_in import AnalogIn
import adafruit_ads1x15.ads1115 as ADS
import board
import busio
from datetime import datetime

# I2c addresses
MPU6050_ADDR   = 0x68 # The MPU's address on the I2c bus.
AK8963_ADDR    = 0x0C # The AK8963's address on the I2c bus.

# I2c registers
PWR_MGMT_1     = 0x6B # Power management register
ACCEL_XOUT_REG = 0x3B # Accelerometer X register
ACCEL_YOUT_REG = 0x3D # Accelerometer Y register
ACCEL_ZOUT_REG = 0x3F # Accelerometer Z register
GYRO_XOUT_REG  = 0x43 # Gyroscope X register
GYRO_YOUT_REG  = 0x45 # Gyroscope Y register
GYRO_ZOUT_REG  = 0x47 # Gyroscope Z register
MAG_XOUT_REG   = 0x04 # Magnetometer X register
MAG_YOUT_REG   = 0x06 # Magnetometer Y register
MAG_ZOUT_REG   = 0x08 # Magnetometer Z register

i2c = busio.I2C(board.SCL, board.SDA)

ads = ADS.ADS1115(i2c)

chan = AnalogIn(ads, ADS.P0)

def read_byte(reg):
    return bus.read_byte_data(MPU6050_ADDR, reg)


def read_word(reg):
    high = bus.read_byte_data(MPU6050_ADDR, reg)
    low = bus.read_byte_data(MPU6050_ADDR, reg+1)
    val = (high << 8) + low
    return val


def read_word_invert(reg):
    high = bus.read_byte_data(MPU6050_ADDR, reg+1)
    low = bus.read_byte_data(MPU6050_ADDR, reg)
    val = (high << 8) + low
    return val


def read_word_2c(reg):
    val = read_word(reg)
    if val >= 0x8000:
        return -((65535 - val) + 1)
    else:
        return val


def read_word_2c_invert(reg):
    val = read_word_invert(reg)
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

# Now wake the 6050 up as it starts in sleep mode

bus.write_byte_data(MPU6050_ADDR, PWR_MGMT_1, 128)

time_start = datetime.now()

scaling_acc = 16384.0
scaling_mag = 0.15


def AK8963_start():
    bus.write_byte_data(AK8963_ADDR,AK8963_CNTL,0x00)
    time.sleep(0.1)
    AK8963_bit_res = 0b0001 # 0b0001 = 16-bit
    AK8963_samp_rate = 0b0110 # 0b0010 = 8 Hz, 0b0110 = 100 Hz
    AK8963_mode = (AK8963_bit_res <<4)+AK8963_samp_rate # bit conversion
    bus.write_byte_data(AK8963_ADDR,AK8963_CNTL,AK8963_mode)
    time.sleep(0.1)

def AK8963_reader(register):
    # read magnetometer values
    low = bus.read_byte_data(AK8963_ADDR, register-1)
    high = bus.read_byte_data(AK8963_ADDR, register)
    # combine higha and low for unsigned bit value
    value = ((high << 8) | low)
    # convert to +- value
    if(value > 32768):
        value -= 65536
    return value

def AK8963_conv():
    # raw magnetometer bits

    loop_count = 0
    while 1:
        mag_x = AK8963_reader(MAG_XOUT_REG)
        mag_y = AK8963_reader(MAG_YOUT_REG)
        mag_z = AK8963_reader(MAG_ZOUT_REG)

        # the next line is needed for AK8963
        if bin(bus.read_byte_data(AK8963_ADDR,AK8963_ST2))=='0b10000':
            break
        loop_count+=1

    #convert to acceleration in g and gyro dps
    m_x = (mag_x/(2.0**15.0))*mag_sens
    m_y = (mag_y/(2.0**15.0))*mag_sens
    m_z = (mag_z/(2.0**15.0))*mag_sens

    return m_x,m_y,m_z


#AK8963 registers

AK8963_ST2   = 0x09
AK8963_CNTL  = 0x0A
mag_sens = 4900.0 # magnetometer sensitivity: 4800 uT


AK8963_start()


while 1:
    gyro_xout = read_word_2c(GYRO_XOUT_REG)
    gyro_yout = read_word_2c(GYRO_YOUT_REG)
    gyro_zout = read_word_2c(GYRO_ZOUT_REG)

    accel_xout = read_word_2c(ACCEL_XOUT_REG)
    accel_yout = read_word_2c(ACCEL_YOUT_REG)
    accel_zout = read_word_2c(ACCEL_ZOUT_REG)

    accel_xout_scaled = accel_xout / scaling_acc
    accel_yout_scaled = accel_yout / scaling_acc
    accel_zout_scaled = accel_zout / scaling_acc

    mx,my,mz = AK8963_conv()

#     mag_xout_scaled = read_word_2c_invert(0x03) * scaling_mag
#     mag_yout_scaled = read_word_2c_invert(0x05) * scaling_mag
#     mag_zout_scaled = read_word_2c_invert(0x07) * scaling_mag

    time_end = datetime.now()

    timestamp = time_end - time_start

    rot_x = get_x_rotation(accel_xout_scaled, accel_yout_scaled, accel_zout_scaled)
    rot_y = get_y_rotation(accel_xout_scaled, accel_yout_scaled, accel_zout_scaled)

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
        "magnetometer": {
            "mag_X": mx,
            "mag_Y": my,
            "mag_Z": mz
        },
        "rotation": {
            "X": rot_x,
            "Y": rot_y
        },
        "flex": chan.voltage,
        "timestamp": timestamp.total_seconds() * 1000
    }

    result = json.dumps(sensorData)
    print(result)
