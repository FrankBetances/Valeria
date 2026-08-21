// ============================================================================
// Valeria+ · Integración Sensorial Auditiva — Player de Ejercicio (ISA-01)
// Módulo de desensibilización sistemática jerárquica con muro de control adulto,
// anticipación visual estricta, pausa no punitiva y Lúa en silencio clínico.
// ============================================================================
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { V } from '../valeriaTheme';
import { useT } from '../i18n';
import { getLocale } from '../valeriaLocale';
import { BlockIcon } from '../ValeriaBlockIcons';
import { CatPixel } from '../ValeriaCatPixel';
import {
  SENSORY_TRIGGER_LIST,
  getCalmStrategy,
  getTriggerLabel,
} from './sensoryCatalog';
import { recordSensorySession } from './sensoryStore';
import {
  prepareStimulus,
  startStimulus,
  stopStimulus,
  setStimulusLevel,
  releaseStimulus,
  sensoryAudioSupported,
} from './sensoryAudio';
import {
  luaSensoryReady,
  luaSensoryPause,
  luaSensoryClose,
  luaSensoryIdle,
} from '../valeriaLuaSession';
import {
  SensoryAdultConfig,
  SensoryAdultRating,
  SensoryFlowState,
  SensoryTriggerId,
} from './sensoryTypes';

