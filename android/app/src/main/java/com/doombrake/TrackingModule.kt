package com.doombrake

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule

class TrackingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    init {
        staticReactContext = reactContext
    }

    companion object {
        const val MODULE_NAME = "DoomBrakeTracking"
        const val EVENT_APP_OPENED = "APP_OPENED"
        const val EVENT_APP_CLOSED = "APP_CLOSED"
        const val EVENT_VIDEO_SCROLLED = "VIDEO_SCROLLED"

        var staticReactContext: ReactApplicationContext? = null

        fun emitAppOpened(packageName: String, appName: String, isReels: Boolean) {
            val context = staticReactContext ?: return
            val params = Arguments.createMap().apply {
                putString("packageName", packageName)
                putString("appName", appName)
                putBoolean("isReels", isReels)
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(EVENT_APP_OPENED, params)
        }

        fun emitAppClosed(packageName: String) {
            val context = staticReactContext ?: return
            val params = Arguments.createMap().apply {
                putString("packageName", packageName)
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(EVENT_APP_CLOSED, params)
        }

        fun emitVideoScrolled(packageName: String, scrollCount: Int) {
            val context = staticReactContext ?: return
            val params = Arguments.createMap().apply {
                putString("packageName", packageName)
                putInt("scrollCount", scrollCount)
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(EVENT_VIDEO_SCROLLED, params)
        }
    }

    override fun getName(): String = MODULE_NAME

    @ReactMethod
    fun checkUsagePermission(promise: Promise) {
        try {
            val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                appOps.unsafeCheckOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactApplicationContext.packageName
                )
            } else {
                appOps.checkOpNoThrow(
                    AppOpsManager.OPSTR_GET_USAGE_STATS,
                    Process.myUid(),
                    reactApplicationContext.packageName
                )
            }
            promise.resolve(mode == AppOpsManager.MODE_ALLOWED)
        } catch (e: Exception) {
            promise.reject("USAGE_CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestUsagePermission() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun checkAccessibilityPermission(promise: Promise) {
        try {
            val expectedServiceName = "${reactApplicationContext.packageName}/${TrackingService::class.java.canonicalName}"
            val enabledServices = Settings.Secure.getString(
                reactApplicationContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val isEnabled = enabledServices.contains(expectedServiceName)
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.reject("ACCESSIBILITY_CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestAccessibilityPermission() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactApplicationContext))
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("OVERLAY_CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${reactApplicationContext.packageName}")
            ).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun getForegroundApp(promise: Promise) {
        val current = TrackingService.currentForegroundPackage
        val result = Arguments.createMap().apply {
            putString("packageName", current)
            putBoolean("isTracking", current != null)
        }
        promise.resolve(result)
    }

    @ReactMethod
    fun checkBatteryOptimization(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as android.os.PowerManager
                val isIgnoring = powerManager.isIgnoringBatteryOptimizations(reactApplicationContext.packageName)
                promise.resolve(isIgnoring)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("BATTERY_CHECK_ERROR", e.message)
        }
    }

    @ReactMethod
    fun requestIgnoreBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:${reactApplicationContext.packageName}")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun addListener(eventName: String) {
        // Keep for RN NativeEventEmitter compliance
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep for RN NativeEventEmitter compliance
    }
}
