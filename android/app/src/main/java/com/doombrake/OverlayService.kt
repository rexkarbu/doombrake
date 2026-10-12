package com.doombrake

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import androidx.core.app.NotificationCompat

class OverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var timerTextView: TextView? = null
    private var badgeIndicator: View? = null
    private var currentScrollCount: Int = 0
    private var currentElapsedSeconds: Int = 0

    companion object {
        const val CHANNEL_ID = "doombrake_overlay_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_SHOW_OVERLAY = "com.doombrake.ACTION_SHOW_OVERLAY"
        const val ACTION_HIDE_OVERLAY = "com.doombrake.ACTION_HIDE_OVERLAY"
        const val ACTION_UPDATE_TIMER = "com.doombrake.ACTION_UPDATE_TIMER"
        const val ACTION_UPDATE_SCROLL = "com.doombrake.ACTION_UPDATE_SCROLL"
        const val EXTRA_SECONDS = "extra_seconds"
        const val EXTRA_APP_NAME = "extra_app_name"
        const val EXTRA_SCROLL_COUNT = "extra_scroll_count"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(NOTIFICATION_ID, createNotification("DoomBrake Active", "Monitoring screen time"))
        setupOverlayView()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: return START_STICKY

        when (action) {
            ACTION_SHOW_OVERLAY -> {
                overlayView?.visibility = View.VISIBLE
            }
            ACTION_HIDE_OVERLAY -> {
                overlayView?.visibility = View.GONE
            }
            ACTION_UPDATE_TIMER -> {
                currentElapsedSeconds = intent.getIntExtra(EXTRA_SECONDS, 0)
                val appName = intent.getStringExtra(EXTRA_APP_NAME) ?: "Scroll"
                updateTimerDisplay(currentElapsedSeconds, appName)
            }
            ACTION_UPDATE_SCROLL -> {
                currentScrollCount = intent.getIntExtra(EXTRA_SCROLL_COUNT, 0)
                updateTimerDisplay(currentElapsedSeconds, "Scroll")
            }
        }
        return START_STICKY
    }

    private fun setupOverlayView() {
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val layoutFlag = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            WindowManager.LayoutParams.TYPE_PHONE
        }

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutFlag,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = 30
            y = 150
        }

        // Programmatically create the floating pill container
        val container = View(this).apply {
            // Touch listener with smooth drag delta
            var initialX = 0
            var initialY = 0
            var initialTouchX = 0f
            var initialTouchY = 0f

            setOnTouchListener { _, event ->
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = params.x
                        initialY = params.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        params.x = initialX + (event.rawX - initialTouchX).toInt()
                        params.y = initialY + (event.rawY - initialTouchY).toInt()
                        windowManager?.updateViewLayout(overlayView, params)
                        true
                    }
                    else -> false
                }
            }
        }

        overlayView = container
        try {
            windowManager?.addView(overlayView, params)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun updateTimerDisplay(seconds: Int, appName: String) {
        val minutes = seconds / 60
        val remainingSec = seconds % 60
        val text = if (currentScrollCount > 0) {
            "🎬 #${currentScrollCount} • ${minutes}m ${remainingSec}s"
        } else {
            "${minutes}m ${remainingSec}s scroll"
        }

        // Dynamic Stage Color Coding
        val colorHex = when {
            seconds >= 30 * 60 -> "#EF4444" // Stage 3: Danger (>30m)
            seconds >= 15 * 60 -> "#F59E0B" // Stage 2: Warning (15-30m)
            else -> "#10B981"               // Stage 1: Safe (0-15m)
        }

        timerTextView?.text = text
        timerTextView?.setTextColor(Color.parseColor(colorHex))
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "DoomBrake Floating Guard",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows live doom-timer floating above short-form video apps"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(title: String, content: String): Notification {
        val intent = packageManager.getLaunchIntentForPackage(packageName)
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (overlayView != null) {
            try {
                windowManager?.removeView(overlayView)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
