# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /sdk/tools/proguard/proguard-android.txt

# React Native
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}
-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
}

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# DoomBrake Native Modules - keep these accessible from JS bridge
-keep class com.doombrake.TrackingModule { *; }
-keep class com.doombrake.TrackingService { *; }
-keep class com.doombrake.OverlayService { *; }
-keep class com.doombrake.DoomBrakePackage { *; }

# Accessibility Service must not be obfuscated
-keep public class * extends android.accessibilityservice.AccessibilityService

# Kotlin Coroutines (if used later)
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
