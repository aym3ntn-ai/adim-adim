package expo.modules.revisionoverlay

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import org.json.JSONObject
import java.util.Calendar

/**
 * Stores the pop-up schedule handed over by the app and arms an inexact,
 * non-waking alarm: it only fires while the phone is already awake, which is
 * exactly when a pop-up can be seen.
 */
object OverlayScheduler {
  private const val PREFS = "revision_overlay"
  private const val KEY_CONFIG = "config"
  private const val KEY_LAST = "last_id"
  const val ACTION_TICK = "expo.modules.revisionoverlay.TICK"

  private fun prefs(ctx: Context) = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun save(ctx: Context, json: String) {
    prefs(ctx).edit().putString(KEY_CONFIG, json).apply()
  }

  fun config(ctx: Context): JSONObject? =
    prefs(ctx).getString(KEY_CONFIG, null)?.let { runCatching { JSONObject(it) }.getOrNull() }

  fun apply(ctx: Context) {
    val alarms = ctx.getSystemService(AlarmManager::class.java) ?: return
    val tick = pendingTick(ctx)
    alarms.cancel(tick)
    val cfg = config(ctx) ?: return
    if (!cfg.optBoolean("enabled", false)) return
    val minutes = cfg.optInt("intervalMinutes", 120).coerceAtLeast(15)
    val interval = minutes * 60_000L
    alarms.setInexactRepeating(
      AlarmManager.ELAPSED_REALTIME,
      SystemClock.elapsedRealtime() + interval,
      interval,
      tick,
    )
  }

  private fun pendingTick(ctx: Context): PendingIntent {
    val intent = Intent(ctx, OverlayReceiver::class.java).setAction(ACTION_TICK)
    return PendingIntent.getBroadcast(
      ctx,
      1,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
  }

  fun inQuietHours(cfg: JSONObject): Boolean {
    val start = cfg.optInt("quietStart", -1)
    val end = cfg.optInt("quietEnd", -1)
    if (start < 0 || end < 0 || start == end) return false
    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
    return if (start < end) hour in start until end else hour >= start || hour < end
  }

  /** A random item, never the one shown just before when there is a choice. */
  fun pick(ctx: Context, cfg: JSONObject): JSONObject? {
    val items = cfg.optJSONArray("items") ?: return null
    if (items.length() == 0) return null
    val last = prefs(ctx).getString(KEY_LAST, null)
    var item = items.getJSONObject((0 until items.length()).random())
    if (items.length() > 1) {
      repeat(4) {
        if (item.optString("id") != last) return@repeat
        item = items.getJSONObject((0 until items.length()).random())
      }
    }
    prefs(ctx).edit().putString(KEY_LAST, item.optString("id")).apply()
    return item
  }

  fun durationMs(cfg: JSONObject?): Long = (cfg?.optLong("durationMs", 5000L) ?: 5000L).coerceIn(2000L, 15000L)
}
