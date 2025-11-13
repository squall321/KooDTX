package com.koodtxtemp.sensors

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * SensorPackage - React Native Package for Sensor Module
 *
 * Registers the SensorModule with React Native
 */
class SensorPackage : ReactPackage {

    /**
     * Create native modules to register with React Native
     */
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(SensorModule(reactContext))
    }

    /**
     * Create view managers (not needed for this module)
     */
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
