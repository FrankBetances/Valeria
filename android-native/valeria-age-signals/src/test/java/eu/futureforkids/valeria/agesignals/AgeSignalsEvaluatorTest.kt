package eu.futureforkids.valeria.agesignals

import com.google.android.play.agesignals.AgeSignalsAccessRequest
import com.google.android.play.agesignals.AgeSignalsAccessResult
import com.google.android.play.agesignals.AgeSignalsException
import com.google.android.play.agesignals.AgeSignalsRequest
import com.google.android.play.agesignals.AgeSignalsResult
import com.google.android.play.agesignals.ApplicableAgeFeaturesRequest
import com.google.android.play.agesignals.ApplicableAgeFeaturesResult
import com.google.android.play.agesignals.model.AgeRangeSource
import com.google.android.play.agesignals.model.AgeSignalsErrorCode
import com.google.android.play.agesignals.model.AgeSignalsStatus
import com.google.android.play.agesignals.model.ApplicableAgeFeature
import com.google.android.play.agesignals.testing.FakeAgeSignalsManager
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AgeSignalsEvaluatorTest {

    @Test
    fun adultVerifiedMapsAsAdultWithNullUpper() {
        val manager = FakeAgeSignalsManager()
        val adult = AgeSignalsResult.builder()
            .setAgeRangeSource(AgeRangeSource.TIER_D)
            .setAgeLower(18)
            .build()
        manager.setNextAgeSignalsResult(adult)

        val task = manager.checkAgeSignals(AgeSignalsRequest.builder().build())
        val snap = AgeSignalsEvaluator.mapResult(task.result, mandatory = true)

        assertEquals("SHARED", snap.status)
        assertEquals(18, snap.ageLower)
        assertNull(snap.ageUpper)
        assertEquals("TIER_D", snap.ageRangeSource)
        assertEquals(true, snap.mandatory)
    }

    @Test
    fun supervisedMinorMapsRangeAndInstallId() {
        val manager = FakeAgeSignalsManager()
        val minor = AgeSignalsResult.builder()
            .setAgeRangeSource(AgeRangeSource.TIER_B)
            .setAgeLower(13)
            .setAgeUpper(15)
            .setInstallId("fake_install_id")
            .build()
        manager.setNextAgeSignalsResult(minor)

        val task = manager.checkAgeSignals(AgeSignalsRequest.builder().build())
        val snap = AgeSignalsEvaluator.mapResult(task.result, mandatory = false)

        assertEquals("SHARED", snap.status)
        assertEquals(13, snap.ageLower)
        assertEquals(15, snap.ageUpper)
        assertEquals("TIER_B", snap.ageRangeSource)
        assertEquals("fake_install_id", snap.installId)
    }

    @Test
    fun apiNotAvailableExceptionIsHandled() {
        val manager = FakeAgeSignalsManager()
        manager.setNextAgeSignalsException(AgeSignalsException(AgeSignalsErrorCode.API_NOT_AVAILABLE))
        val task = manager.checkAgeSignals(AgeSignalsRequest.builder().build())
        assertTrue(task.exception is AgeSignalsException)
    }

    @Test
    fun notSharedFeaturesAreReadable() {
        val manager = FakeAgeSignalsManager()
        manager.setNextApplicableAgeFeaturesResult(
            ApplicableAgeFeaturesResult.builder()
                .setFeatures(setOf(ApplicableAgeFeature.MANDATORY_SHARING))
                .build(),
        )
        manager.setNextAgeSignalsAccessResult(
            AgeSignalsAccessResult.builder()
                .setAgeSignalsStatus(AgeSignalsStatus.NOT_SHARED)
                .build(),
        )
        val features = manager.getApplicableAgeFeatures(ApplicableAgeFeaturesRequest.builder().build()).result
        assertTrue(features.features().contains(ApplicableAgeFeature.MANDATORY_SHARING))
    }
}
