package expo.modules.revisionoverlay

import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.provider.Settings

/** One alarm tick: shows a pop-up only on an unlocked, lit screen, outside quiet hours. */
class OverlayReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val app = context.applicationContext
    val cfg = OverlayScheduler.config(app) ?: return
    if (!cfg.optBoolean("enabled", false)) return
    if (!Settings.canDrawOverlays(app)) return
    val power = app.getSystemService(PowerManager::class.java)
    if (power == null || !power.isInteractive) return
    val keyguard = app.getSystemService(KeyguardManager::class.java)
    if (keyguard != null && keyguard.isKeyguardLocked) return
    if (OverlayScheduler.inQuietHours(cfg)) return
    val item = OverlayScheduler.pick(app, cfg) ?: return

    // Keeps the process alive until the pop-up has left the screen.
    val pending = goAsync()
    OverlayPresenter.show(app, item, OverlayScheduler.durationMs(cfg)) { pending.finish() }
  }
}

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    OverlayScheduler.apply(context.applicationContext)
  }
}
