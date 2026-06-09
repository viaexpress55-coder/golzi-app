import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, Modal, ActivityIndicator,
  Linking, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { useTranslation } from 'react-i18next';
import { db } from '../../services/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import i18n from '../../locales/i18n';

const C = {
  bg: '#020408', surface: '#0A0F1A', surface2: '#0F1520',
  gold: '#FFD700', gold2: '#FFA500', goldBorder: 'rgba(255,215,0,0.25)',
  text: '#FFFFFF', muted: '#6B7A99', muted2: '#9AAABB',
  green: '#00FF87', red: '#FF3355', cyan: '#00C6FF',
};

// ── PAÍSES CON BANDERA ──────────────────────────────────────────────────────
const COUNTRIES = [
  { code: 'co', name: 'Colombia', flag: '🇨🇴' },
  { code: 'mx', name: 'México', flag: '🇲🇽' },
  { code: 'ar', name: 'Argentina', flag: '🇦🇷' },
  { code: 'br', name: 'Brasil', flag: '🇧🇷' },
  { code: 'cl', name: 'Chile', flag: '🇨🇱' },
  { code: 'pe', name: 'Perú', flag: '🇵🇪' },
  { code: 'ec', name: 'Ecuador', flag: '🇪🇨' },
  { code: 've', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'bo', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'py', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'uy', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'us', name: 'USA', flag: '🇺🇸' },
  { code: 'ca', name: 'Canadá', flag: '🇨🇦' },
  { code: 'es', name: 'España', flag: '🇪🇸' },
  { code: 'fr', name: 'Francia', flag: '🇫🇷' },
  { code: 'de', name: 'Alemania', flag: '🇩🇪' },
  { code: 'it', name: 'Italia', flag: '🇮🇹' },
  { code: 'pt', name: 'Portugal', flag: '🇵🇹' },
  { code: 'gb', name: 'Reino Unido', flag: '🇬🇧' },
  { code: 'nl', name: 'Países Bajos', flag: '🇳🇱' },
  { code: 'ru', name: 'Rusia', flag: '🇷🇺' },
  { code: 'jp', name: 'Japón', flag: '🇯🇵' },
  { code: 'kr', name: 'Corea del Sur', flag: '🇰🇷' },
  { code: 'cn', name: 'China', flag: '🇨🇳' },
  { code: 'sa', name: 'Arabia Saudita', flag: '🇸🇦' },
  { code: 'ma', name: 'Marruecos', flag: '🇲🇦' },
  { code: 'ng', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'za', name: 'Sudáfrica', flag: '🇿🇦' },
  { code: 'au', name: 'Australia', flag: '🇦🇺' },
];

// ── IDIOMAS ─────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

// ── FAQ DATA ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: '¿Puedo cambiar mi predicción?',
    a: 'Una vez enviada tu predicción no puede modificarse. Asegúrate de confirmar el marcador antes de enviarlo.',
  },
  {
    q: '¿Cuándo se calculan los puntos?',
    a: 'Los puntos se calculan automáticamente cuando el partido termina. Verás tu posición actualizada en el ranking dentro de los siguientes 5 minutos.',
  },
  {
    q: '¿Los miembros de mi liga necesitan pagar?',
    a: 'No. Solo el administrador (creador de la liga) paga una vez. Todos los miembros invitados entran y juegan completamente gratis.',
  },
  {
    q: '¿GOLZI es una app de apuestas?',
    a: 'No. GOLZI es un juego de predicciones. Los puntos no tienen valor monetario y no se pueden canjear por dinero. Es 100% legal.',
  },
  {
    q: '¿Cuántas ligas puedo crear?',
    a: 'Con LIGA/PRO/MASTER puedes crear 1 liga. Con GOLZAIR puedes crear múltiples ligas distribuyendo tus 100 cupos. Los planes empresariales (PARTNER+) permiten múltiples ligas con sus cupos.',
  },
  {
    q: '¿Qué pasa si no predigo un partido?',
    a: 'Simplemente no recibes puntos por ese partido. No hay penalización por no predecir.',
  },
  {
    q: '¿Cómo funciona el plan GOLZAIR?',
    a: 'GOLZAIR te da un pool de 100 cupos que puedes distribuir entre múltiples ligas. Por ejemplo: una liga de 60 y otra de 40. Tú pagas una vez ($99.99) y todos los miembros juegan gratis.',
  },
  {
    q: '¿Cuándo se activa mi plan después del pago?',
    a: 'En Android (Google Play) se activa automáticamente en 1-2 minutos. En web (Wompi) se activa al redirigirte a golzi.app. Si no se activa en 5 minutos, cierra y vuelve a abrir la app.',
  },
  {
    q: '¿Funciona en iPhone?',
    a: 'Sí, vía PWA. Abre Safari → golzi.app → Compartir (⬆) → "Agregar a pantalla de inicio". Funciona como app nativa excepto las notificaciones push.',
  },
  {
    q: '¿Para qué sirven los planes empresariales?',
    a: 'PARTNER, BUSINESS, GOLD y GOLZI PREMIUM están diseñados para empresas, bares, influencers y eventos. Incluyen canal de difusión, dashboard, pantalla TV, y más. Modelo "1 PAGA, TODOS JUEGAN".',
  },
];

