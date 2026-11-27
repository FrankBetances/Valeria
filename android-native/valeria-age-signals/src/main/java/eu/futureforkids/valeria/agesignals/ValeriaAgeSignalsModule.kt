package eu.futureforkids.valeria.agesignals

import android.app.Activity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.play.agesignals.AgeSignalsAccessRequest
import com.google.android.play.agesignals.AgeSignalsException
import com.google.android.play.agesignals.AgeSignalsManager
import com.google.android.play.agesignals.AgeSignalsManagerFactory
import com.google.android.play.agesignals.AgeSignalsRequest
import com.google.android.play.agesignals.AgeSignalsResult
import com.google.android.play.agesignals.ApplicableAgeFeaturesRequest
import com.google.android.play.agesignals.model.AgeRangeSource
import com.google.android.play.agesignals.model.AgeSignalsStatus
import com.google.android.play.agesignals.model.ApplicableAgeFeature
import com.google.android.play.agesignals.model.SignificantChangeStatus
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone

data class AgeSignalSnapshot(
    val status: String,
    val ageLower: Int? = null,
    val ageUpper: Int? = null,
    val ageRangeSource: String? = null,
    val significantChangeStatus: String? = null,
    val significantChangeApprovalDate: String? = null,
    val installId: String? = null,
    val mandatory: Boolean? = null,
    val error: String? = null,
)

object AgeSignalsEvaluator {
    fun evaluate(
        manager: AgeSignalsManager,
        activity: Activity?,
        onComplete: (AgeSignalSnapshot) -> Unit,
    ) {
        val featuresRequest = ApplicableAgeFeaturesRequest.builder().build()
        manager.getApplicableAgeFeatures(featuresRequest)
            .addOnSuccessListener { featuresResult ->
                val mandatory = featuresResult.features().contains(ApplicableAgeFeature.MANDATORY_SHARING)
                requestAccess(manager, activity, mandatory, onComplete)
            }
            .addOnFailureListener { exc ->
                onComplete(
                    AgeSignalSnapshot(
                        status = "ERROR",
                        error = extractErrorCode(exc),
                    ),
                )
            }
    }

    private fun requestAccess(
        manager: AgeSignalsManager,
        activity: Activity?,
        mandatory: Boolean,
        onComplete: (AgeSignalSnapshot) -> Unit,
    ) {
        if (activity == null) {
            onComplete(
                AgeSignalSnapshot(
                    status = "UNAVAILABLE",
                    mandatory = mandatory,
                    error = "NO_ACTIVITY",
                ),
            )
            return
        }
        val accessRequest = AgeSignalsAccessRequest.builder()
            .setActivity(activity)
            .build()
        manager.requestAgeSignalsAccess(accessRequest)
            .addOnSuccessListener { accessResult ->
                when (accessResult.ageSignalsStatus()) {
                    AgeSignalsStatus.SHARED -> fetchSignals(manager, mandatory, onComplete)
                    AgeSignalsStatus.NOT_SHARED -> onComplete(
                        AgeSignalSnapshot(status = "NOT_SHARED", mandatory = mandatory),
                    )
                    AgeSignalsStatus.VERIFICATION_REQUIRED -> onComplete(
                        AgeSignalSnapshot(status = "VERIFICATION_REQUIRED", mandatory = mandatory),
                    )
                    else -> onComplete(
                        AgeSignalSnapshot(status = "UNKNOWN", mandatory = mandatory),
                    )
                }
            }
            .addOnFailureListener { exc ->
                onComplete(
                    AgeSignalSnapshot(
                        status = "ERROR",
                        mandatory = mandatory,
                        error = extractErrorCode(exc),
                    ),
                )
            }
    }

    private fun fetchSignals(
        manager: AgeSignalsManager,
        mandatory: Boolean,
        onComplete: (AgeSignalSnapshot) -> Unit,
    ) {
        manager.checkAgeSignals(AgeSignalsRequest.builder().build())
            .addOnSuccessListener { result ->
                onComplete(mapResult(result, mandatory))
            }
            .addOnFailureListener { exc ->
                onComplete(
                    AgeSignalSnapshot(
                        status = "ERROR",
                        mandatory = mandatory,
                        error = extractErrorCode(exc),
                    ),
                )
            }
    }

    fun mapResult(result: AgeSignalsResult, mandatory: Boolean): AgeSignalSnapshot {
        val ageRangeSource = when (result.ageRangeSource()) {
            AgeRangeSource.TIER_A -> "TIER_A"
            AgeRangeSource.TIER_B -> "TIER_B"
            AgeRangeSource.TIER_C -> "TIER_C"
            AgeRangeSource.TIER_D -> "TIER_D"
            else -> null
        }
        val significantChangeStatus = when (result.significantChangeStatus()) {
            SignificantChangeStatus.APPROVED -> "APPROVED"
            SignificantChangeStatus.PENDING -> "PENDING"
            SignificantChangeStatus.DECLINED -> "DECLINED"
            else -> null
        }
        val isoDate = result.significantChangeApprovalDate()?.let { date ->
            val fmt = SimpleDateFormat("yyyy-MM-dd", Locale.US)
            fmt.timeZone = TimeZone.getTimeZone("UTC")
            fmt.format(date)
        }
        return AgeSignalSnapshot(
            status = "SHARED",
            ageLower = result.ageLower(),
            ageUpper = result.ageUpper(),
            ageRangeSource = ageRangeSource,
            significantChangeStatus = significantChangeStatus,
            significantChangeApprovalDate = isoDate,
            installId = result.installId(),
            mandatory = mandatory,
        )
    }

    private fun extractErrorCode(exc: Exception): String =
        if (exc is AgeSignalsException) {
            exc.errorCode.toString()
        } else {
            exc.javaClass.simpleName
        }
}

class ValeriaAgeSignalsModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "ValeriaAgeSignals"

    @ReactMethod
    fun check(promise: Promise) {
        val manager = try {
            AgeSignalsManagerFactory.create(reactContext.applicationContext)
        } catch (t: Throwable) {
            val map = Arguments.createMap().apply {
                putString("status", "UNAVAILABLE")
                putString("error", t.javaClass.simpleName)
            }
            promise.resolve(map)
            return
        }

        AgeSignalsEvaluator.evaluate(manager, reactContext.currentActivity) { snap ->
            val map = Arguments.createMap().apply {
                putString("status", snap.status)
                snap.ageLower?.let { putInt("ageLower", it) }
                snap.ageUpper?.let { putInt("ageUpper", it) }
                snap.ageRangeSource?.let { putString("ageRangeSource", it) }
                snap.significantChangeStatus?.let { putString("significantChangeStatus", it) }
                snap.significantChangeApprovalDate?.let { putString("significantChangeApprovalDate", it) }
                snap.installId?.let { putString("installId", it) }
                snap.mandatory?.let { putBoolean("mandatory", it) }
                snap.error?.let { putString("error", it) }
            }
            promise.resolve(map)
        }
    }
}
