package com.doombrake

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class TrackingService : AccessibilityService() {

    companion object {
        const val PACKAGE_TIKTOK = "com.zhiliaoapp.musically"
        const val PACKAGE_INSTAGRAM = "com.instagram.android"

        var instance: TrackingService? = null
        var currentForegroundPackage: String? = null
        var isCurrentlyInReels: Boolean = false
        var sessionScrollCount: Int = 0
        var lastScrollTimestamp: Long = 0L
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                         AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED or
                         AccessibilityEvent.TYPE_VIEW_SCROLLED
            packageNames = arrayOf(PACKAGE_TIKTOK, PACKAGE_INSTAGRAM)
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            notificationTimeout = 100
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS
        }
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val packageName = event.packageName?.toString() ?: return

        when (event.eventType) {
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                handleWindowStateChanged(packageName, event)
            }
            AccessibilityEvent.TYPE_VIEW_SCROLLED -> {
                handleScrollEvent(packageName)
            }
            AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED -> {
                if (packageName == PACKAGE_INSTAGRAM) {
                    inspectInstagramMicroTracking(rootInActiveWindow)
                }
            }
        }
    }

    private fun handleScrollEvent(packageName: String) {
        val isTargetActive = packageName == PACKAGE_TIKTOK || (packageName == PACKAGE_INSTAGRAM && isCurrentlyInReels)
        if (!isTargetActive) return

        val now = System.currentTimeMillis()
        if (now - lastScrollTimestamp > 750) {
            lastScrollTimestamp = now
            sessionScrollCount++

            // Dispatch to React Native JS Bridge
            TrackingModule.emitVideoScrolled(packageName, sessionScrollCount)

            // Direct intent update to Floating OverlayService
            try {
                val overlayIntent = Intent(this, OverlayService::class.java).apply {
                    action = OverlayService.ACTION_UPDATE_SCROLL
                    putExtra(OverlayService.EXTRA_SCROLL_COUNT, sessionScrollCount)
                }
                startService(overlayIntent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private fun handleWindowStateChanged(packageName: String, event: AccessibilityEvent) {
        if (packageName == PACKAGE_TIKTOK) {
            if (currentForegroundPackage != PACKAGE_TIKTOK) {
                currentForegroundPackage = PACKAGE_TIKTOK
                sessionScrollCount = 0
                TrackingModule.emitAppOpened(PACKAGE_TIKTOK, "TikTok", true)
            }
        } else if (packageName == PACKAGE_INSTAGRAM) {
            val isReels = checkInstagramReels(event.rootInActiveWindow)
            if (currentForegroundPackage != PACKAGE_INSTAGRAM || isCurrentlyInReels != isReels) {
                currentForegroundPackage = PACKAGE_INSTAGRAM
                isCurrentlyInReels = isReels
                if (!isReels) sessionScrollCount = 0
                TrackingModule.emitAppOpened(PACKAGE_INSTAGRAM, "Instagram Reels", isReels)
            }
        } else {
            if (currentForegroundPackage != null) {
                val previous = currentForegroundPackage
                currentForegroundPackage = null
                isCurrentlyInReels = false
                sessionScrollCount = 0
                if (previous != null) {
                    TrackingModule.emitAppClosed(previous)
                }
            }
        }
    }

    private fun checkInstagramReels(rootNode: AccessibilityNodeInfo?): Boolean {
        if (rootNode == null) return false
        val viewIdsToMatch = listOf("clips_viewer", "reel_viewer", "reels_tab", "clips_video_container")
        for (viewId in viewIdsToMatch) {
            val nodes = rootNode.findAccessibilityNodeInfosByViewId("com.instagram.android:id/$viewId")
            if (nodes != null && nodes.isNotEmpty()) {
                return true
            }
        }
        val textMatches = rootNode.findAccessibilityNodeInfosByText("Reels")
        return textMatches != null && textMatches.isNotEmpty()
    }

    private fun inspectInstagramMicroTracking(rootNode: AccessibilityNodeInfo?) {
        val isReels = checkInstagramReels(rootNode)
        if (isReels != isCurrentlyInReels) {
            isCurrentlyInReels = isReels
            if (isReels) {
                TrackingModule.emitAppOpened(PACKAGE_INSTAGRAM, "Instagram Reels", true)
            } else {
                TrackingModule.emitAppClosed(PACKAGE_INSTAGRAM)
            }
        }
    }

    override fun onInterrupt() {
        // Accessibility service interrupted by system
    }

    override fun onDestroy() {
        super.onDestroy()
        if (currentForegroundPackage != null) {
            TrackingModule.emitAppClosed(currentForegroundPackage!!)
        }
        instance = null
    }
}