interface Props {
  userData: any;
  onClose: () => void;
  onLogout: () => void;
}

export default function SettingsScreen({ userData, onClose, onLogout }: Props) {
  const { t } = useTranslation();
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const auth = getAuth();
  const user = auth.currentUser;

  // ── ESTADO ──────────────────────────────────────────────────────────────
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Cuenta
  const [newUsername, setNewUsername] = useState(userData?.username || '');
  const [savingUsername, setSavingUsername] = useState(false);

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // País
  const [countrySearch, setCountrySearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(userData?.country || 'co');
  const [savingCountry, setSavingCountry] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);

  // Idioma
  const [selectedLang, setSelectedLang] = useState(userData?.language || i18n.language || 'es');
  const [showLangModal, setShowLangModal] = useState(false);

  // Notificaciones
  const [pushEnabled, setPushEnabled] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);

  // FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Eliminar cuenta
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  async function checkNotificationStatus() {
    if (Platform.OS === 'web') return;
    const { status } = await Notifications.getPermissionsAsync();
    setPushEnabled(status === 'granted');
    const rem = await AsyncStorage.getItem('golzi_reminder_enabled');
    setReminderEnabled(rem === 'true');
  }

  // ── HANDLERS ────────────────────────────────────────────────────────────

  async function saveUsername() {
    if (!newUsername.trim() || newUsername.trim().length < 3) {
      Alert.alert('⚠️', 'El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }
    try {
      setSavingUsername(true);
      await updateDoc(doc(db, 'users', user!.uid), { username: newUsername.trim() });
      Alert.alert('✅', 'Nombre de usuario actualizado');
      setActiveSection(null);
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el nombre');
    } finally {
      setSavingUsername(false);
    }
  }

  async function savePassword() {
    if (newPassword.length < 6) {
      Alert.alert('⚠️', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('⚠️', 'Las contraseñas no coinciden');
      return;
    }
    try {
      setSavingPassword(true);
      const credential = EmailAuthProvider.credential(user!.email!, currentPassword);
      await reauthenticateWithCredential(user!, credential);
      await updatePassword(user!, newPassword);
      Alert.alert('✅', 'Contraseña actualizada correctamente');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      setActiveSection(null);
    } catch (e: any) {
      if (e.code === 'auth/wrong-password') {
        Alert.alert('⚠️', 'Contraseña actual incorrecta');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la contraseña');
      }
    } finally {
      setSavingPassword(false);
    }
  }

  async function saveCountry(code: string) {
    try {
      setSavingCountry(true);
      await updateDoc(doc(db, 'users', user!.uid), { country: code });
      setSelectedCountry(code);
      setShowCountryModal(false);
      Alert.alert('✅', 'País actualizado');
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar el país');
    } finally {
      setSavingCountry(false);
    }
  }

  async function saveLanguage(code: string) {
    try {
      await i18n.changeLanguage(code);
      await updateDoc(doc(db, 'users', user!.uid), { language: code });
      setSelectedLang(code);
      setShowLangModal(false);
    } catch (e) {
      Alert.alert('Error', 'No se pudo cambiar el idioma');
    }
  }

  async function togglePush(val: boolean) {
    if (Platform.OS === 'web') {
      Alert.alert('ℹ️', 'Las notificaciones push no están disponibles en web');
      return;
    }
    if (val) {
      const { status } = await Notifications.requestPermissionsAsync();
      setPushEnabled(status === 'granted');
      if (status !== 'granted') {
        Alert.alert('⚠️', 'Permiso denegado. Ve a Configuración del sistema para habilitarlas.');
      }
    } else {
      setPushEnabled(false);
      Alert.alert('ℹ️', 'Para desactivar completamente ve a Configuración → GOLZI → Notificaciones');
    }
  }

  async function toggleReminder(val: boolean) {
    setReminderEnabled(val);
    await AsyncStorage.setItem('golzi_reminder_enabled', val ? 'true' : 'false');
  }

  async function clearCache() {
    Alert.alert(
      '🗑️ Limpiar caché',
      '¿Limpiar datos en caché de la app? Tus predicciones y puntos no se borrarán.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(k =>
                k.startsWith('golzi_cache_') || k.startsWith('expo_')
              );
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('✅', 'Caché limpiado correctamente');
            } catch (e) {
              Alert.alert('Error', 'No se pudo limpiar el caché');
            }
          }
        }
      ]
    );
  }

  async function handleDeleteAccount() {
    if (!deletePassword.trim()) {
      Alert.alert('⚠️', 'Ingresa tu contraseña para confirmar');
      return;
    }
    Alert.alert(
      '⚠️ ELIMINAR CUENTA',
      'Esta acción es irreversible. Se borrarán todos tus datos, predicciones y ligas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'ELIMINAR',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingAccount(true);
              const credential = EmailAuthProvider.credential(user!.email!, deletePassword);
              await reauthenticateWithCredential(user!, credential);
              await deleteDoc(doc(db, 'users', user!.uid));
              await deleteUser(user!);
              onLogout();
            } catch (e: any) {
              if (e.code === 'auth/wrong-password') {
                Alert.alert('⚠️', 'Contraseña incorrecta');
              } else {
                Alert.alert('Error', 'No se pudo eliminar la cuenta. Intenta más tarde.');
              }
            } finally {
              setDeletingAccount(false);
            }
          }
        }
      ]
    );
  }

  function openManual(type: 'personal' | 'empresarial') {
    const url = type === 'personal'
      ? 'https://golzi.app/manual.html'
      : 'https://golzi.app/manual-empresarial.html';
    Linking.openURL(url);
  }

  function openContact() {
    Linking.openURL('mailto:golziapp@gmail.com?subject=Soporte GOLZI');
  }

  function openWhatsApp() {
    Linking.openURL('https://wa.me/573054325588?text=Hola, necesito ayuda con GOLZI');
  }

  if (!fontsLoaded) return <View style={s.root} />;

  const currentCountryObj = COUNTRIES.find(c => c.code === selectedCountry);
  const currentLangObj = LANGUAGES.find(l => l.code === selectedLang);
  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // ── RENDER SECCIONES ────────────────────────────────────────────────────

  function renderSection() {
    switch (activeSection) {

      // ── USERNAME ──────────────────────────────────────────────────────
      case 'username':
        return (
          <View style={s.sectionContent}>
            <Text style={s.sectionTitle}>NOMBRE DE USUARIO</Text>
            <Text style={s.sectionSub}>Mínimo 3 caracteres. Visible en el ranking.</Text>
            <View style={s.inputWrap}>
              <Text style={s.inputIcon}>👤</Text>
              <TextInput
                style={s.input}
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Ej: Golzaire2026"
                placeholderTextColor={C.muted}
                maxLength={20}
                autoCapitalize="none"
              />
            </View>
            <TouchableOpacity
              style={[s.actionBtn, savingUsername && s.btnDisabled]}
              onPress={saveUsername}
              disabled={savingUsername}
            >
              <LinearGradient colors={[C.gold, C.gold2]} style={s.actionBtnInner}>
                {savingUsername
                  ? <ActivityIndicator color="#000" />
                  : <Text style={s.actionBtnTxt}>⚡ GUARDAR</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      // ── CONTRASEÑA ────────────────────────────────────────────────────
      case 'password':
        return (
          <View style={s.sectionContent}>
            <Text style={s.sectionTitle}>CAMBIAR CONTRASEÑA</Text>
            <Text style={s.sectionSub}>Mínimo 6 caracteres.</Text>
            {[
              { label: 'CONTRASEÑA ACTUAL', val: currentPassword, set: setCurrentPassword },
              { label: 'NUEVA CONTRASEÑA', val: newPassword, set: setNewPassword },
              { label: 'CONFIRMAR NUEVA', val: confirmPassword, set: setConfirmPassword },
            ].map((field, i) => (
              <View key={i}>
                <Text style={s.inputLabel}>{field.label}</Text>
                <View style={s.inputWrap}>
                  <Text style={s.inputIcon}>🔒</Text>
                  <TextInput
                    style={s.input}
                    value={field.val}
                    onChangeText={field.set}
                    secureTextEntry
                    placeholder="••••••••"
                    placeholderTextColor={C.muted}
                  />
                </View>
              </View>
            ))}
            <TouchableOpacity
              style={[s.actionBtn, savingPassword && s.btnDisabled]}
              onPress={savePassword}
              disabled={savingPassword}
            >
              <LinearGradient colors={[C.gold, C.gold2]} style={s.actionBtnInner}>
                {savingPassword
                  ? <ActivityIndicator color="#000" />
                  : <Text style={s.actionBtnTxt}>⚡ ACTUALIZAR CONTRASEÑA</Text>
                }
              </LinearGradient>
            </TouchableOpacity>
          </View>
        );

      // ── NOTIFICACIONES ────────────────────────────────────────────────
      case 'notifications':
        return (
          <View style={s.sectionContent}>
            <Text style={s.sectionTitle}>NOTIFICACIONES</Text>
            <View style={s.switchRow}>
              <View style={s.switchInfo}>
                <Text style={s.switchLabel}>🔔 Notificaciones push</Text>
                <Text style={s.switchSub}>Goles, resultados y puntos en tiempo real</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={togglePush}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(255,215,0,0.4)' }}
                thumbColor={pushEnabled ? C.gold : C.muted}
              />
            </View>
            <View style={[s.switchRow, { marginTop: 8 }]}>
              <View style={s.switchInfo}>
                <Text style={s.switchLabel}>⏰ Recordatorio pre-partido</Text>
                <Text style={s.switchSub}>Aviso 30 min antes de cada partido</Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={toggleReminder}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(255,215,0,0.4)' }}
                thumbColor={reminderEnabled ? C.gold : C.muted}
              />
            </View>
            {Platform.OS === 'web' && (
              <View style={s.infoBox}>
                <Text style={s.infoBoxTxt}>
                  ℹ️ Las notificaciones push no están disponibles en la versión web. Descarga la app en Google Play para recibirlas.
                </Text>
              </View>
            )}
          </View>
        );

      // ── FAQ ──────────────────────────────────────────────────────────
      case 'faq':
        return (
          <View style={s.sectionContent}>
            <Text style={s.sectionTitle}>PREGUNTAS FRECUENTES</Text>
            <Text style={s.sectionSub}>Uso de la app y planes</Text>
            {FAQ_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setOpenFaq(openFaq === i ? null : i)}
                style={[s.faqItem, openFaq === i && s.faqItemOpen]}
                activeOpacity={0.8}
              >
                <View style={s.faqQuestion}>
                  <Text style={s.faqQ}>{item.q}</Text>
                  <Text style={[s.faqArrow, openFaq === i && s.faqArrowOpen]}>▼</Text>
                </View>
                {openFaq === i && (
                  <Text style={s.faqA}>{item.a}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        );

      // ── CONTACTO ──────────────────────────────────────────────────────
      case 'contact':
        return (
          <View style={s.sectionContent}>
            <Text style={s.sectionTitle}>CONTACTO Y SOPORTE</Text>
            <Text style={s.sectionSub}>Estamos para ayudarte</Text>

            <TouchableOpacity style={s.contactCard} onPress={openWhatsApp} activeOpacity={0.8}>
              <LinearGradient colors={['rgba(0,255,135,0.08)', 'rgba(0,255,135,0.02)']} style={s.contactCardInner}>
                <View style={s.contactCardTop} />
                <Text style={s.contactCardIcon}>💬</Text>
                <Text style={s.contactCardTitle}>WhatsApp</Text>
                <Text style={s.contactCardVal}>+57 305 432 5588</Text>
                <Text style={s.contactCardSub}>Lun–Vie 8am–8pm (COL)</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={s.contactCard} onPress={openContact} activeOpacity={0.8}>
              <LinearGradient colors={['rgba(0,198,255,0.08)', 'rgba(0,198,255,0.02)']} style={s.contactCardInner}>
                <View style={[s.contactCardTop, { backgroundColor: C.cyan }]} />
                <Text style={s.contactCardIcon}>📧</Text>
                <Text style={[s.contactCardTitle, { color: C.cyan }]}>Email</Text>
                <Text style={s.contactCardVal}>golziapp@gmail.com</Text>
                <Text style={s.contactCardSub}>Respuesta en menos de 24h</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.infoBox}>
              <Text style={s.infoBoxTxt}>
                🏢 Para planes empresariales (PARTNER/BUSINESS/GOLD/PREMIUM) contactar directamente para atención prioritaria.
              </Text>
            </View>
          </View>
        );

      // ── APP ───────────────────────────────────────────────────────────
      case 'app':
        return (
          <View style={s.sectionContent}>
            <Text style={s.sectionTitle}>CONFIGURACIÓN DE APP</Text>
            <TouchableOpacity style={s.dangerRow} onPress={clearCache} activeOpacity={0.8}>
              <View style={s.dangerRowLeft}>
                <Text style={s.dangerIcon}>🗑️</Text>
                <View>
                  <Text style={s.dangerLabel}>Limpiar caché</Text>
                  <Text style={s.dangerSub}>Libera espacio de almacenamiento temporal</Text>
                </View>
              </View>
              <Text style={s.dangerArrow}>›</Text>
            </TouchableOpacity>
            <View style={s.infoBox}>
              <Text style={s.infoBoxTxt}>
                ℹ️ Limpiar el caché no borra tus predicciones, puntos ni datos de liga. Solo elimina archivos temporales.
              </Text>
            </View>
          </View>
        );

      // ── ELIMINAR CUENTA ───────────────────────────────────────────────
      case 'delete':
        return (
          <View style={s.sectionContent}>
            <Text style={[s.sectionTitle, { color: C.red }]}>ELIMINAR CUENTA</Text>
            <View style={s.warningBox}>
              <Text style={s.warningTxt}>
                ⚠️ Esta acción es permanente e irreversible. Se eliminarán todos tus datos: predicciones, puntos, ligas y perfil.
              </Text>
            </View>
            <Text style={s.inputLabel}>CONFIRMA CON TU CONTRASEÑA</Text>
            <View style={s.inputWrap}>
              <Text style={s.inputIcon}>🔒</Text>
              <TextInput
                style={s.input}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
                placeholder="Tu contraseña actual"
                placeholderTextColor={C.muted}
              />
            </View>
            <TouchableOpacity
              style={[s.deleteBtn, deletingAccount && s.btnDisabled]}
              onPress={handleDeleteAccount}
              disabled={deletingAccount}
              activeOpacity={0.85}
            >
              {deletingAccount
                ? <ActivityIndicator color={C.red} />
                : <Text style={s.deleteBtnTxt}>🗑️ ELIMINAR MI CUENTA</Text>
              }
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  }

  // ── MAIN RENDER ──────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408', '#05080F', '#020408']} style={StyleSheet.absoluteFill} />

      {/* HEADER */}
      <LinearGradient colors={['#020408', '#05080F']} style={s.header}>
        <View style={s.topLine} />
        <TouchableOpacity onPress={activeSection ? () => setActiveSection(null) : onClose} style={s.backBtn}>
          <Text style={s.backArrow}>{activeSection ? '←' : '✕'}</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>
          {activeSection === 'username' ? 'NOMBRE' :
           activeSection === 'password' ? 'CONTRASEÑA' :
           activeSection === 'notifications' ? 'NOTIFICACIONES' :
           activeSection === 'faq' ? 'FAQ' :
           activeSection === 'contact' ? 'CONTACTO' :
           activeSection === 'app' ? 'APP' :
           activeSection === 'delete' ? 'ELIMINAR' :
           'AJUSTES'}
        </Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {!activeSection ? (
          <>
            {/* ── SECCIÓN: CUENTA ── */}
            <View style={s.group}>
              <Text style={s.groupLabel}>CUENTA</Text>

              <TouchableOpacity style={s.row} onPress={() => setActiveSection('username')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}><Text style={s.rowIcon}>👤</Text></View>
                  <View>
                    <Text style={s.rowLabel}>Nombre de usuario</Text>
                    <Text style={s.rowVal}>{userData?.username || 'Sin nombre'}</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.row} onPress={() => setActiveSection('password')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}><Text style={s.rowIcon}>🔒</Text></View>
                  <View>
                    <Text style={s.rowLabel}>Contraseña</Text>
                    <Text style={s.rowVal}>••••••••</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.row} onPress={() => setShowCountryModal(true)} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}>
                    <Text style={{ fontSize: 20 }}>{currentCountryObj?.flag || '🌍'}</Text>
                  </View>
                  <View>
                    <Text style={s.rowLabel}>País</Text>
                    <Text style={s.rowVal}>{currentCountryObj?.name || selectedCountry.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.row} onPress={() => setShowLangModal(true)} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}>
                    <Text style={{ fontSize: 20 }}>{currentLangObj?.flag || '🌐'}</Text>
                  </View>
                  <View>
                    <Text style={s.rowLabel}>Idioma</Text>
                    <Text style={s.rowVal}>{currentLangObj?.name || selectedLang}</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* ── SECCIÓN: NOTIFICACIONES ── */}
            <View style={s.group}>
              <Text style={s.groupLabel}>NOTIFICACIONES</Text>
              <TouchableOpacity style={s.row} onPress={() => setActiveSection('notifications')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}><Text style={s.rowIcon}>🔔</Text></View>
                  <View>
                    <Text style={s.rowLabel}>Configurar notificaciones</Text>
                    <Text style={s.rowVal}>{pushEnabled ? '✓ Activadas' : 'Desactivadas'}</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* ── SECCIÓN: APP ── */}
            <View style={s.group}>
              <Text style={s.groupLabel}>APP</Text>
              <TouchableOpacity style={s.row} onPress={() => setActiveSection('app')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}><Text style={s.rowIcon}>🗑️</Text></View>
                  <View>
                    <Text style={s.rowLabel}>Limpiar caché</Text>
                    <Text style={s.rowVal}>Libera almacenamiento temporal</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* ── SECCIÓN: AYUDA ── */}
            <View style={s.group}>
              <Text style={s.groupLabel}>AYUDA</Text>

              <TouchableOpacity style={s.row} onPress={() => setActiveSection('faq')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}><Text style={s.rowIcon}>❓</Text></View>
                  <View>
                    <Text style={s.rowLabel}>Preguntas frecuentes</Text>
                    <Text style={s.rowVal}>Uso de la app y planes</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.row} onPress={() => setActiveSection('contact')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}><Text style={s.rowIcon}>💬</Text></View>
                  <View>
                    <Text style={s.rowLabel}>Contacto y soporte</Text>
                    <Text style={s.rowVal}>WhatsApp · Email</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.row} onPress={() => openManual('personal')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}><Text style={s.rowIcon}>📖</Text></View>
                  <View>
                    <Text style={s.rowLabel}>Manual de usuario</Text>
                    <Text style={s.rowVal}>Guía completa de la app</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>↗</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.row} onPress={() => openManual('empresarial')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={s.rowIconWrap}><Text style={s.rowIcon}>🏢</Text></View>
                  <View>
                    <Text style={s.rowLabel}>Manual empresarial</Text>
                    <Text style={s.rowVal}>PARTNER · BUSINESS · GOLD · PREMIUM</Text>
                  </View>
                </View>
                <Text style={s.rowArrow}>↗</Text>
              </TouchableOpacity>
            </View>

            {/* ── SECCIÓN: SESIÓN ── */}
            <View style={s.group}>
              <Text style={s.groupLabel}>SESIÓN</Text>

              <TouchableOpacity style={s.row} onPress={onLogout} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={[s.rowIconWrap, { backgroundColor: 'rgba(255,51,85,0.1)' }]}>
                    <Text style={s.rowIcon}>🚪</Text>
                  </View>
                  <Text style={[s.rowLabel, { color: C.red }]}>Cerrar sesión</Text>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.row} onPress={() => setActiveSection('delete')} activeOpacity={0.8}>
                <View style={s.rowLeft}>
                  <View style={[s.rowIconWrap, { backgroundColor: 'rgba(255,51,85,0.08)' }]}>
                    <Text style={s.rowIcon}>🗑️</Text>
                  </View>
                  <Text style={[s.rowLabel, { color: C.red }]}>Eliminar cuenta</Text>
                </View>
                <Text style={s.rowArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* ── VERSION ── */}
            <Text style={s.version}>GOLZI · v1.0.12 · Mundial 2026</Text>
          </>
        ) : (
          renderSection()
        )}

      </ScrollView>

      {/* ── MODAL PAÍS ── */}
      <Modal visible={showCountryModal} transparent animationType="slide" onRequestClose={() => setShowCountryModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <LinearGradient colors={['#0A0F1A', '#020408']} style={StyleSheet.absoluteFill} />
            <View style={s.modalTopLine} />
            <Text style={s.modalTitle}>SELECCIONAR PAÍS</Text>
            <View style={s.inputWrap}>
              <Text style={s.inputIcon}>🔍</Text>
              <TextInput
                style={s.input}
                value={countrySearch}
                onChangeText={setCountrySearch}
                placeholder="Buscar país..."
                placeholderTextColor={C.muted}
              />
            </View>
            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              {filteredCountries.map(c => (
                <TouchableOpacity
                  key={c.code}
                  style={[s.selectRow, c.code === selectedCountry && s.selectRowActive]}
                  onPress={() => saveCountry(c.code)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 22 }}>{c.flag}</Text>
                  <Text style={[s.selectLabel, c.code === selectedCountry && { color: C.gold }]}>{c.name}</Text>
                  {c.code === selectedCountry && <Text style={{ color: C.gold, fontSize: 16 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowCountryModal(false)} style={s.modalClose}>
              <Text style={s.modalCloseTxt}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL IDIOMA ── */}
      <Modal visible={showLangModal} transparent animationType="slide" onRequestClose={() => setShowLangModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <LinearGradient colors={['#0A0F1A', '#020408']} style={StyleSheet.absoluteFill} />
            <View style={s.modalTopLine} />
            <Text style={s.modalTitle}>SELECCIONAR IDIOMA</Text>
            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {LANGUAGES.map(l => (
                <TouchableOpacity
                  key={l.code}
                  style={[s.selectRow, l.code === selectedLang && s.selectRowActive]}
                  onPress={() => saveLanguage(l.code)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 22 }}>{l.flag}</Text>
                  <Text style={[s.selectLabel, l.code === selectedLang && { color: C.gold }]}>{l.name}</Text>
                  {l.code === selectedLang && <Text style={{ color: C.gold, fontSize: 16 }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setShowLangModal(false)} style={s.modalClose}>
              <Text style={s.modalCloseTxt}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  topLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: 'rgba(255,215,0,0.5)' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,215,0,0.15)', position: 'relative',
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 22, color: C.gold },
  headerTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 20, color: C.gold, letterSpacing: 3 },

  scroll: { paddingBottom: 48 },

  group: {
    marginHorizontal: 16, marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  groupLabel: {
    fontFamily: 'BarlowCondensed_700Bold', fontSize: 9,
    color: C.muted, letterSpacing: 3,
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
  },

  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.04)',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  rowIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,215,0,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 14, color: C.text },
  rowVal: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 12, color: C.muted, marginTop: 1 },
  rowArrow: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 18, color: C.muted },

  version: {
    fontFamily: 'BarlowCondensed_400Regular', fontSize: 11,
    color: 'rgba(255,255,255,0.2)', letterSpacing: 1,
    textAlign: 'center', marginTop: 32,
  },

  // Section content
  sectionContent: { paddingHorizontal: 16, paddingTop: 24, gap: 12 },
  sectionTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 24, color: C.gold, letterSpacing: 2 },
  sectionSub: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 13, color: C.muted, marginTop: -6 },

  inputLabel: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 9, color: C.muted, letterSpacing: 2, marginTop: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12, paddingHorizontal: 12, height: 50,
  },
  inputIcon: { fontSize: 16, marginRight: 8 },
  input: { flex: 1, fontFamily: 'BarlowCondensed_400Regular', fontSize: 15, color: C.text } as any,

  actionBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 4 },
  actionBtnInner: { paddingVertical: 15, alignItems: 'center' },
  actionBtnTxt: { fontFamily: 'BebasNeue_400Regular', fontSize: 16, letterSpacing: 2, color: '#000' },
  btnDisabled: { opacity: 0.5 },

  // Switch rows
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12, padding: 14, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  switchInfo: { flex: 1, marginRight: 12 },
  switchLabel: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 14, color: C.text },
  switchSub: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 12, color: C.muted, marginTop: 2 },

  // Info / warning boxes
  infoBox: {
    backgroundColor: 'rgba(0,198,255,0.05)', borderWidth: 1,
    borderColor: 'rgba(0,198,255,0.2)', borderRadius: 10, padding: 12,
  },
  infoBoxTxt: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 12, color: C.muted2, lineHeight: 18 },
  warningBox: {
    backgroundColor: 'rgba(255,51,85,0.06)', borderWidth: 1,
    borderColor: 'rgba(255,51,85,0.25)', borderRadius: 10, padding: 12,
  },
  warningTxt: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 13, color: '#FF7788', lineHeight: 18 },

  // FAQ
  faqItem: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    padding: 14, gap: 8,
  },
  faqItemOpen: { borderColor: 'rgba(255,215,0,0.25)', backgroundColor: 'rgba(255,215,0,0.04)' },
  faqQuestion: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  faqQ: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 14, color: C.text, flex: 1 },
  faqArrow: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 11, color: C.muted, marginTop: 2 },
  faqArrowOpen: { color: C.gold, transform: [{ rotate: '180deg' }] },
  faqA: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 13, color: C.muted2, lineHeight: 18 },

  // Contact cards
  contactCard: { borderRadius: 14, overflow: 'hidden' },
  contactCardInner: {
    borderRadius: 14, padding: 18,
    borderWidth: 1, borderColor: 'rgba(0,255,135,0.2)',
    alignItems: 'center', gap: 4, position: 'relative',
  },
  contactCardTop: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 2, backgroundColor: C.green,
  },
  contactCardIcon: { fontSize: 32, marginBottom: 4 },
  contactCardTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 20, color: C.green, letterSpacing: 2 },
  contactCardVal: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 16, color: C.text },
  contactCardSub: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 11, color: C.muted },

  // Danger rows
  dangerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 14,
  },
  dangerRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dangerIcon: { fontSize: 20 },
  dangerLabel: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 14, color: C.text },
  dangerSub: { fontFamily: 'BarlowCondensed_400Regular', fontSize: 12, color: C.muted, marginTop: 1 },
  dangerArrow: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 20, color: C.muted },

  // Delete
  deleteBtn: {
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,51,85,0.4)',
    backgroundColor: 'rgba(255,51,85,0.08)', paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  deleteBtnTxt: { fontFamily: 'BebasNeue_400Regular', fontSize: 16, color: C.red, letterSpacing: 2 },

  // Modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderRadius: 24, overflow: 'hidden',
    padding: 20, maxHeight: '80%',
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.2)',
    margin: 8,
  },
  modalTopLine: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3, backgroundColor: C.gold,
  },
  modalTitle: {
    fontFamily: 'BebasNeue_400Regular', fontSize: 22,
    color: C.gold, letterSpacing: 2, marginBottom: 14,
  },
  selectRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  selectRowActive: { backgroundColor: 'rgba(255,215,0,0.06)' },
  selectLabel: { fontFamily: 'BarlowCondensed_600SemiBold', fontSize: 15, color: C.muted2, flex: 1 },
  modalClose: {
    backgroundColor: 'rgba(255,215,0,0.08)', borderRadius: 12,
    borderWidth: 1, borderColor: 'rgba(255,215,0,0.25)',
    paddingVertical: 12, alignItems: 'center', marginTop: 12,
  },
  modalCloseTxt: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 13, color: C.gold, letterSpacing: 1 },
});