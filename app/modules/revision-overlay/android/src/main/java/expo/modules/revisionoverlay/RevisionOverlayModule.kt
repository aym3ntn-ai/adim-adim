package expo.modules.revisionoverlay

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

class RevisionOverlayModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available" }.applicationContext

  override fun definition() = ModuleDefinition {
    Name("RevisionOverlay")

    /** Whether Android lets the app draw over other apps. */
    Function("canDrawOverlays") {
      Settings.canDrawOverlays(context)
    }

    /** Opens the system screen where the user grants "display over other apps". */
    Function("openOverlaySettings") {
      val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${context.packageName}"))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
    }

    /** Saves the schedule and the pop-up list (JSON), then re-arms or cancels the alarm. */
    Function("configure") { json: String ->
      OverlayScheduler.save(context, json)
      OverlayScheduler.apply(context)
    }

    /** Shows one pop-up right away, for the "try it" button. Returns false without the permission. */
    Function("showNow") { itemJson: String ->
      if (!Settings.canDrawOverlays(context)) return@Function false
      val item = runCatching { JSONObject(itemJson) }.getOrNull() ?: return@Function false
      OverlayPresenter.show(context, item, OverlayScheduler.durationMs(OverlayScheduler.config(context))) {}
      true
    }
  }
}
