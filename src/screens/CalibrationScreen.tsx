import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch } from '../store/store';
import { useTheme } from '../hooks/useTheme';
import { useDevice } from '../hooks/useDevice';
import { deviceService } from '../services/DeviceService';
import { updateCalibration } from '../store/settingsSlice';
import { storageService } from '../storage/storage';
import { validateCalibration } from '../utils/validation';
import { Header } from '../components/common/Header';
import { StatusCard } from '../components/common/StatusCard';
import { HandVisualization } from '../components/controls/HandVisualization';
import { KinematicArcGauge } from '../components/controls/KinematicArcGauge';
import { ControlButton } from '../components/common/ControlButton';
import { CheckCircleIcon } from '../components/common/SvgIcons';
import { addLog } from '../store/logsSlice';

export const CalibrationScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const { position, isConnected, settings } = useDevice();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [openAngle, setOpenAngle] = useState<number>(0.0);
  const [closedAngle, setClosedAngle] = useState<number>(63.0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (step === 3) {
          setStep(2);
          return true;
        }
        if (step === 2) {
          setStep(1);
          return true;
        }
        // If at step 1, pop back to the previous screen
        navigation.goBack();
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => backHandler.remove();
    }, [step, navigation])
  );

  const handleNudge = (delta: number) => {
    const nextAngle = Math.max(0, Math.min(90, position + delta));
    deviceService.setCalibrationAngle(nextAngle);
  };

  const handleSetOpenPosition = () => {
    const angle = parseFloat(position.toFixed(1));
    setOpenAngle(angle);
    setErrorMessage(null);
    setStep(2);
  };

  const handleSetClosedPosition = () => {
    const angle = parseFloat(position.toFixed(1));
    setClosedAngle(angle);

    const validation = validateCalibration(openAngle, angle);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid calibration bounds');
      return;
    }

    setErrorMessage(null);
    setStep(3);
  };

  const handleSaveCalibration = async () => {
    const validation = validateCalibration(openAngle, closedAngle);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid calibration bounds');
      return;
    }

    const newCalibData = {
      minimumAngle: openAngle,
      maximumAngle: closedAngle,
      calibratedAt: new Date().toISOString(),
      isValid: true,
    };

    dispatch(updateCalibration(newCalibData));
    deviceService.syncSettings({ minimumAngle: openAngle, maximumAngle: closedAngle });
    await storageService.saveCalibration(newCalibData);

    dispatch(
      addLog(
        'CALIBRATION',
        'Actuator Calibration Saved',
        `New mechanical bounds set: Min ${openAngle}° (Open) - Max ${closedAngle}° (Closed)`
      )
    );

    Alert.alert(
      'Calibration Complete',
      `DAKSH-01 calibrated successfully!\nOpen: ${openAngle}° | Closed: ${closedAngle}°`,
      [
        {
          text: 'Return to Controls',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleResetWizard = () => {
    setStep(1);
    setOpenAngle(0.0);
    setClosedAngle(63.0);
    setErrorMessage(null);
  };

  return (
    <SafeAreaView
      edges={['bottom', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <Header
        subtitle="CALIBRATION WIZARD"
        showBackButton
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Step Indicator Tracker - Interactive Taps */}
        <View
          style={[
            styles.stepsTracker,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.surfaceBorder },
          ]}
        >
          <TouchableOpacity
            style={styles.stepItem}
            activeOpacity={0.7}
            onPress={() => setStep(1)}
          >
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    step >= 1 ? theme.colors.primary : theme.colors.surfaceHighlight,
                },
              ]}
            >
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <Text style={[styles.stepText, { color: step === 1 ? theme.colors.primary : theme.colors.textPrimary }]}>
              OPEN LIMIT
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.stepLine,
              {
                backgroundColor:
                  step >= 2 ? theme.colors.primary : theme.colors.surfaceBorder,
              },
            ]}
          />

          <TouchableOpacity
            style={styles.stepItem}
            activeOpacity={0.7}
            onPress={() => setStep(2)}
          >
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    step >= 2 ? theme.colors.primary : theme.colors.surfaceHighlight,
                },
              ]}
            >
              <Text style={styles.stepNumber}>2</Text>
            </View>
            <Text style={[styles.stepText, { color: step === 2 ? theme.colors.primary : theme.colors.textPrimary }]}>
              CLOSED LIMIT
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.stepLine,
              {
                backgroundColor:
                  step === 3 ? theme.colors.primary : theme.colors.surfaceBorder,
              },
            ]}
          />

          <TouchableOpacity
            style={styles.stepItem}
            activeOpacity={0.7}
            onPress={() => setStep(3)}
          >
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    step === 3 ? theme.colors.primary : theme.colors.surfaceHighlight,
                },
              ]}
            >
              <Text style={styles.stepNumber}>3</Text>
            </View>
            <Text style={[styles.stepText, { color: step === 3 ? theme.colors.primary : theme.colors.textPrimary }]}>
              CONFIRM
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Kinematic Arc Gauge & Hand Display */}
        <StatusCard title="REAL-TIME ACTUATION FEEDBACK" subtitle="DAKSH-01 bionic hand is actively moving">
          <KinematicArcGauge
            angle={position}
            minAngle={0}
            maxAngle={step === 2 ? Math.max(position, 63) : settings.maximumAngle}
            size={220}
            label={step === 1 ? 'Set Open Limit (0° - 20°)' : 'Set Closed Limit (40° - 90°)'}
          />

          {/* Micro Nudge Controls for Calibration Position */}
          <View style={styles.nudgeContainer}>
            <Text style={[styles.nudgeTitle, { color: theme.colors.textMuted }]}>
              FINE-TUNING NUDGE BUTTONS:
            </Text>
            <View style={styles.nudgeButtons}>
              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={() => handleNudge(-5)}
                disabled={!isConnected}
              >
                <Text style={[styles.nudgeText, { color: theme.colors.textPrimary }]}>
                  -5°
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={() => handleNudge(-1)}
                disabled={!isConnected}
              >
                <Text style={[styles.nudgeText, { color: theme.colors.textPrimary }]}>
                  -1°
                </Text>
              </TouchableOpacity>
              <View
                style={[
                  styles.currentReadout,
                  { borderColor: theme.colors.primary, backgroundColor: theme.colors.surfaceElevated },
                ]}
              >
                <Text style={[styles.currentVal, { color: theme.colors.primary }]}>
                  {position.toFixed(1)}°
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={() => handleNudge(1)}
                disabled={!isConnected}
              >
                <Text style={[styles.nudgeText, { color: theme.colors.textPrimary }]}>
                  +1°
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nudgeBtn, { backgroundColor: theme.colors.surfaceHighlight }]}
                onPress={() => handleNudge(5)}
                disabled={!isConnected}
              >
                <Text style={[styles.nudgeText, { color: theme.colors.textPrimary }]}>
                  +5°
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </StatusCard>

        {/* Error Feedback */}
        {errorMessage && (
          <View
            style={[
              styles.errorBox,
              { backgroundColor: theme.colors.dangerDim, borderColor: theme.colors.danger },
            ]}
          >
            <Text style={[styles.errorTitle, { color: theme.colors.danger }]}>
              CALIBRATION VALIDATION FAILED
            </Text>
            <Text style={[styles.errorDesc, { color: theme.colors.textPrimary }]}>
              {errorMessage}
            </Text>
          </View>
        )}

        {/* Step 1: Open Position */}
        {step === 1 && (
          <StatusCard
            title="STEP 1: FULLY OPEN POSITION"
            subtitle="Move hand to 0.0° or desired mechanical open stop"
          >
            <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>
              Use the nudge buttons above to position the bionic fingers at full open extension (recommended 0.0°).
            </Text>
            <ControlButton
              label="SAVE OPEN LIMIT & NEXT →"
              sublabel={`Capture ${position.toFixed(1)}° as Minimum Limit`}
              variant="success"
              size="large"
              onPress={handleSetOpenPosition}
              disabled={!isConnected}
              style={styles.actionBtn}
            />
          </StatusCard>
        )}

        {/* Step 2: Closed Position */}
        {step === 2 && (
          <StatusCard
            title="STEP 2: FULLY CLOSED POSITION"
            subtitle="Move hand to 63.0° or desired grip closure limit"
          >
            <Text style={[styles.guideText, { color: theme.colors.textSecondary }]}>
              Captured Open Angle: <Text style={[styles.highlightValue, { color: theme.colors.success }]}>{openAngle}°</Text>
              {'\n'}Now nudge the hand until the fingers are comfortably closed around a grasp (recommended 63.0°).
            </Text>
            <ControlButton
              label="SAVE CLOSED LIMIT & NEXT →"
              sublabel={`Capture ${position.toFixed(1)}° as Maximum Limit`}
              variant="primary"
              size="large"
              onPress={handleSetClosedPosition}
              disabled={!isConnected}
              style={styles.actionBtn}
            />
            <TouchableOpacity style={styles.backStep} onPress={() => setStep(1)}>
              <Text style={[styles.backStepText, { color: theme.colors.textMuted }]}>
                ◀ Back to Step 1
              </Text>
            </TouchableOpacity>
          </StatusCard>
        )}

        {/* Step 3: Review & Save */}
        {step === 3 && (
          <StatusCard
            title="STEP 3: REVIEW & SAVE CALIBRATION"
            subtitle="Verify angle boundaries and commit to non-volatile memory"
          >
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>
                  NEW OPEN POSITION:
                </Text>
                <Text style={[styles.summaryVal, { color: theme.colors.servoOpen }]}>
                  {openAngle}°
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>
                  NEW CLOSED POSITION:
                </Text>
                <Text style={[styles.summaryVal, { color: theme.colors.secondary }]}>
                  {closedAngle}°
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: theme.colors.textMuted }]}>
                  EFFECTIVE MOTION SPAN:
                </Text>
                <Text style={[styles.summaryVal, { color: theme.colors.primary }]}>
                  {(closedAngle - openAngle).toFixed(1)}°
                </Text>
              </View>
            </View>

            <ControlButton
              label="SAVE & COMMIT CALIBRATION"
              icon={<CheckCircleIcon size={20} color="#080C14" />}
              variant="success"
              size="large"
              onPress={handleSaveCalibration}
              disabled={!isConnected}
              style={styles.actionBtn}
            />

            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.quickNavBtn, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.surfaceBorder }]}
                onPress={() => navigation.navigate('Main', { screen: 'Controls' })}
              >
                <Text style={[styles.quickNavText, { color: theme.colors.primary }]}>
                  ← CONTROLS STUDIO
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickNavBtn, { backgroundColor: theme.colors.surfaceHighlight, borderColor: theme.colors.surfaceBorder }]}
                onPress={() => navigation.navigate('Main', { screen: 'Dashboard' })}
              >
                <Text style={[styles.quickNavText, { color: theme.colors.primary }]}>
                  DASHBOARD →
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.backStep} onPress={handleResetWizard}>
              <Text style={[styles.backStepText, { color: theme.colors.textMuted }]}>
                ↺ Restart Calibration Wizard
              </Text>
            </TouchableOpacity>
          </StatusCard>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stepsTracker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
    marginBottom: 14,
  },
  nudgeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  nudgeTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  nudgeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  nudgeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nudgeText: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  currentReadout: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  currentVal: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  guideText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  actionBtn: {
    width: '100%',
    marginTop: 6,
  },
  backStep: {
    alignSelf: 'center',
    marginTop: 12,
    padding: 6,
  },
  backStepText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  errorDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  summaryCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  highlightValue: {
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  quickNavBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickNavText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
