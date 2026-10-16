import Constants from 'expo-constants';
import { Info } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Alert, Platform, Switch, View } from 'react-native';
import { openOverlaySettings, overlaySupported, showNow } from '../../../modules/revision-overlay';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { T } from '@/components/T';
import { Tap } from '@/components/Tap';
import { popups } from '@/content';
import type { PopupType } from '@/content/types';
import { confirmDestructive } from '@/lib/confirm';
import { useOverlayPermission } from '@/lib/overlay';
import { POPUP_TYPES, TYPE_LABEL, selectPopups, toNativeItem } from '@/lib/popups';
import { useProgress } from '@/store/progress';
import { useSettings, type ThemeChoice } from '@/store/settings';
import { useWebPopup } from '@/store/webPopup';
import { TOUCH, radii, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type Frequency = '480' | '120' | '60';
type WebFrequency = '5' | '10' | '20';

const WEB = Platform.OS === 'web';
type Quiet = 'none' | '22-8' | '21-9';

const TYPE_HINT: Record<PopupType, string> = {
  nouveau_mot: 'Mots et expressions des leçons',
  regle: 'Règles de grammaire courtes',
  rappel: 'Prononciation et usages',
  beau_mot: 'Beaux mots turcs, pour le plaisir',
};

function askPermission() {
  Alert.alert(
    'Autoriser l\'affichage',
    'Pour faire apparaître les pop-ups par-dessus vos autres applis, Android demande l\'autorisation « Afficher par-dessus les autres applis ». Activez-la pour Adım Adım, puis revenez ici.',
    [
      { text: 'Plus tard', style: 'cancel' },
      { text: 'Ouvrir les réglages', onPress: openOverlaySettings },
    ],
  );
}

export default function Settings() {
  const theme = useTheme();
  const settings = useSettings();
  const prefs = settings.popups;
  const granted = useOverlayPermission();
  const opened = useProgress((s) => s.lessons);
  const resetProgress = useProgress((s) => s.reset);
  const showWebPopup = useWebPopup((s) => s.show);

  const setEnabled = (enabled: boolean) => {
    settings.setPopups({ enabled });
    if (enabled && overlaySupported && !granted) askPermission();
  };

  const tryNow = () => {
    const pool = selectPopups(popups, prefs, new Set(Object.keys(opened)));
    const item = pool[Math.floor(Math.random() * pool.length)] ?? popups[0];
    if (!item) return;
    if (WEB) return showWebPopup(toNativeItem(item));
    if (!granted) return askPermission();
    showNow(toNativeItem(item));
  };

  const quiet: Quiet = prefs.quiet === null ? 'none' : prefs.quiet[0] === 21 ? '21-9' : '22-8';
  const segColors = { track: theme.bg, thumb: theme.accent, text: theme.ink2, activeText: theme.onAccent };

  return (
    <Screen>
      <T variant="screenTitle" accessibilityRole="header">
        Réglages
      </T>

      <Section title="Pop-ups de révision">
        <Row first>
          <View style={{ flex: 1 }}>
            <T variant="rowTitle">Activer les pop-ups</T>
            <T variant="caption" color={theme.ink3}>
              {WEB ? 'Pendant que le site est ouvert · 5 secondes' : "Quand l'écran est allumé · 5 secondes"}
            </T>
          </View>
          <Switch
            value={prefs.enabled}
            onValueChange={setEnabled}
            disabled={!overlaySupported && !WEB}
            accessibilityLabel="Activer les pop-ups"
            trackColor={{ false: theme.line, true: theme.accent }}
            thumbColor={theme.surface}
          />
        </Row>
        {prefs.enabled && overlaySupported && !granted ? (
          <Tap onPress={openOverlaySettings} label="Autoriser l'affichage par-dessus les autres applis">
            <Row>
              <View style={{ flex: 1 }}>
                <T variant="rowTitle" color={theme.warmInk}>
                  Autorisation manquante
                </T>
                <T variant="caption" color={theme.ink3}>
                  Touchez pour autoriser « Afficher par-dessus les autres applis »
                </T>
              </View>
            </Row>
          </Tap>
        ) : null}
        <View style={{ padding: 10, gap: 6 }}>
          <T variant="caption" color={theme.ink3} style={{ paddingHorizontal: 4 }}>
            Fréquence
          </T>
          {WEB ? (
            <Segmented<WebFrequency>
              value={String(settings.webIntervalMinutes) as WebFrequency}
              onChange={(v) => settings.set({ webIntervalMinutes: Number(v) })}
              options={[
                { value: '5', label: '5 min' },
                { value: '10', label: '10 min' },
                { value: '20', label: '20 min' },
              ]}
              colors={segColors}
            />
          ) : (
            <Segmented<Frequency>
              value={String(prefs.intervalMinutes) as Frequency}
              onChange={(v) => settings.setPopups({ intervalMinutes: Number(v) })}
              options={[
                { value: '480', label: '3× / jour' },
                { value: '120', label: 'Toutes les 2 h' },
                { value: '60', label: 'Toutes les h' },
              ]}
              colors={segColors}
            />
          )}
          <T variant="caption" color={theme.ink3} style={{ paddingHorizontal: 4, marginTop: 6 }}>
            Heures calmes
          </T>
          <Segmented<Quiet>
            value={quiet}
            onChange={(v) => settings.setPopups({ quiet: v === 'none' ? null : v === '21-9' ? [21, 9] : [22, 8] })}
            options={[
              { value: '22-8', label: '22 h – 8 h' },
              { value: '21-9', label: '21 h – 9 h' },
              { value: 'none', label: 'Aucune' },
            ]}
            colors={segColors}
          />
        </View>
      </Section>

      <Section title="Contenu des pop-ups">
        {POPUP_TYPES.map((type, i) => (
          <Row key={type} first={i === 0}>
            <View style={{ flex: 1 }}>
              <T variant="rowTitle">{TYPE_LABEL[type]}</T>
              <T variant="caption" color={theme.ink3}>
                {TYPE_HINT[type]}
              </T>
            </View>
            <Switch
              value={prefs.types[type]}
              onValueChange={(on) => settings.setPopups({ types: { ...prefs.types, [type]: on } })}
              accessibilityLabel={TYPE_LABEL[type]}
              trackColor={{ false: theme.line, true: theme.accent }}
              thumbColor={theme.surface}
            />
          </Row>
        ))}
        <Row>
          <View style={{ flex: 1 }}>
            <T variant="rowTitle">Seulement les leçons déjà vues</T>
            <T variant="caption" color={theme.ink3}>
              Les beaux mots et rappels généraux restent toujours inclus
            </T>
          </View>
          <Switch
            value={prefs.onlySeen}
            onValueChange={(onlySeen) => settings.setPopups({ onlySeen })}
            accessibilityLabel="Seulement les leçons déjà vues"
            trackColor={{ false: theme.line, true: theme.accent }}
            thumbColor={theme.surface}
          />
        </Row>
        <View style={{ padding: 10 }}>
          <Tap
            disabled={!overlaySupported && !WEB}
            onPress={tryNow}
            style={{ minHeight: TOUCH + 4, borderRadius: radii.tile, borderWidth: 1, borderColor: theme.line, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
            <T variant="bodyStrong" color={theme.accent}>
              Essayer un pop-up maintenant
            </T>
          </Tap>
        </View>
      </Section>

      {WEB ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, backgroundColor: theme.accentSoft, borderRadius: radii.card, padding: 14 }}>
          <Info color={theme.accent} size={20} strokeWidth={2} />
          <T variant="caption" color={theme.ink2} style={{ flex: 1 }}>
            Sur le web, les pop-ups apparaissent seulement quand le site est ouvert. Sur iPhone, ajoutez le site à l&apos;écran d&apos;accueil
            (Safari › Partager › Sur l&apos;écran d&apos;accueil) pour l&apos;utiliser comme une app.
          </T>
        </View>
      ) : !overlaySupported ? (
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 14, backgroundColor: theme.warmSoft, borderRadius: radii.card, padding: 14 }}>
          <Info color={theme.warmInk} size={20} strokeWidth={2} />
          <T variant="caption" color={theme.warmInk} style={{ flex: 1 }}>
            Les pop-ups ne fonctionnent que dans l&apos;application Android installée (pas dans Expo Go).
          </T>
        </View>
      ) : null}

      <Section title="Apparence">
        <View style={{ padding: 10 }}>
          <Segmented<ThemeChoice>
            value={settings.theme}
            onChange={(theme) => settings.set({ theme })}
            options={[
              { value: 'system', label: 'Système' },
              { value: 'light', label: 'Clair' },
              { value: 'dark', label: 'Sombre' },
            ]}
            colors={segColors}
          />
        </View>
      </Section>

      <Section title="Progression">
        <Tap
          onPress={() =>
            confirmDestructive('Remettre à zéro ?', 'Leçons, cartes et série de jours seront effacées. Cette action est définitive.', 'Effacer', resetProgress)
          }>
          <Row first>
            <T variant="rowTitle" color={theme.warmInk}>
              Remettre la progression à zéro
            </T>
          </Row>
        </Tap>
      </Section>

      <T variant="caption" color={theme.ink3} style={{ textAlign: 'center', marginTop: space.section }}>
        Adım Adım · version {Constants.expoConfig?.version ?? ''}
      </T>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: space.section }}>
      <T variant="label" color={theme.ink3} accessibilityRole="header" style={{ marginBottom: 8, paddingHorizontal: 2 }}>
        {title}
      </T>
      <View style={{ backgroundColor: theme.surface, borderRadius: radii.card, borderWidth: 1, borderColor: theme.line, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

function Row({ children, first }: { children: ReactNode; first?: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: first ? 0 : 1, borderTopColor: theme.rowLine }}>
      {children}
    </View>
  );
}