export const SensoryExerciseScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const t = useT();
  const locale = getLocale();
  const exerciseId = route?.params?.exerciseId ?? 'ISA-01';

  // --- Máquina de Estados ---
  const [step, setStep] = useState<SensoryFlowState>('ADULT_PREPARATION');

  const isEcologicalActivity = exerciseId === 'ISA-06';
  const [catFilter, setCatFilter] = useState<'all' | 'ecological' | 'appliance' | 'alert'>(
    isEcologicalActivity ? 'ecological' : 'all'
  );

  // --- Configuración del Adulto ---
  const [config, setConfig] = useState<SensoryAdultConfig>({
    triggerId: isEcologicalActivity ? 'classroom_ambience' : 'vacuum',
    initialChildState: 'calm',
    relativeIntensity: 2,
    durationTier: isEcologicalActivity ? 'short' : 'micro',
    agencyMode: 'child_tap',
    stopCriterion: 'button',
  });

  // --- Estado de la Exploración / Turno ---
  const [countdown, setCountdown] = useState<number>(3);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isStimulusActive, setIsStimulusActive] = useState<boolean>(false);
  const [pausedCount, setPausedCount] = useState<number>(0);
  const [earnedXp, setEarnedXp] = useState<number>(20);

  // ¿Hay salida de audio de verdad en este aparato? En Expo web no la hay, y la
  // pantalla tiene que DECIRLO en vez de rotular "Sonido en reproducción"
  // sobre el silencio. Se resuelve una vez: el módulo nativo no aparece a
  // mitad de sesión.
  const audioReady = useRef<boolean>(sensoryAudioSupported()).current;

  // --- Valoración Adulta ---
  const [rating, setRating] = useState<SensoryAdultRating>({
    childResponse: 'calm_regulated',
    tprApplied: false,
  });

  // Animaciones de barra de progreso
  const progressAnim = useRef(new Animated.Value(0)).current;
  const targetDuration = config.durationTier === 'micro' ? 3 : config.durationTier === 'short' ? 7 : 15;

  // --------------------------------------------------------------------------
  // Carga del estímulo y limpieza del nativo
  //
  // Se precarga al elegir el sonido, no al tocar el botón: entre el dedo del
  // niño y el sonido tiene que haber siempre el mismo tiempo, y ese tiempo
  // tiene que ser cero. La agencia («mi sonido, mi botón») se sostiene en eso.
  // --------------------------------------------------------------------------
  useEffect(() => {
    void prepareStimulus(config.triggerId);
  }, [config.triggerId]);

  useEffect(() => () => {
    // Salir de la pantalla —botón atrás, gesto del sistema, lo que sea— apaga
    // el estímulo y devuelve la gata del aparato a su cara neutra. Un sonido
    // que sobrevive a su pantalla es la peor sorpresa posible en este módulo.
    stopStimulus();
    releaseStimulus();
    luaSensoryIdle();
  }, []);

  // El nivel del adulto viaja al reproductor en el acto: si lo cambia con el
  // sonido puesto, se oye el cambio. Nada aquí decide por él (ver el muro
  // regulatorio de sensoryAudio.ts).
  useEffect(() => {
    setStimulusLevel(config.relativeIntensity);
  }, [config.relativeIntensity]);

  // --------------------------------------------------------------------------
  // Efecto de Cuenta Atrás (ANTICIPATION)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'ANTICIPATION') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      } else {
        const autoStart = config.agencyMode !== 'child_tap';
        setStep('EXPLORING');
        setIsStimulusActive(autoStart);
        if (autoStart) startStimulus(config.relativeIntensity);
      }
    }
    return () => clearTimeout(timer);
  }, [step, countdown, config.agencyMode]);

  // --------------------------------------------------------------------------
  // Efecto de Reproducción / Duración del Estímulo (EXPLORING)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'EXPLORING' && isStimulusActive) {
      interval = setInterval(() => {
        setElapsedSec((prev) => {
          const next = prev + 1;
          if (next >= targetDuration) {
            stopStimulus();
            setIsStimulusActive(false);
            setStep('CLOSING');
            return targetDuration;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, isStimulusActive, targetDuration]);

  // Animar progreso
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: targetDuration > 0 ? elapsedSec / targetDuration : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [elapsedSec, targetDuration, progressAnim]);

  // Manejo de Pausa Segura (Cero penalización)
  const handleRequestPause = () => {
    stopStimulus();
    luaSensoryPause();
    setIsStimulusActive(false);
    setPausedCount((c) => c + 1);
    setStep('PAUSED');
  };

  const handleResume = () => {
    setStep('EXPLORING');
    setIsStimulusActive(true);
    startStimulus(config.relativeIntensity);
  };

  const handleFinishEarly = () => {
    stopStimulus();
    setIsStimulusActive(false);
    setStep('CLOSING');
  };

  /** El botón del niño. Es el único sitio donde el sonido arranca por su mano. */
  const handleToggleStimulus = () => {
    if (isStimulusActive) {
      stopStimulus();
      setIsStimulusActive(false);
      return;
    }
    startStimulus(config.relativeIntensity);
    setIsStimulusActive(true);
  };

  const handleSaveSession = async () => {
    const totalXp = 20 + (rating.tprApplied ? 10 : 0);
    setEarnedXp(totalXp);
    await recordSensorySession({
      exerciseId,
      triggerId: config.triggerId,
      durationSeconds: elapsedSec,
      relativeIntensity: config.relativeIntensity,
      completedFully: elapsedSec >= targetDuration,
      pausedCount,
      earnedXp: totalXp,
      adultRating: rating,
    });
    luaSensoryClose();
    setStep('COMPLETED');
  };

  const selectedTrigger = SENSORY_TRIGGER_LIST.find((s) => s.id === config.triggerId);
  const triggerLabel = getTriggerLabel(config.triggerId, locale);
  const calmStrategy = getCalmStrategy(config.triggerId, locale);
  // La píldora se llama «Alertas y Naturaleza» y agrupa las dos categorías: con
  // una igualdad estricta, la tormenta —única `nature`— desaparecía al filtrar
  // por el rótulo que la nombra.
  const filteredTriggers = SENSORY_TRIGGER_LIST.filter((item) => {
    if (catFilter === 'all') return true;
    if (catFilter === 'alert') return item.category === 'alert' || item.category === 'nature';
    return item.category === catFilter;
  });

  // ==========================================================================
  // VISTA 1: PREPARACIÓN DEL ADULTO
  // ==========================================================================
  if (step === 'ADULT_PREPARATION') {
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={s.backPill}
            accessibilityRole="button"
            accessibilityLabel={t.common.back}
          >
            <Text style={s.backPillTxt}>{`‹ ${t.common.back}`}</Text>
          </Pressable>
          <Text style={s.logoFallback}>{t.sensory.adultGateTag}</Text>
          <Text style={s.headerTitle}>{t.sensory.prepTitle}</Text>
          <Text style={s.headerSub}>{t.sensory.prepSubtitle}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Filtro por Categoría */}
          <Text style={s.sectionLabel}>{t.sensory.selectCategoryLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
            {(
              [
                { id: 'all', label: t.sensory.catAll },
                { id: 'ecological', label: t.sensory.catEcological },
                { id: 'appliance', label: t.sensory.catAppliances },
                { id: 'alert', label: t.sensory.catAlerts },
              ] as const
            ).map((cat) => {
              const active = catFilter === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCatFilter(cat.id)}
                  style={[s.catPill, active && s.catPillActive]}
                  accessibilityRole="button"
                >
                  <Text style={[s.catPillTxt, active && s.catPillTxtActive]}>{cat.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Selector de Estímulo */}
          <Text style={s.sectionLabel}>{t.sensory.selectStimulusLabel}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.triggerScroll}>
            {filteredTriggers.map((item) => {
              const active = item.id === config.triggerId;
              const lbl = item.label[locale] ?? item.label.es;
              const iconName: any =
                item.id === 'classroom_ambience'
                  ? 'classroom'
                  : item.id === 'mall_ambience'
                  ? 'mall'
                  : item.id === 'street_ambience'
                  ? 'street'
                  : 'sensory_ear';
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setConfig({ ...config, triggerId: item.id })}
                  style={[s.triggerChip, active && s.triggerChipActive]}
                  accessibilityRole="button"
                >
                  <BlockIcon
                    name={iconName}
                    color={active ? V.color.primaryDark : V.color.textSecondary}
                    size={18}
                  />
                  <Text style={[s.triggerTxt, active && s.triggerTxtActive]}>{lbl}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Tarjeta descriptiva del entorno cuando es ecológico */}
          {!!selectedTrigger?.description && (
            <View style={s.descCard}>
              <View style={s.descHeader}>
                <BlockIcon
                  name={
                    selectedTrigger.id === 'classroom_ambience'
                      ? 'classroom'
                      : selectedTrigger.id === 'mall_ambience'
                      ? 'mall'
                      : 'street'
                  }
                  color={V.color.primaryDark}
                  size={20}
                />
                <Text style={s.descTitle}>
                  {selectedTrigger.label[locale] ?? selectedTrigger.label.es}
                </Text>
              </View>
              <Text style={s.descBody}>
                {selectedTrigger.description[locale] ?? selectedTrigger.description.es}
              </Text>
            </View>
          )}

          {/* Intensidad Relativa (1 - 5) con barras de volumen */}
          <Text style={s.sectionLabel}>{t.sensory.intensityLabel}</Text>
          <View style={s.optionsRow}>
            {([1, 2, 3, 4, 5] as const).map((lvl) => {
              const active = config.relativeIntensity === lvl;
              return (
                <Pressable
                  key={lvl}
                  onPress={() => setConfig({ ...config, relativeIntensity: lvl })}
                  style={[s.levelBtn, active && s.levelBtnActive]}
                  accessibilityRole="button"
                >
                  <View style={s.levelMeterBars}>
                    {Array.from({ length: lvl }).map((_, barIdx) => (
                      <View
                        key={barIdx}
                        style={[
                          s.meterBar,
                          { height: 4 + barIdx * 3 },
                          active && s.meterBarActive,
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[s.levelTxt, active && s.levelTxtActive]}>{lvl}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={s.hintContainer}>
            <Text style={s.hintTxt}>
              {config.relativeIntensity === 1 && t.sensory.intensityHint1}
              {config.relativeIntensity === 2 && t.sensory.intensityHint2}
              {config.relativeIntensity === 3 && t.sensory.intensityHint3}
              {config.relativeIntensity === 4 && t.sensory.intensityHint4}
              {config.relativeIntensity === 5 && t.sensory.intensityHint5}
            </Text>
          </View>

          {/* Duración dosificada */}
          <Text style={s.sectionLabel}>{t.sensory.durationLabel}</Text>
          <View style={s.optionsRow}>
            {(['micro', 'short', 'medium'] as const).map((tier) => (
              <Pressable
                key={tier}
                onPress={() => setConfig({ ...config, durationTier: tier })}
                style={[s.tierBtn, config.durationTier === tier && s.tierBtnActive]}
                accessibilityRole="button"
              >
                <Text style={[s.tierTxt, config.durationTier === tier && s.tierTxtActive]}>
                  {tier === 'micro' ? t.sensory.tierMicro : tier === 'short' ? t.sensory.tierShort : t.sensory.tierMedium}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Estrategia de Calma Asociada */}
          <View style={s.tprPreviewCard}>
            <View style={s.tprHeader}>
              <BlockIcon name="calm_breath" color={V.color.primaryDark} size={18} />
              <Text style={s.tprTitle}>{t.sensory.tprStrategyTitle}</Text>
            </View>
            <Text style={s.tprBody}>{calmStrategy}</Text>
          </View>

          {/* Sin salida de audio no hay ejercicio: se dice aquí, antes de que el
              adulto le ceda el aparato al niño, y no después. */}
          {!audioReady && (
            <View style={s.noAudioBox}>
              <BlockIcon name="info" color="#b45309" size={18} />
              <Text style={s.noAudioTxt}>{t.sensory.noAudioWarning}</Text>
            </View>
          )}
        </ScrollView>

        <View style={s.footer}>
          <Pressable
            onPress={() => {
              setCountdown(3);
              setElapsedSec(0);
              // La concesión cubre cuenta atrás + exposición + margen de cierre,
              // siempre por debajo del techo de 60 s del GRANT.
              luaSensoryReady(3 + targetDuration + 10);
              setStep('ANTICIPATION');
            }}
            style={s.primaryBtn}
            accessibilityRole="button"
          >
            <Text style={s.primaryBtnTxt}>{t.sensory.startWithChildBtn}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ==========================================================================
  // VISTA 2: ANTICIPACIÓN VISUAL ESTRICTA
  // ==========================================================================
  if (step === 'ANTICIPATION') {
    return (
      <View style={[s.flex, s.centerContainer]}>
        <View style={s.anticipationCard}>
          <Text style={s.anticipationTag}>{t.sensory.anticipationKicker}</Text>
          <Text style={s.anticipationTitle}>{triggerLabel}</Text>
          <Text style={s.anticipationSub}>{t.sensory.anticipationSub}</Text>

          <View style={s.countdownCircle}>
            <Text style={s.countdownNumber}>{countdown}</Text>
          </View>

          <View style={s.luaCenter}>
            <CatPixel size={72} pose="head" />
          </View>
        </View>
      </View>
    );
  }

  // ==========================================================================
  // VISTA 3: EXPLORACIÓN Y REPRODUCCIÓN (LÚA EN SILENCIO CLÍNICO)
  // ==========================================================================
  if (step === 'EXPLORING') {
    const isPlaying = isStimulusActive;
    const isEco = selectedTrigger?.category === 'ecological';

    return (
      <View style={s.flex}>
        <View style={[s.header, { backgroundColor: isPlaying ? V.color.primary : V.color.primaryDark }]}>
          <Text style={s.logoFallback}>
            {isEco ? t.sensory.ecologicalBadge : t.sensory.exploringTag}
          </Text>
          <Text style={s.headerTitle}>{triggerLabel}</Text>
          <Text style={s.headerSub}>
            {!audioReady
              ? t.sensory.noAudioNotice
              : isPlaying
              ? t.sensory.listeningNotice
              : t.sensory.pressToStartNotice}
          </Text>

          {/* Barra de progreso visual */}
          <View style={s.progressBarTrack}>
            <Animated.View
              style={[
                s.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        </View>

        <View style={[s.flex, s.centerBody]}>
          {/* Lúa inmóvil y sin sonido durante la exposición */}
          <View style={s.luaExposureBox}>
            <CatPixel size={80} pose="sit" />
            <Text style={s.luaExposureHint}>{t.sensory.luaQuietHint}</Text>
          </View>

          {/* Rótulo descriptivo del ambiente simulado */}
          {!!selectedTrigger?.description && (
            <View style={s.ambientSceneBadge}>
              <Text style={s.ambientSceneTxt}>
                {selectedTrigger.description[locale] ?? selectedTrigger.description.es}
              </Text>
            </View>
          )}

          {/* Botón de agencia del niño (ISA-01 / ISA-06) */}
          <Pressable
            onPress={handleToggleStimulus}
            style={[s.bigActionButton, isPlaying && s.bigActionButtonPlaying]}
            accessibilityRole="button"
          >
            <BlockIcon
              name={isPlaying ? 'speaker' : 'play'}
              color="#ffffff"
              size={36}
            />
            <Text style={s.bigActionTxt}>
              {isPlaying ? t.sensory.soundActiveBtn : t.sensory.mySoundMyButton}
            </Text>
          </Pressable>

          <Text style={s.timeProgressTxt}>
            {elapsedSec}s / {targetDuration}s
          </Text>
        </View>

        {/* Botones de control y parada */}
        <View style={s.footerTwo}>
          <Pressable
            onPress={handleRequestPause}
            style={s.pauseBtn}
            accessibilityRole="button"
          >
            <BlockIcon name="timer" color={V.color.primaryDark} size={18} />
            <Text style={s.pauseBtnTxt}>{t.sensory.askPauseBtn}</Text>
          </Pressable>
          <Pressable
            onPress={handleFinishEarly}
            style={s.stopBtn}
            accessibilityRole="button"
          >
            <Text style={s.stopBtnTxt}>{t.sensory.stopActivityBtn}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ==========================================================================
  // VISTA 4: PAUSA SEGURA (CERO PENALIZACIÓN)
  // ==========================================================================
  if (step === 'PAUSED') {
    return (
      <View style={s.flex}>
        <View style={[s.header, { backgroundColor: V.color.primaryDark }]}>
          <Text style={s.logoFallback}>{t.sensory.pausedTag}</Text>
          <Text style={s.headerTitle}>{t.sensory.pausedTitle}</Text>
          <Text style={s.headerSub}>{t.sensory.pausedSubtitle}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <View style={s.pauseCard}>
            <View style={s.luaCenter}>
              <CatPixel size={64} pose="head" />
            </View>
            <Text style={s.pauseCardTitle}>{t.sensory.stoppingIsOkTitle}</Text>
            <Text style={s.pauseCardBody}>{t.sensory.stoppingIsOkBody}</Text>

            {/* Estrategia TPR sugerida */}
            <View style={s.tprStrategyBox}>
              <Text style={s.tprBoxTitle}>{t.sensory.tryThisStrategy}</Text>
              <Text style={s.tprBoxBody}>{calmStrategy}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={s.footerTwo}>
          <Pressable onPress={handleResume} style={s.primaryHalfBtn}>
            <Text style={s.primaryBtnTxt}>{t.sensory.resumeBtn}</Text>
          </Pressable>
          <Pressable onPress={handleFinishEarly} style={s.secondaryHalfBtn}>
            <Text style={s.secondaryBtnTxt}>{t.sensory.closeAndRateBtn}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ==========================================================================
  // VISTA 5: VALORACIÓN Y CIERRE ADULTO (CLOSING)
  // ==========================================================================
  if (step === 'CLOSING') {
    return (
      <View style={s.flex}>
        <View style={s.header}>
          <Text style={s.logoFallback}>{t.sensory.sessionCloseTag}</Text>
          <Text style={s.headerTitle}>{t.sensory.sessionSummaryTitle}</Text>
          <Text style={s.headerSub}>{t.sensory.sessionSummarySub}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <Text style={s.sectionLabel}>{t.sensory.childResponseLabel}</Text>
          {(
            [
              { key: 'calm_regulated', title: t.sensory.respCalm },
              { key: 'attentive_curious', title: t.sensory.respAttentive },
              { key: 'sensitive_paused', title: t.sensory.respSensitive },
              { key: 'overwhelmed_stopped', title: t.sensory.respOverwhelmed },
            ] as const
          ).map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setRating({ ...rating, childResponse: item.key })}
              style={[
                s.ratingRow,
                rating.childResponse === item.key && s.ratingRowActive,
              ]}
            >
              <Text
                style={[
                  s.ratingTxt,
                  rating.childResponse === item.key && s.ratingTxtActive,
                ]}
              >
                {item.title}
              </Text>
            </Pressable>
          ))}

          {/* Toggle TPR */}
          <Pressable
            onPress={() => setRating({ ...rating, tprApplied: !rating.tprApplied })}
            style={[s.tprToggle, rating.tprApplied && s.tprToggleActive]}
          >
            <BlockIcon
              name={rating.tprApplied ? 'check' : 'calm_breath'}
              color={rating.tprApplied ? V.color.success : V.color.textSecondary}
              size={20}
            />
            <Text style={s.tprToggleTxt}>{t.sensory.tprAppliedToggle}</Text>
          </Pressable>
        </ScrollView>

        <View style={s.footer}>
          <Pressable onPress={handleSaveSession} style={s.primaryBtn}>
            <Text style={s.primaryBtnTxt}>{t.sensory.saveSessionBtn}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // ==========================================================================
  // VISTA 6: RESULTADO FINAL Y REFUERZO POSITIVO (COMPLETED)
  // ==========================================================================
  return (
    <View style={[s.flex, s.centerContainer]}>
      <View style={s.completedCard}>
        <View style={s.luaCenter}>
          <CatPixel size={80} pose="sit" />
        </View>
        <Text style={s.completedTitle}>{t.sensory.wellDoneTitle}</Text>
        <Text style={s.completedSub}>{t.sensory.wellDoneSub}</Text>

        <View style={s.xpRewardBox}>
          <Text style={s.xpRewardTxt}>+{earnedXp} XP</Text>
          <Text style={s.xpRewardSub}>{t.sensory.xpAddedToSensorySilo}</Text>
        </View>

        <Pressable
          onPress={() => navigation.goBack()}
          style={s.primaryBtn}
          accessibilityRole="button"
        >
          <Text style={s.primaryBtnTxt}>{t.sensory.backToSensoryListBtn}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: V.color.pageBg },
  centerContainer: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    backgroundColor: V.color.primaryDark,
    paddingTop: 18,
    paddingHorizontal: 22,
    paddingBottom: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  backPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.32)',
    borderRadius: 11,
    paddingHorizontal: 11,
    paddingVertical: 5,
    marginBottom: 10,
  },
  backPillTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  logoFallback: {
    color: 'rgba(255,255,255,.9)',
    fontWeight: '800',
    fontSize: 11.5,
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: { color: '#fff', fontSize: 23, fontWeight: '800', letterSpacing: -0.4 },
  headerSub: {
    color: 'rgba(255,255,255,.92)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 18,
  },

  scroll: { padding: 18, paddingBottom: 32 },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: V.color.textPrimary,
    marginTop: 14,
    marginBottom: 8,
  },
  catScroll: { flexDirection: 'row', marginBottom: 12 },
  catPill: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginRight: 8,
  },
  catPillActive: { backgroundColor: V.color.primaryDark, borderColor: V.color.primaryDark },
  catPillTxt: { fontSize: 12, fontWeight: '700', color: V.color.textPrimary },
  catPillTxtActive: { color: '#ffffff', fontWeight: '800' },

  triggerScroll: { flexDirection: 'row', marginBottom: 12 },
  triggerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  triggerChipActive: { backgroundColor: V.color.primaryLight, borderColor: V.color.primaryDark },
  triggerTxt: { fontSize: 13, fontWeight: '700', color: V.color.textPrimary },
  triggerTxtActive: { color: V.color.primaryDark, fontWeight: '800' },

  descCard: {
    backgroundColor: V.color.primaryTint,
    borderWidth: 1,
    borderColor: '#cdeeec',
    borderRadius: 14,
    padding: 13,
    marginBottom: 12,
  },
  descHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 5 },
  descTitle: { fontSize: 13.5, fontWeight: '800', color: V.color.primaryDark },
  descBody: { fontSize: 12.5, fontWeight: '600', color: V.color.textPrimary, lineHeight: 18 },

  ambientSceneBadge: {
    backgroundColor: '#e6f7f6',
    borderWidth: 1,
    borderColor: '#b2ebe7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 14,
    marginHorizontal: 16,
  },
  ambientSceneTxt: {
    fontSize: 12.5,
    fontWeight: '700',
    color: V.color.primaryDark,
    textAlign: 'center',
    lineHeight: 17,
  },

  optionsRow: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  levelBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBtnActive: { backgroundColor: V.color.primaryDark, borderColor: V.color.primaryDark },
  levelMeterBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 16, marginBottom: 4 },
  meterBar: { width: 3, backgroundColor: '#cbd5e1', borderRadius: 2 },
  meterBarActive: { backgroundColor: '#ffffff' },
  levelTxt: { fontSize: 14, fontWeight: '800', color: V.color.textPrimary },
  levelTxtActive: { color: '#ffffff' },
  hintContainer: { backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  hintTxt: { fontSize: 12, fontWeight: '600', color: V.color.textSecondary },

  tierBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tierBtnActive: { backgroundColor: V.color.primaryDark, borderColor: V.color.primaryDark },
  tierTxt: { fontSize: 13, fontWeight: '700', color: V.color.textPrimary },
  tierTxtActive: { color: '#ffffff', fontWeight: '800' },

  tprPreviewCard: {
    backgroundColor: V.color.primaryTint,
    borderWidth: 1,
    borderColor: '#cdeeec',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  tprHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  tprTitle: { fontSize: 13, fontWeight: '800', color: V.color.primaryDark },
  tprBody: { fontSize: 12.5, fontWeight: '600', color: V.color.textPrimary, lineHeight: 18 },

  footer: { padding: 16, paddingBottom: 22, backgroundColor: V.color.pageBg },
  footerTwo: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 22, backgroundColor: V.color.pageBg },
  primaryBtn: {
    backgroundColor: V.color.primaryDark,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    ...V.shadow.button,
  },
  primaryBtnTxt: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
  primaryHalfBtn: {
    flex: 1,
    backgroundColor: V.color.primaryDark,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryHalfBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  secondaryBtnTxt: { color: V.color.textSecondary, fontSize: 14, fontWeight: '800' },

  // Anticipación
  anticipationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    width: '100%',
    ...V.shadow.card,
  },
  anticipationTag: { fontSize: 11, fontWeight: '800', color: V.color.primaryDark, letterSpacing: 1 },
  anticipationTitle: { fontSize: 24, fontWeight: '800', color: V.color.textPrimary, marginTop: 4 },
  anticipationSub: { fontSize: 13.5, fontWeight: '600', color: V.color.textSecondary, marginTop: 6 },
  countdownCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e6f9f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  countdownNumber: { fontSize: 40, fontWeight: '800', color: V.color.primaryDark },
  luaCenter: { alignItems: 'center', marginVertical: 10 },

  // Exploración
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,.3)',
    marginTop: 14,
    overflow: 'hidden',
  },
  progressBarFill: { height: 8, backgroundColor: '#ffffff', borderRadius: 4 },
  centerBody: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  luaExposureBox: { alignItems: 'center', marginBottom: 30 },
  luaExposureHint: { fontSize: 12, fontWeight: '600', color: V.color.textSecondary, marginTop: 8 },
  bigActionButton: {
    backgroundColor: V.color.primaryDark,
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...V.shadow.button,
  },
  bigActionButtonPlaying: { backgroundColor: V.color.primary },
  noAudioBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
  },
  noAudioTxt: { flex: 1, fontSize: 13, fontWeight: '700', color: '#92400e' },
  bigActionTxt: { color: '#ffffff', fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  timeProgressTxt: { fontSize: 15, fontWeight: '700', color: V.color.textSecondary, marginTop: 20 },
  pauseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 14,
    paddingVertical: 14,
  },
  pauseBtnTxt: { fontSize: 14, fontWeight: '800', color: V.color.primaryDark },
  stopBtn: {
    flex: 1,
    backgroundColor: '#fee2e2',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  stopBtnTxt: { fontSize: 14, fontWeight: '800', color: '#dc2626' },

  // Pausa
  pauseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    ...V.shadow.card,
  },
  pauseCardTitle: { fontSize: 19, fontWeight: '800', color: V.color.textPrimary, marginTop: 8 },
  pauseCardBody: { fontSize: 13.5, fontWeight: '600', color: V.color.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  tprStrategyBox: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 14,
    padding: 14,
    marginTop: 18,
    alignSelf: 'stretch',
  },
  tprBoxTitle: { fontSize: 13, fontWeight: '800', color: '#1d4ed8', marginBottom: 4 },
  tprBoxBody: { fontSize: 13, fontWeight: '600', color: '#1e3a8a', lineHeight: 18 },

  // Cierre y Rating
  ratingRow: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 12,
    padding: 15,
    marginBottom: 8,
  },
  ratingRowActive: { backgroundColor: V.color.primaryLight, borderColor: V.color.primaryDark },
  ratingTxt: { fontSize: 14, fontWeight: '700', color: V.color.textPrimary },
  ratingTxtActive: { color: V.color.primaryDark, fontWeight: '800' },
  tprToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: V.color.border,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  tprToggleActive: { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  tprToggleTxt: { flex: 1, fontSize: 13.5, fontWeight: '700', color: V.color.textPrimary },

  // Completado
  completedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 26,
    alignItems: 'center',
    width: '100%',
    ...V.shadow.card,
  },
  completedTitle: { fontSize: 22, fontWeight: '800', color: V.color.textPrimary, marginTop: 10 },
  completedSub: { fontSize: 13.5, fontWeight: '600', color: V.color.textSecondary, textAlign: 'center', marginTop: 6 },
  xpRewardBox: {
    backgroundColor: '#fef9c3',
    borderWidth: 1,
    borderColor: '#fef08a',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    marginVertical: 20,
  },
  xpRewardTxt: { fontSize: 26, fontWeight: '800', color: '#a16207' },
  xpRewardSub: { fontSize: 11.5, fontWeight: '700', color: '#a16207', marginTop: 2 },
});

export default SensoryExerciseScreen;
