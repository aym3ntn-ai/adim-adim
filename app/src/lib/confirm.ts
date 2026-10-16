import { Alert, Platform } from 'react-native';

/** Asks before a destructive action; Alert has no buttons on the web, so the browser asks there. */
export function confirmDestructive(title: string, body: string, action: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${body}`)) onConfirm();
    return;
  }
  Alert.alert(title, body, [
    { text: 'Annuler', style: 'cancel' },
    { text: action, style: 'destructive', onPress: onConfirm },
  ]);
}
