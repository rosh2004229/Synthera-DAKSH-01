import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useDevice } from '../../hooks/useDevice';
import { ControlButton } from '../common/ControlButton';
import { StopCircleIcon } from '../common/SvgIcons';

export const ManualControls: React.FC = React.memo(() => {
  const {
    openHand,
    closeHand,
    emergencyStop,
    handState,
    isConnected,
    isCriticalBattery,
  } = useDevice();

  const isOpening = handState === 'OPENING';
  const isClosing = handState === 'CLOSING';
  const isOpen = handState === 'OPEN';
  const isClosed = handState === 'CLOSED';

  const isDisabled = !isConnected || isCriticalBattery;

  return (
    <View style={styles.container}>
      {/* Primary Movement Controls */}
      <View style={styles.buttonRow}>
        <ControlButton
          label="OPEN HAND"
          sublabel="0° Fully Open"
          variant="success"
          size="large"
          onPress={openHand}
          disabled={isDisabled}
          loading={isOpening}
          style={styles.flexBtn}
          accessibilityLabel="Open Prosthetic Hand to 0 degrees"
        />

        <ControlButton
          label="CLOSE HAND"
          sublabel="63° Grip Closed"
          variant="secondary"
          size="large"
          onPress={closeHand}
          disabled={isDisabled}
          loading={isClosing}
          style={styles.flexBtn}
          accessibilityLabel="Close Prosthetic Hand to 63 degrees"
        />
      </View>

      {/* Prominent Emergency STOP Button */}
      <ControlButton
        label="EMERGENCY STOP"
        sublabel="Halt All Actuation Immediately"
        icon={<StopCircleIcon size={22} color="#FFFFFF" />}
        variant="danger"
        size="emergency"
        onPress={emergencyStop}
        disabled={!isConnected}
        style={styles.emergencyBtn}
        accessibilityLabel="Emergency Stop Prosthetic Hand"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  flexBtn: {
    flex: 1,
  },
  emergencyBtn: {
    width: '100%',
    marginTop: 4,
  },
});
