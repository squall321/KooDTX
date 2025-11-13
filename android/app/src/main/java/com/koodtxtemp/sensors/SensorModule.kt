package com.koodtxtemp.sensors

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import android.os.Handler
import android.os.Looper
import android.util.Log

/**
 * SensorModule - Native Module for Android Sensor Data Collection
 *
 * Features:
 * - High-frequency sensor data collection (200-400Hz)
 * - Batch processing for efficient data transfer
 * - Support for multiple sensor types (Accelerometer, Gyroscope, Magnetometer, etc.)
 * - Real-time data streaming to JavaScript
 */
class SensorModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext),
    SensorEventListener {

    companion object {
        private const val TAG = "SensorModule"
        private const val MODULE_NAME = "SensorModule"

        // Event names
        private const val EVENT_SENSOR_DATA = "SensorData"
        private const val EVENT_SENSOR_ERROR = "SensorError"

        // Default sampling rates (microseconds)
        private const val SAMPLING_RATE_FASTEST = SensorManager.SENSOR_DELAY_FASTEST // ~200Hz
        private const val SAMPLING_RATE_GAME = SensorManager.SENSOR_DELAY_GAME // ~50Hz
        private const val SAMPLING_RATE_UI = SensorManager.SENSOR_DELAY_UI // ~16Hz
        private const val SAMPLING_RATE_NORMAL = SensorManager.SENSOR_DELAY_NORMAL // ~5Hz

        // Batch size for data collection
        private const val DEFAULT_BATCH_SIZE = 50
    }

    private val sensorManager: SensorManager =
        reactContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager

    // Active sensors map
    private val activeSensors = mutableMapOf<Int, Sensor>()

    // Data buffers for batch processing
    private val dataBuffers = mutableMapOf<Int, MutableList<WritableMap>>()

    // Batch size configuration
    private var batchSize = DEFAULT_BATCH_SIZE

    // Handler for batch sending
    private val handler = Handler(Looper.getMainLooper())

    // Flag to check if module is active
    private var isActive = false

    override fun getName(): String {
        return MODULE_NAME
    }

    /**
     * Get list of available sensors on device
     */
    @ReactMethod
    fun getAvailableSensors(promise: Promise) {
        try {
            val sensorList = sensorManager.getSensorList(Sensor.TYPE_ALL)
            val sensorsArray = Arguments.createArray()

            sensorList.forEach { sensor ->
                val sensorInfo = Arguments.createMap().apply {
                    putInt("type", sensor.type)
                    putString("name", sensor.name)
                    putString("vendor", sensor.vendor)
                    putInt("version", sensor.version)
                    putDouble("power", sensor.power.toDouble())
                    putDouble("resolution", sensor.resolution.toDouble())
                    putDouble("maxRange", sensor.maximumRange.toDouble())
                    putInt("minDelay", sensor.minDelay)
                    putInt("maxDelay", sensor.maxDelay)
                }
                sensorsArray.pushMap(sensorInfo)
            }

            promise.resolve(sensorsArray)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting available sensors", e)
            promise.reject("SENSOR_ERROR", "Failed to get available sensors: ${e.message}", e)
        }
    }

    /**
     * Check if specific sensor type is available
     */
    @ReactMethod
    fun isSensorAvailable(sensorType: Int, promise: Promise) {
        try {
            val sensor = sensorManager.getDefaultSensor(sensorType)
            promise.resolve(sensor != null)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking sensor availability", e)
            promise.reject("SENSOR_ERROR", "Failed to check sensor availability: ${e.message}", e)
        }
    }

    /**
     * Start collecting data from specific sensor
     *
     * @param sensorType - Android sensor type constant
     * @param samplingRate - Sampling rate (0: FASTEST, 1: GAME, 2: UI, 3: NORMAL)
     * @param batchSize - Number of samples to batch before sending to JS
     */
    @ReactMethod
    fun startSensor(sensorType: Int, samplingRate: Int, batchSizeParam: Int, promise: Promise) {
        try {
            // Check if sensor already active
            if (activeSensors.containsKey(sensorType)) {
                Log.w(TAG, "Sensor $sensorType already active")
                promise.resolve(true)
                return
            }

            // Get sensor
            val sensor = sensorManager.getDefaultSensor(sensorType)
            if (sensor == null) {
                promise.reject("SENSOR_NOT_AVAILABLE", "Sensor type $sensorType not available on this device")
                return
            }

            // Set batch size
            this.batchSize = if (batchSizeParam > 0) batchSizeParam else DEFAULT_BATCH_SIZE

            // Convert sampling rate
            val delay = when (samplingRate) {
                0 -> SAMPLING_RATE_FASTEST
                1 -> SAMPLING_RATE_GAME
                2 -> SAMPLING_RATE_UI
                3 -> SAMPLING_RATE_NORMAL
                else -> SAMPLING_RATE_GAME
            }

            // Register sensor listener
            val success = sensorManager.registerListener(this, sensor, delay)

            if (success) {
                activeSensors[sensorType] = sensor
                dataBuffers[sensorType] = mutableListOf()
                isActive = true

                Log.d(TAG, "Started sensor: ${sensor.name} (type: $sensorType)")
                promise.resolve(true)
            } else {
                promise.reject("SENSOR_START_FAILED", "Failed to start sensor $sensorType")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error starting sensor $sensorType", e)
            promise.reject("SENSOR_ERROR", "Failed to start sensor: ${e.message}", e)
        }
    }

    /**
     * Stop collecting data from specific sensor
     */
    @ReactMethod
    fun stopSensor(sensorType: Int, promise: Promise) {
        try {
            val sensor = activeSensors[sensorType]
            if (sensor != null) {
                sensorManager.unregisterListener(this, sensor)
                activeSensors.remove(sensorType)

                // Flush remaining data
                flushBuffer(sensorType)
                dataBuffers.remove(sensorType)

                Log.d(TAG, "Stopped sensor: ${sensor.name} (type: $sensorType)")
                promise.resolve(true)
            } else {
                Log.w(TAG, "Sensor $sensorType not active")
                promise.resolve(false)
            }

            // Update active flag
            isActive = activeSensors.isNotEmpty()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping sensor $sensorType", e)
            promise.reject("SENSOR_ERROR", "Failed to stop sensor: ${e.message}", e)
        }
    }

    /**
     * Stop all active sensors
     */
    @ReactMethod
    fun stopAllSensors(promise: Promise) {
        try {
            activeSensors.keys.toList().forEach { sensorType ->
                val sensor = activeSensors[sensorType]
                if (sensor != null) {
                    sensorManager.unregisterListener(this, sensor)
                    flushBuffer(sensorType)
                }
            }

            activeSensors.clear()
            dataBuffers.clear()
            isActive = false

            Log.d(TAG, "Stopped all sensors")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping all sensors", e)
            promise.reject("SENSOR_ERROR", "Failed to stop all sensors: ${e.message}", e)
        }
    }

    /**
     * SensorEventListener implementation
     */
    override fun onSensorChanged(event: SensorEvent) {
        try {
            val sensorType = event.sensor.type

            // Create sensor data map
            val sensorData = Arguments.createMap().apply {
                putInt("sensorType", sensorType)
                putString("sensorName", event.sensor.name)
                putDouble("timestamp", event.timestamp.toDouble())
                putDouble("systemTime", System.currentTimeMillis().toDouble())

                // Add sensor values
                val valuesArray = Arguments.createArray()
                event.values.forEach { value ->
                    valuesArray.pushDouble(value.toDouble())
                }
                putArray("values", valuesArray)

                // Add accuracy
                putInt("accuracy", event.accuracy)
            }

            // Add to buffer
            val buffer = dataBuffers[sensorType]
            if (buffer != null) {
                buffer.add(sensorData)

                // Send batch if buffer is full
                if (buffer.size >= batchSize) {
                    flushBuffer(sensorType)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error processing sensor data", e)
            sendErrorEvent("Error processing sensor data: ${e.message}")
        }
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {
        Log.d(TAG, "Sensor ${sensor.name} accuracy changed to $accuracy")
    }

    /**
     * Flush buffer and send data to JavaScript
     */
    private fun flushBuffer(sensorType: Int) {
        val buffer = dataBuffers[sensorType]
        if (buffer != null && buffer.isNotEmpty()) {
            val batchData = Arguments.createMap().apply {
                putInt("sensorType", sensorType)
                putInt("count", buffer.size)

                val dataArray = Arguments.createArray()
                buffer.forEach { data ->
                    dataArray.pushMap(data)
                }
                putArray("data", dataArray)
            }

            sendEvent(EVENT_SENSOR_DATA, batchData)
            buffer.clear()
        }
    }

    /**
     * Send event to JavaScript
     */
    private fun sendEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    /**
     * Send error event to JavaScript
     */
    private fun sendErrorEvent(errorMessage: String) {
        val errorData = Arguments.createMap().apply {
            putString("message", errorMessage)
            putDouble("timestamp", System.currentTimeMillis().toDouble())
        }
        sendEvent(EVENT_SENSOR_ERROR, errorData)
    }

    /**
     * Cleanup when module is destroyed
     */
    override fun invalidate() {
        super.invalidate()

        // Stop all sensors
        activeSensors.keys.toList().forEach { sensorType ->
            val sensor = activeSensors[sensorType]
            if (sensor != null) {
                sensorManager.unregisterListener(this, sensor)
                flushBuffer(sensorType)
            }
        }

        activeSensors.clear()
        dataBuffers.clear()
        isActive = false

        Log.d(TAG, "SensorModule invalidated")
    }
}
