package expo.modules.revisionoverlay

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.view.animation.LinearInterpolator
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import org.json.JSONObject
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Draws the review card over other apps for a few seconds, then removes it.
 * Tapping the card opens the app; the cross closes it early.
 */
object OverlayPresenter {
  private val main = Handler(Looper.getMainLooper())
  private var current: View? = null

  private data class Colors(val avatarBg: Int, val avatarText: Int, val tag: Int, val bar: Int)

  private fun colorsFor(type: String): Colors = when (type) {
    "regle" -> Colors(Color.parseColor("#24613A"), Color.WHITE, Color.parseColor("#24613A"), Color.parseColor("#24613A"))
    "rappel" -> Colors(Color.parseColor("#EEE9E1"), Color.parseColor("#1B1F2A"), Color.parseColor("#5B6170"), Color.parseColor("#5B6170"))
    "beau_mot" -> Colors(Color.parseColor("#F2B38F"), Color.parseColor("#5A2410"), Color.parseColor("#A8441C"), Color.parseColor("#C8572B"))
    else -> Colors(Color.parseColor("#1F4E8C"), Color.WHITE, Color.parseColor("#1F4E8C"), Color.parseColor("#1F4E8C"))
  }

  fun show(ctx: Context, item: JSONObject, durationMs: Long, onDone: () -> Unit) {
    main.post {
      val wm = ctx.getSystemService(WindowManager::class.java)
      if (wm == null) {
        onDone()
        return@post
      }
      current?.let { runCatching { wm.removeViewImmediate(it) } }
      current = null

      val finished = AtomicBoolean(false)
      lateinit var root: View
      val dismiss: () -> Unit = {
        if (finished.compareAndSet(false, true)) {
          root.animate().alpha(0f).translationY(-dp(ctx, 16f)).setDuration(220)
            .setListener(object : AnimatorListenerAdapter() {
              override fun onAnimationEnd(animation: Animator) {
                runCatching { wm.removeViewImmediate(root) }
                if (current === root) current = null
                onDone()
              }
            }).start()
        }
      }
      val open: () -> Unit = {
        ctx.packageManager.getLaunchIntentForPackage(ctx.packageName)?.let {
          it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED)
          runCatching { ctx.startActivity(it) }
        }
        dismiss()
      }

      root = build(ctx, item, durationMs, dismiss, open)
      val params = WindowManager.LayoutParams(
        WindowManager.LayoutParams.MATCH_PARENT,
        WindowManager.LayoutParams.WRAP_CONTENT,
        WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
        PixelFormat.TRANSLUCENT,
      ).apply {
        gravity = Gravity.TOP
        y = statusBarHeight(ctx) + dp(ctx, 8f).toInt()
      }

      try {
        wm.addView(root, params)
      } catch (e: Exception) {
        finished.set(true)
        onDone()
        return@post
      }
      current = root
      root.alpha = 0f
      root.translationY = -dp(ctx, 24f)
      root.animate().alpha(1f).translationY(0f).setDuration(260).start()
      main.postDelayed({ dismiss() }, durationMs)
    }
  }

  private fun build(ctx: Context, item: JSONObject, durationMs: Long, onClose: () -> Unit, onOpen: () -> Unit): View {
    val c = colorsFor(item.optString("type"))
    val ink = Color.parseColor("#1B1F2A")

    val frame = FrameLayout(ctx).apply {
      setPadding(dp(ctx, 12f).toInt(), 0, dp(ctx, 12f).toInt(), dp(ctx, 16f).toInt())
      clipToPadding = false
    }

    val card = LinearLayout(ctx).apply {
      orientation = LinearLayout.VERTICAL
      background = GradientDrawable().apply {
        setColor(Color.WHITE)
        cornerRadius = dp(ctx, 22f)
      }
      elevation = dp(ctx, 12f)
      clipToOutline = true
      isClickable = true
      contentDescription = "${item.optString("tag")} : ${item.optString("title")}"
      setOnClickListener { onOpen() }
    }

    val row = LinearLayout(ctx).apply {
      orientation = LinearLayout.HORIZONTAL
      val p = dp(ctx, 14f).toInt()
      setPadding(p, p, dp(ctx, 4f).toInt(), dp(ctx, 12f).toInt())
    }

    val avatarSize = dp(ctx, 44f).toInt()
    val avatar = TextView(ctx).apply {
      text = "tr"
      gravity = Gravity.CENTER
      setTextColor(c.avatarText)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 17f)
      typeface = Typeface.create("sans-serif", Typeface.BOLD)
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(c.avatarBg)
      }
      importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_NO
    }
    row.addView(avatar, LinearLayout.LayoutParams(avatarSize, avatarSize))

    val texts = LinearLayout(ctx).apply { orientation = LinearLayout.VERTICAL }
    texts.addView(TextView(ctx).apply {
      text = item.optString("tag").uppercase()
      setTextColor(c.tag)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 12f)
      letterSpacing = 0.06f
      typeface = Typeface.create("sans-serif", Typeface.BOLD)
    })
    texts.addView(TextView(ctx).apply {
      text = item.optString("title")
      setTextColor(ink)
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
      typeface = Typeface.create("sans-serif", Typeface.BOLD)
      maxLines = 2
      setPadding(0, dp(ctx, 2f).toInt(), 0, dp(ctx, 2f).toInt())
    })
    texts.addView(TextView(ctx).apply {
      text = item.optString("text")
      setTextColor(Color.parseColor("#3A3F4B"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 14f)
      setLineSpacing(0f, 1.15f)
      maxLines = 3
    })
    row.addView(texts, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply {
      marginStart = dp(ctx, 12f).toInt()
    })

    val closeSize = dp(ctx, 44f).toInt()
    row.addView(TextView(ctx).apply {
      text = "×"
      gravity = Gravity.CENTER
      setTextColor(Color.parseColor("#5B6170"))
      setTextSize(TypedValue.COMPLEX_UNIT_SP, 24f)
      contentDescription = "Fermer"
      isClickable = true
      setOnClickListener { onClose() }
    }, LinearLayout.LayoutParams(closeSize, closeSize))

    card.addView(row)

    val track = FrameLayout(ctx).apply { setBackgroundColor(Color.parseColor("#EEE9E1")) }
    val fill = View(ctx).apply {
      setBackgroundColor(c.bar)
      pivotX = 0f
    }
    track.addView(fill, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    card.addView(track, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(ctx, 4f).toInt()))
    fill.post { fill.animate().scaleX(0f).setDuration(durationMs).setInterpolator(LinearInterpolator()).start() }

    frame.addView(card, FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT))
    return frame
  }

  private fun dp(ctx: Context, value: Float): Float =
    TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, value, ctx.resources.displayMetrics)

  private fun statusBarHeight(ctx: Context): Int {
    val id = ctx.resources.getIdentifier("status_bar_height", "dimen", "android")
    return if (id > 0) ctx.resources.getDimensionPixelSize(id) else dp(ctx, 24f).toInt()
  }
}
