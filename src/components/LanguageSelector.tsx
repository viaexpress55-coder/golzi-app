import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '../locales/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: '🇪🇸', countries: 'Colombia, México, Argentina...' },
  { code: 'en', name: 'English', flag: '🇺🇸', countries: 'USA, UK, Australia...' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', countries: 'Brasil, Portugal...' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', countries: 'France, Belgique...' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', countries: 'Deutschland, Österreich...' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', countries: 'Italia, Svizzera...' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', countries: 'Россия...' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', countries: 'السعودية، الإمارات...' },
  { code: 'zh', name: '中文', flag: '🇨🇳', countries: '中国, 台湾...' },
  { code: 'ja', name: '日本語', flag: '🇯🇵', countries: '日本...' },
  { code: 'ko', name: '한국어', flag: '🇰🇷', countries: '한국...' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', countries: 'भारत...' },
];

const C = {
  dark: '#05080F', surface: '#0D1117', surface2: '#161B26',
  text: '#F0F4FF', muted: '#6B7A99',
  gold: '#FFD700', border: 'rgba(255,255,255,0.07)',
};

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [visible, setVisible] = useState(false);

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

 async function changeLanguage(code: string) {
    try {
      await AsyncStorage.setItem('golzi_language', code);
      // Sincronizar con Firestore
      
      
      
      const user = getAuth().currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { language: code });
      }
    } catch {}
    i18n.changeLanguage(code);
    setVisible(false);
  }

  return (
    <>
      <TouchableOpacity style={s.trigger} onPress={() => setVisible(true)}>
        <Text style={s.flag}>{currentLang.flag}</Text>
        <Text style={s.langName}>{currentLang.name}</Text>
        <Text style={s.arrow}>›</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.sheet}>
            <Text style={s.sheetTitle}>SELECCIONA IDIOMA</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={lang.code}
                  style={[s.langRow, i18n.language === lang.code && s.langRowActive]}
                  onPress={() => changeLanguage(lang.code)}
                >
                  <Text style={s.langFlag}>{lang.flag}</Text>
                  <View style={s.langInfo}>
                    <Text style={s.langNameBig}>{lang.name}</Text>
                    <Text style={s.langCountries}>{lang.countries}</Text>
                  </View>
                  {i18n.language === lang.code && (
                    <Text style={s.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.closeBtn} onPress={() => setVisible(false)}>
              <Text style={s.closeBtnTxt}>CERRAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B26', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)' },
  flag: { fontSize: 20, marginRight: 10 },
  langName: { flex: 1, fontFamily: 'System', fontSize: 14, color: '#F0F4FF' },
  arrow: { color: '#6B7A99', fontSize: 18 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#0D1117', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  sheetTitle: { fontFamily: 'System', fontSize: 12, color: '#6B7A99', letterSpacing: 2, marginBottom: 16, textAlign: 'center' },
  langRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, marginBottom: 4 },
  langRowActive: { backgroundColor: 'rgba(255,215,0,0.1)', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  langFlag: { fontSize: 24, marginRight: 12 },
  langInfo: { flex: 1 },
  langNameBig: { fontFamily: 'System', fontSize: 15, color: '#F0F4FF', fontWeight: '600' },
  langCountries: { fontFamily: 'System', fontSize: 11, color: '#6B7A99', marginTop: 2 },
  checkmark: { color: '#FFD700', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { backgroundColor: '#161B26', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
  closeBtnTxt: { fontFamily: 'System', fontSize: 14, color: '#6B7A99', letterSpacing: 1 },
});