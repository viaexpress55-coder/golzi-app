import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Pressable, Animated, Image, Modal, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';
import { Barlow_400Regular, Barlow_500Medium } from '@expo-google-fonts/barlow';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParams } from '../../navigation/AppNavigator';
import { registerWithEmail } from '../../services/auth';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { signInWithGoogleCredential, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_WEB_CLIENT_ID } from '../../services/auth';

WebBrowser.maybeCompleteAuthSession();
import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

import { useTranslation } from 'react-i18next';

const C = {
  darker:'#020408', dark:'#05080F', surface:'#0D1117', surface2:'#0F1420',
  text:'#F0F4FF', muted:'#6B7A99', muted2:'#9AAABB',
  gold:'#FFD700', gold2:'#FFA500', green:'#00FF87', cyan:'#00C6FF', red:'#E8003D',
  border:'rgba(255,215,0,0.2)', border2:'rgba(255,255,255,0.06)',
};

const COUNTRIES = [
  { flag:'🇦🇫', name:'Afghanistan', code:'AF' },
  { flag:'🇦🇱', name:'Albania', code:'AL' },
  { flag:'🇩🇿', name:'Algeria', code:'DZ' },
  { flag:'🇦🇩', name:'Andorra', code:'AD' },
  { flag:'🇦🇴', name:'Angola', code:'AO' },
  { flag:'🇦🇬', name:'Antigua and Barbuda', code:'AG' },
  { flag:'🇦🇷', name:'Argentina', code:'AR' },
  { flag:'🇦🇲', name:'Armenia', code:'AM' },
  { flag:'🇦🇺', name:'Australia', code:'AU' },
  { flag:'🇦🇹', name:'Austria', code:'AT' },
  { flag:'🇦🇿', name:'Azerbaijan', code:'AZ' },
  { flag:'🇧🇸', name:'Bahamas', code:'BS' },
  { flag:'🇧🇭', name:'Bahrain', code:'BH' },
  { flag:'🇧🇩', name:'Bangladesh', code:'BD' },
  { flag:'🇧🇧', name:'Barbados', code:'BB' },
  { flag:'🇧🇾', name:'Belarus', code:'BY' },
  { flag:'🇧🇪', name:'Belgium', code:'BE' },
  { flag:'🇧🇿', name:'Belize', code:'BZ' },
  { flag:'🇧🇯', name:'Benin', code:'BJ' },
  { flag:'🇧🇹', name:'Bhutan', code:'BT' },
  { flag:'🇧🇴', name:'Bolivia', code:'BO' },
  { flag:'🇧🇦', name:'Bosnia and Herzegovina', code:'BA' },
  { flag:'🇧🇼', name:'Botswana', code:'BW' },
  { flag:'🇧🇷', name:'Brasil', code:'BR' },
  { flag:'🇧🇳', name:'Brunei', code:'BN' },
  { flag:'🇧🇬', name:'Bulgaria', code:'BG' },
  { flag:'🇧🇫', name:'Burkina Faso', code:'BF' },
  { flag:'🇧🇮', name:'Burundi', code:'BI' },
  { flag:'🇨🇻', name:'Cabo Verde', code:'CV' },
  { flag:'🇰🇭', name:'Cambodia', code:'KH' },
  { flag:'🇨🇲', name:'Cameroon', code:'CM' },
  { flag:'🇨🇦', name:'Canada', code:'CA' },
  { flag:'🇨🇫', name:'Central African Republic', code:'CF' },
  { flag:'🇹🇩', name:'Chad', code:'TD' },
  { flag:'🇨🇱', name:'Chile', code:'CL' },
  { flag:'🇨🇳', name:'China', code:'CN' },
  { flag:'🇨🇴', name:'Colombia', code:'CO' },
  { flag:'🇰🇲', name:'Comoros', code:'KM' },
  { flag:'🇨🇬', name:'Congo', code:'CG' },
  { flag:'🇨🇩', name:'Congo DR', code:'CD' },
  { flag:'🇨🇷', name:'Costa Rica', code:'CR' },
  { flag:'🇭🇷', name:'Croatia', code:'HR' },
  { flag:'🇨🇺', name:'Cuba', code:'CU' },
  { flag:'🇨🇾', name:'Cyprus', code:'CY' },
  { flag:'🇨🇿', name:'Czech Republic', code:'CZ' },
  { flag:'🇩🇰', name:'Denmark', code:'DK' },
  { flag:'🇩🇯', name:'Djibouti', code:'DJ' },
  { flag:'🇩🇴', name:'Dominican Republic', code:'DO' },
  { flag:'🇪🇨', name:'Ecuador', code:'EC' },
  { flag:'🇪🇬', name:'Egypt', code:'EG' },
  { flag:'🇸🇻', name:'El Salvador', code:'SV' },
  { flag:'🇬🇶', name:'Equatorial Guinea', code:'GQ' },
  { flag:'🇪🇷', name:'Eritrea', code:'ER' },
  { flag:'🇪🇪', name:'Estonia', code:'EE' },
  { flag:'🇸🇿', name:'Eswatini', code:'SZ' },
  { flag:'🇪🇹', name:'Ethiopia', code:'ET' },
  { flag:'🇫🇯', name:'Fiji', code:'FJ' },
  { flag:'🇫🇮', name:'Finland', code:'FI' },
  { flag:'🇫🇷', name:'France', code:'FR' },
  { flag:'🇬🇦', name:'Gabon', code:'GA' },
  { flag:'🇬🇲', name:'Gambia', code:'GM' },
  { flag:'🇬🇪', name:'Georgia', code:'GE' },
  { flag:'🇩🇪', name:'Germany', code:'DE' },
  { flag:'🇬🇭', name:'Ghana', code:'GH' },
  { flag:'🇬🇷', name:'Greece', code:'GR' },
  { flag:'🇬🇩', name:'Grenada', code:'GD' },
  { flag:'🇬🇹', name:'Guatemala', code:'GT' },
  { flag:'🇬🇳', name:'Guinea', code:'GN' },
  { flag:'🇬🇼', name:'Guinea-Bissau', code:'GW' },
  { flag:'🇬🇾', name:'Guyana', code:'GY' },
  { flag:'🇭🇹', name:'Haiti', code:'HT' },
  { flag:'🇭🇳', name:'Honduras', code:'HN' },
  { flag:'🇭🇺', name:'Hungary', code:'HU' },
  { flag:'🇮🇸', name:'Iceland', code:'IS' },
  { flag:'🇮🇳', name:'India', code:'IN' },
  { flag:'🇮🇩', name:'Indonesia', code:'ID' },
  { flag:'🇮🇷', name:'Iran', code:'IR' },
  { flag:'🇮🇶', name:'Iraq', code:'IQ' },
  { flag:'🇮🇪', name:'Ireland', code:'IE' },
  { flag:'🇮🇱', name:'Israel', code:'IL' },
  { flag:'🇮🇹', name:'Italy', code:'IT' },
  { flag:'🇯🇲', name:'Jamaica', code:'JM' },
  { flag:'🇯🇵', name:'Japan', code:'JP' },
  { flag:'🇯🇴', name:'Jordan', code:'JO' },
  { flag:'🇰🇿', name:'Kazakhstan', code:'KZ' },
  { flag:'🇰🇪', name:'Kenya', code:'KE' },
  { flag:'🇰🇮', name:'Kiribati', code:'KI' },
  { flag:'🇰🇼', name:'Kuwait', code:'KW' },
  { flag:'🇰🇬', name:'Kyrgyzstan', code:'KG' },
  { flag:'🇱🇦', name:'Laos', code:'LA' },
  { flag:'🇱🇻', name:'Latvia', code:'LV' },
  { flag:'🇱🇧', name:'Lebanon', code:'LB' },
  { flag:'🇱🇸', name:'Lesotho', code:'LS' },
  { flag:'🇱🇷', name:'Liberia', code:'LR' },
  { flag:'🇱🇾', name:'Libya', code:'LY' },
  { flag:'🇱🇮', name:'Liechtenstein', code:'LI' },
  { flag:'🇱🇹', name:'Lithuania', code:'LT' },
  { flag:'🇱🇺', name:'Luxembourg', code:'LU' },
  { flag:'🇲🇬', name:'Madagascar', code:'MG' },
  { flag:'🇲🇼', name:'Malawi', code:'MW' },
  { flag:'🇲🇾', name:'Malaysia', code:'MY' },
  { flag:'🇲🇻', name:'Maldives', code:'MV' },
  { flag:'🇲🇱', name:'Mali', code:'ML' },
  { flag:'🇲🇹', name:'Malta', code:'MT' },
  { flag:'🇲🇷', name:'Mauritania', code:'MR' },
  { flag:'🇲🇺', name:'Mauritius', code:'MU' },
  { flag:'🇲🇽', name:'Mexico', code:'MX' },
  { flag:'🇫🇲', name:'Micronesia', code:'FM' },
  { flag:'🇲🇩', name:'Moldova', code:'MD' },
  { flag:'🇲🇨', name:'Monaco', code:'MC' },
  { flag:'🇲🇳', name:'Mongolia', code:'MN' },
  { flag:'🇲🇪', name:'Montenegro', code:'ME' },
  { flag:'🇲🇦', name:'Morocco', code:'MA' },
  { flag:'🇲🇿', name:'Mozambique', code:'MZ' },
  { flag:'🇲🇲', name:'Myanmar', code:'MM' },
  { flag:'🇳🇦', name:'Namibia', code:'NA' },
  { flag:'🇳🇷', name:'Nauru', code:'NR' },
  { flag:'🇳🇵', name:'Nepal', code:'NP' },
  { flag:'🇳🇱', name:'Netherlands', code:'NL' },
  { flag:'🇳🇿', name:'New Zealand', code:'NZ' },
  { flag:'🇳🇮', name:'Nicaragua', code:'NI' },
  { flag:'🇳🇪', name:'Niger', code:'NE' },
  { flag:'🇳🇬', name:'Nigeria', code:'NG' },
  { flag:'🇲🇰', name:'North Macedonia', code:'MK' },
  { flag:'🇳🇴', name:'Norway', code:'NO' },
  { flag:'🇴🇲', name:'Oman', code:'OM' },
  { flag:'🇵🇰', name:'Pakistan', code:'PK' },
  { flag:'🇵🇼', name:'Palau', code:'PW' },
  { flag:'🇵🇦', name:'Panama', code:'PA' },
  { flag:'🇵🇬', name:'Papua New Guinea', code:'PG' },
  { flag:'🇵🇾', name:'Paraguay', code:'PY' },
  { flag:'🇵🇪', name:'Peru', code:'PE' },
  { flag:'🇵🇭', name:'Philippines', code:'PH' },
  { flag:'🇵🇱', name:'Poland', code:'PL' },
  { flag:'🇵🇹', name:'Portugal', code:'PT' },
  { flag:'🇶🇦', name:'Qatar', code:'QA' },
  { flag:'🇷🇴', name:'Romania', code:'RO' },
  { flag:'🇷🇺', name:'Russia', code:'RU' },
  { flag:'🇷🇼', name:'Rwanda', code:'RW' },
  { flag:'🇰🇳', name:'Saint Kitts and Nevis', code:'KN' },
  { flag:'🇱🇨', name:'Saint Lucia', code:'LC' },
  { flag:'🇻🇨', name:'Saint Vincent', code:'VC' },
  { flag:'🇼🇸', name:'Samoa', code:'WS' },
  { flag:'🇸🇲', name:'San Marino', code:'SM' },
  { flag:'🇸🇹', name:'Sao Tome and Principe', code:'ST' },
  { flag:'🇸🇦', name:'Saudi Arabia', code:'SA' },
  { flag:'🇸🇳', name:'Senegal', code:'SN' },
  { flag:'🇷🇸', name:'Serbia', code:'RS' },
  { flag:'🇸🇨', name:'Seychelles', code:'SC' },
  { flag:'🇸🇱', name:'Sierra Leone', code:'SL' },
  { flag:'🇸🇬', name:'Singapore', code:'SG' },
  { flag:'🇸🇰', name:'Slovakia', code:'SK' },
  { flag:'🇸🇮', name:'Slovenia', code:'SI' },
  { flag:'🇸🇧', name:'Solomon Islands', code:'SB' },
  { flag:'🇸🇴', name:'Somalia', code:'SO' },
  { flag:'🇿🇦', name:'South Africa', code:'ZA' },
  { flag:'🇸🇸', name:'South Sudan', code:'SS' },
  { flag:'🇪🇸', name:'Spain', code:'ES' },
  { flag:'🇱🇰', name:'Sri Lanka', code:'LK' },
  { flag:'🇸🇩', name:'Sudan', code:'SD' },
  { flag:'🇸🇷', name:'Suriname', code:'SR' },
  { flag:'🇸🇪', name:'Sweden', code:'SE' },
  { flag:'🇨🇭', name:'Switzerland', code:'CH' },
  { flag:'🇸🇾', name:'Syria', code:'SY' },
  { flag:'🇹🇼', name:'Taiwan', code:'TW' },
  { flag:'🇹🇯', name:'Tajikistan', code:'TJ' },
  { flag:'🇹🇿', name:'Tanzania', code:'TZ' },
  { flag:'🇹🇭', name:'Thailand', code:'TH' },
  { flag:'🇹🇱', name:'Timor-Leste', code:'TL' },
  { flag:'🇹🇬', name:'Togo', code:'TG' },
  { flag:'🇹🇴', name:'Tonga', code:'TO' },
  { flag:'🇹🇹', name:'Trinidad and Tobago', code:'TT' },
  { flag:'🇹🇳', name:'Tunisia', code:'TN' },
  { flag:'🇹🇷', name:'Turkey', code:'TR' },
  { flag:'🇹🇲', name:'Turkmenistan', code:'TM' },
  { flag:'🇺🇬', name:'Uganda', code:'UG' },
  { flag:'🇺🇦', name:'Ukraine', code:'UA' },
  { flag:'🇦🇪', name:'United Arab Emirates', code:'AE' },
  { flag:'🇬🇧', name:'United Kingdom', code:'GB' },
  { flag:'🇺🇸', name:'USA', code:'US' },
  { flag:'🇺🇾', name:'Uruguay', code:'UY' },
  { flag:'🇺🇿', name:'Uzbekistan', code:'UZ' },
  { flag:'🇻🇺', name:'Vanuatu', code:'VU' },
  { flag:'🇻🇦', name:'Vatican City', code:'VA' },
  { flag:'🇻🇪', name:'Venezuela', code:'VE' },
  { flag:'🇻🇳', name:'Vietnam', code:'VN' },
  { flag:'🇾🇪', name:'Yemen', code:'YE' },
  { flag:'🇿🇲', name:'Zambia', code:'ZM' },
  { flag:'🇿🇼', name:'Zimbabwe', code:'ZW' },
];

const ALL_COUNTRIES = [
  {flag:'',name:'Afghanistan',code:'AF'},{flag:'',name:'Albania',code:'AL'},{flag:'',name:'Algeria',code:'DZ'},
  {flag:'',name:'Andorra',code:'AD'},{flag:'',name:'Angola',code:'AO'},{flag:'',name:'Antigua y Barbuda',code:'AG'},
  {flag:'',name:'Arabia Saudita',code:'SA'},{flag:'',name:'Argentina',code:'AR'},{flag:'',name:'Armenia',code:'AM'},
  {flag:'',name:'Australia',code:'AU'},{flag:'',name:'Austria',code:'AT'},{flag:'',name:'Azerbaiyán',code:'AZ'},
  {flag:'',name:'Bahamas',code:'BS'},{flag:'',name:'Bahréin',code:'BH'},{flag:'',name:'Bangladesh',code:'BD'},
  {flag:'',name:'Barbados',code:'BB'},{flag:'',name:'Bélgica',code:'BE'},{flag:'',name:'Belice',code:'BZ'},
  {flag:'',name:'Benín',code:'BJ'},{flag:'',name:'Bielorrusia',code:'BY'},{flag:'',name:'Bolivia',code:'BO'},
  {flag:'',name:'Bosnia y Herzegovina',code:'BA'},{flag:'',name:'Botsuana',code:'BW'},{flag:'',name:'Brasil',code:'BR'},
  {flag:'',name:'Brunéi',code:'BN'},{flag:'',name:'Bulgaria',code:'BG'},{flag:'',name:'Burkina Faso',code:'BF'},
  {flag:'',name:'Burundi',code:'BI'},{flag:'',name:'Bután',code:'BT'},{flag:'',name:'Cabo Verde',code:'CV'},
  {flag:'',name:'Camboya',code:'KH'},{flag:'',name:'Camerún',code:'CM'},{flag:'',name:'Canadá',code:'CA'},
  {flag:'',name:'Chad',code:'TD'},{flag:'',name:'Chile',code:'CL'},{flag:'',name:'China',code:'CN'},
  {flag:'',name:'Chipre',code:'CY'},{flag:'',name:'Colombia',code:'CO'},{flag:'',name:'Comoras',code:'KM'},
  {flag:'',name:'Congo',code:'CG'},{flag:'',name:'Congo DR',code:'CD'},{flag:'',name:'Corea del Norte',code:'KP'},
  {flag:'',name:'Corea del Sur',code:'KR'},{flag:'',name:'Costa Rica',code:'CR'},{flag:'',name:'Croacia',code:'HR'},
  {flag:'',name:'Cuba',code:'CU'},{flag:'',name:'Dinamarca',code:'DK'},{flag:'',name:'Djibouti',code:'DJ'},
  {flag:'',name:'Ecuador',code:'EC'},{flag:'',name:'Egipto',code:'EG'},{flag:'',name:'El Salvador',code:'SV'},
  {flag:'',name:'Emiratos Árabes',code:'AE'},{flag:'',name:'Eritrea',code:'ER'},{flag:'',name:'Eslovaquia',code:'SK'},
  {flag:'',name:'Eslovenia',code:'SI'},{flag:'',name:'España',code:'ES'},{flag:'',name:'Estonia',code:'EE'},
  {flag:'',name:'Etiopía',code:'ET'},{flag:'',name:'Filipinas',code:'PH'},{flag:'',name:'Finlandia',code:'FI'},
  {flag:'',name:'Fiyi',code:'FJ'},{flag:'',name:'Francia',code:'FR'},{flag:'',name:'Gabón',code:'GA'},
  {flag:'',name:'Gambia',code:'GM'},{flag:'',name:'Georgia',code:'GE'},{flag:'',name:'Ghana',code:'GH'},
  {flag:'',name:'Granada',code:'GD'},{flag:'',name:'Grecia',code:'GR'},{flag:'',name:'Guatemala',code:'GT'},
  {flag:'',name:'Guinea',code:'GN'},{flag:'',name:'Guinea Ecuatorial',code:'GQ'},{flag:'',name:'Guinea-Bisáu',code:'GW'},
  {flag:'',name:'Guyana',code:'GY'},{flag:'',name:'Haití',code:'HT'},{flag:'',name:'Honduras',code:'HN'},
  {flag:'',name:'Hungría',code:'HU'},{flag:'',name:'India',code:'IN'},{flag:'',name:'Indonesia',code:'ID'},
  {flag:'',name:'Irak',code:'IQ'},{flag:'',name:'Irán',code:'IR'},{flag:'',name:'Irlanda',code:'IE'},
  {flag:'',name:'Islandia',code:'IS'},{flag:'',name:'Islas Salomón',code:'SB'},{flag:'',name:'Israel',code:'IL'},
  {flag:'',name:'Italia',code:'IT'},{flag:'',name:'Jamaica',code:'JM'},{flag:'',name:'Japón',code:'JP'},
  {flag:'',name:'Jordania',code:'JO'},{flag:'',name:'Kazajistán',code:'KZ'},{flag:'',name:'Kenia',code:'KE'},
  {flag:'',name:'Kirguistán',code:'KG'},{flag:'',name:'Kiribati',code:'KI'},{flag:'',name:'Kuwait',code:'KW'},
  {flag:'',name:'Laos',code:'LA'},{flag:'',name:'Lesoto',code:'LS'},{flag:'',name:'Letonia',code:'LV'},
  {flag:'',name:'Líbano',code:'LB'},{flag:'',name:'Liberia',code:'LR'},{flag:'',name:'Libia',code:'LY'},
  {flag:'',name:'Liechtenstein',code:'LI'},{flag:'',name:'Lituania',code:'LT'},{flag:'',name:'Luxemburgo',code:'LU'},
  {flag:'',name:'Macedonia del Norte',code:'MK'},{flag:'',name:'Madagascar',code:'MG'},{flag:'',name:'Malaui',code:'MW'},
  {flag:'',name:'Malasia',code:'MY'},{flag:'',name:'Maldivas',code:'MV'},{flag:'',name:'Malí',code:'ML'},
  {flag:'',name:'Malta',code:'MT'},{flag:'',name:'Marruecos',code:'MA'},{flag:'',name:'Mauricio',code:'MU'},
  {flag:'',name:'Mauritania',code:'MR'},{flag:'',name:'México',code:'MX'},{flag:'',name:'Micronesia',code:'FM'},
  {flag:'',name:'Moldavia',code:'MD'},{flag:'',name:'Mónaco',code:'MC'},{flag:'',name:'Mongolia',code:'MN'},
  {flag:'',name:'Montenegro',code:'ME'},{flag:'',name:'Mozambique',code:'MZ'},{flag:'',name:'Myanmar',code:'MM'},
  {flag:'',name:'Namibia',code:'NA'},{flag:'',name:'Nauru',code:'NR'},{flag:'',name:'Nepal',code:'NP'},
  {flag:'',name:'Nicaragua',code:'NI'},{flag:'',name:'Níger',code:'NE'},{flag:'',name:'Nigeria',code:'NG'},
  {flag:'',name:'Noruega',code:'NO'},{flag:'',name:'Nueva Zelanda',code:'NZ'},{flag:'',name:'Omán',code:'OM'},
  {flag:'',name:'Países Bajos',code:'NL'},{flag:'',name:'Pakistán',code:'PK'},{flag:'',name:'Palaos',code:'PW'},
  {flag:'',name:'Panamá',code:'PA'},{flag:'',name:'Papúa Nueva Guinea',code:'PG'},{flag:'',name:'Paraguay',code:'PY'},
  {flag:'',name:'Perú',code:'PE'},{flag:'',name:'Polonia',code:'PL'},{flag:'',name:'Portugal',code:'PT'},
  {flag:'',name:'Qatar',code:'QA'},{flag:'',name:'Reino Unido',code:'GB'},{flag:'',name:'Rep. Centroafricana',code:'CF'},
  {flag:'',name:'Rep. Checa',code:'CZ'},{flag:'',name:'Rep. Dominicana',code:'DO'},{flag:'',name:'Ruanda',code:'RW'},
  {flag:'',name:'Rumanía',code:'RO'},{flag:'',name:'Rusia',code:'RU'},{flag:'',name:'Samoa',code:'WS'},
  {flag:'',name:'San Cristóbal y Nieves',code:'KN'},{flag:'',name:'San Marino',code:'SM'},{flag:'',name:'San Vicente',code:'VC'},
  {flag:'',name:'Santa Lucía',code:'LC'},{flag:'',name:'Santo Tomé y Príncipe',code:'ST'},{flag:'',name:'Senegal',code:'SN'},
  {flag:'',name:'Serbia',code:'RS'},{flag:'',name:'Seychelles',code:'SC'},{flag:'',name:'Sierra Leona',code:'SL'},
  {flag:'',name:'Singapur',code:'SG'},{flag:'',name:'Somalia',code:'SO'},{flag:'',name:'Sri Lanka',code:'LK'},
  {flag:'',name:'Suazilandia',code:'SZ'},{flag:'',name:'Sudáfrica',code:'ZA'},{flag:'',name:'Sudán',code:'SD'},
  {flag:'',name:'Sudán del Sur',code:'SS'},{flag:'',name:'Suecia',code:'SE'},{flag:'',name:'Suiza',code:'CH'},
  {flag:'',name:'Surinam',code:'SR'},{flag:'',name:'Siria',code:'SY'},{flag:'',name:'Tayikistán',code:'TJ'},
  {flag:'',name:'Tailandia',code:'TH'},{flag:'',name:'Taiwán',code:'TW'},{flag:'',name:'Tanzania',code:'TZ'},
  {flag:'',name:'Timor Oriental',code:'TL'},{flag:'',name:'Togo',code:'TG'},{flag:'',name:'Tonga',code:'TO'},
  {flag:'',name:'Trinidad y Tobago',code:'TT'},{flag:'',name:'Túnez',code:'TN'},{flag:'',name:'Turkmenistán',code:'TM'},
  {flag:'',name:'Turquía',code:'TR'},{flag:'',name:'Ucrania',code:'UA'},{flag:'',name:'Uganda',code:'UG'},
  {flag:'',name:'Uruguay',code:'UY'},{flag:'',name:'USA',code:'US'},{flag:'',name:'Uzbekistán',code:'UZ'},
  {flag:'',name:'Vanuatu',code:'VU'},{flag:'',name:'Vaticano',code:'VA'},{flag:'',name:'Venezuela',code:'VE'},
  {flag:'',name:'Vietnam',code:'VN'},{flag:'',name:'Yemen',code:'YE'},{flag:'',name:'Yibuti',code:'DJ'},
  {flag:'',name:'Zambia',code:'ZM'},{flag:'',name:'Zimbabue',code:'ZW'},
]

export default function RegisterScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [country,  setCountry]  = useState(-1); // -1 = ninguno seleccionado
  const [selectedCountry, setSelectedCountry] = useState<{flag:string,name:string,code:string} | null>(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [focusField, setFocusField] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular, BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold, BarlowCondensed_700Bold,
    Barlow_400Regular, Barlow_500Medium,
  });


  const [googleRequest, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
  });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') {
      const idToken = googleResponse.authentication?.idToken;
      if (idToken) {
        signInWithGoogleCredential(idToken)
          .then(() => navigation.navigate('Main'))
          .catch(() => setError('Error con Google. Intenta con email.'));
      }
    }
  }, [googleResponse]);

  async function handleGoogleRegister() {
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      await promptGoogleAsync();
      return;
    }
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
        await setDoc(userRef, {
          userId: user.uid,
          username: user.displayName?.replace(/\s+/g, '_').toLowerCase() || 'golzair_' + user.uid.slice(0,6),
          country: 'OT',
          language: 'es',
          timezone,
          plan: 'free',
          planExpiry: null,
          totalPoints: 0,
          currentStreak: 0,
          maxStreak: 0,
          fcmToken: null,
          createdAt: serverTimestamp(),
          lastActive: serverTimestamp(),
        });
      }
      navigation.navigate('Main');
    } catch(e: any) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError('Error con Google. Intenta con email.');
      }
    }
  }

  if (!fontsLoaded) return <View style={s.root} />;

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:10, duration:60, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:-10, duration:60, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:6, duration:60, useNativeDriver:true }),
      Animated.timing(shakeAnim, { toValue:0, duration:60, useNativeDriver:true }),
    ]).start();
  }

  async function handleContinue() {
    if (username.trim().length < 3) { setError(t('reg_min_username')); shake(); return; }
    if (!email.includes('@')) { setError(t('reg_invalid_email')); shake(); return; }
    if (password.length < 6) { setError(t('reg_min_password')); shake(); return; }
    if (password !== confirmPassword) { setError(t('reg_password_match')); shake(); return; }
    if (!selectedCountry) { setError(t('reg_select_country')); shake(); return; }

    try {
      setLoading(true); setError('');
      // Validar username unico
      const usernameSnap = await getDocs(query(collection(db, 'users'), where('username', '==', username.trim())));
      if (!usernameSnap.empty) { setError('Este nombre de usuario ya esta en uso.'); setLoading(false); shake(); return; }

      const countryCode = selectedCountry ? selectedCountry.code : 'OT';
      const { getAuth, EmailAuthProvider, linkWithCredential } = require('firebase/auth');
      const currentUser = getAuth().currentUser;
      if (currentUser && currentUser.isAnonymous) {
        try {
          const credential = EmailAuthProvider.credential(email, password);
          await linkWithCredential(currentUser, credential);
          const { updateProfile } = require('firebase/auth');
          
          await updateProfile(currentUser, { displayName: username });
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';
          await updateDoc(doc(db, 'users', currentUser.uid), {
            username, country: countryCode,
            language: 'es', timezone,
            plan: 'free', isAnonymous: false,
            updatedAt: serverTimestamp(),
          });
        } catch (linkError: any) {
          if (linkError.code !== 'auth/email-already-in-use') throw linkError;
          await registerWithEmail(email, password, username, countryCode);
        }
      } else {
        await registerWithEmail(email, password, username, countryCode);
      }
      navigation.navigate('Plans');
    } catch (e: any) {
      setError(e.message || 'Error al registrar'); shake();
    } finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill} />
      <View style={s.glowTop} />
      <View style={s.glowBottom} />
      <View style={s.topLine} />

      {/* Modal países */}
      <Modal visible={showCountryModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <TouchableOpacity onPress={() => { setShowCountryModal(false); setCountrySearch(''); }}>
                <Text style={s.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Buscar país..."
              placeholderTextColor="#6B7A99"
              value={countrySearch}
              onChangeText={setCountrySearch}
              style={{margin:12,padding:10,backgroundColor:'rgba(255,255,255,0.06)',borderRadius:10,borderWidth:1,borderColor:'rgba(255,255,255,0.1)',color:'#fff',fontFamily:'BarlowCondensed_400Regular',fontSize:14}}
            />
            <FlatList
              data={ALL_COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.modalItem}
                  onPress={() => {
                    setSelectedCountry(item);
                    setCountry(8);
                    setShowCountryModal(false);
                  }}
                >
                  <Text style={s.modalFlag}>{item.flag}</Text>
                  <Text style={s.modalCountryName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backTxt}>← {t('back')}</Text>
        </TouchableOpacity>
        <Image
          source={{ uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5' }}
          style={s.topLogo} resizeMode="contain"
        />
        <View style={{ width:60 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={s.titleWrap}>
          <Text style={s.eyebrow}>GOLZI · MUNDIAL 2026</Text>
          <Text style={s.title}>{t('register_title')}</Text>
          <View style={s.titleLine} />
          <Text style={s.subtitle}>{t('register_subtitle')}</Text>
        </View>

        <Animated.View style={[s.formCard, { transform:[{ translateX: shakeAnim }] }]}>
          <LinearGradient
            colors={['rgba(255,215,0,0.06)','rgba(255,215,0,0.02)','transparent']}
            start={{x:0,y:0}} end={{x:1,y:1}}
            style={s.formCardGlow}
          />

          {/* Username */}
          <Text style={s.label}>{t('register_username')}</Text>
          <View style={[s.inputWrap, focusField==='user' && s.inputFocus]}>
            <Text style={s.inputIcon}>👤</Text>
            <Text style={s.prefix}>@</Text>
            <TextInput style={s.input} placeholder="tu_nombre" placeholderTextColor={C.muted}
              value={username} onChangeText={v => { setUsername(v); setError(''); }}
              onFocus={() => setFocusField('user')} onBlur={() => setFocusField('')}
              autoCapitalize="none" autoCorrect={false} maxLength={24} />
          </View>

          {/* Email */}
          <Text style={s.label}>{t('login_email')}</Text>
          <View style={[s.inputWrap, focusField==='email' && s.inputFocus]}>
            <Text style={s.inputIcon}>✉️</Text>
            <TextInput style={s.input} placeholder="tu@email.com" placeholderTextColor={C.muted}
              value={email} onChangeText={v => { setEmail(v); setError(''); }}
              onFocus={() => setFocusField('email')} onBlur={() => setFocusField('')}
              autoCapitalize="none" keyboardType="email-address" />
          </View>

          {/* Password */}
          <Text style={s.label}>{t('login_password')}</Text>
          <View style={[s.inputWrap, focusField==='pass' && s.inputFocus]}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="min. 6 caracteres" placeholderTextColor={C.muted}
              value={password} onChangeText={v => { setPassword(v); setError(''); }}
              onFocus={() => setFocusField('pass')} onBlur={() => setFocusField('')}
              secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
              <Text style={s.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirmar Password */}
          <Text style={s.label}>CONFIRMAR CONTRASEÑA</Text>
          <View style={[s.inputWrap, focusField==='confirm' && s.inputFocus]}>
            <Text style={s.inputIcon}>🔒</Text>
            <TextInput style={s.input} placeholder="repite tu contraseña" placeholderTextColor={C.muted}
              value={confirmPassword} onChangeText={v => { setConfirmPassword(v); setError(''); }}
              onFocus={() => setFocusField('confirm')} onBlur={() => setFocusField('')}
              secureTextEntry={!showConfirmPassword} />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={s.eyeBtn}>
              <Text style={s.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorTxt}>⚠️  {error}</Text>
            </View>
          ) : null}
        </Animated.View>

        {/* País */}
        <Text style={s.label}>{t('register_country')}</Text>
        

        <View style={{backgroundColor:'rgba(255,215,0,0.08)',borderRadius:10,padding:10,marginBottom:10,borderWidth:1,borderColor:'rgba(255,215,0,0.3)'}}>
          <Text style={{fontFamily:'BarlowCondensed_400Regular',fontSize:11,color:'#FFD700',textAlign:'center'}}>⚠️ Obligatorio · Elige tu país. Define tu ranking global y bandera en tu perfil.</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCountryModal(true)}
          style={{
            flexDirection:'row', alignItems:'center', gap:12,
            backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1,
            borderColor: selectedCountry ? 'rgba(255,215,0,0.4)' : 'rgba(255,255,255,0.1)',
            borderRadius:12, padding:14, marginBottom:20,
          }}
        >
          {selectedCountry ? (
            <>
              <Image source={{uri:`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}} style={{width:32,height:22,borderRadius:3}} resizeMode="cover"/>
              <Text style={{fontFamily:'BarlowCondensed_700Bold',fontSize:15,color:'#FFD700',flex:1}}>{selectedCountry.name}</Text>
            </>
          ) : (
            <>
              <Text style={{fontSize:22}}>🌍</Text>
              <Text style={{fontFamily:'BarlowCondensed_400Regular',fontSize:14,color:'#6B7A99',flex:1}}>Selecciona tu país...</Text>
            </>
          )}
          <Text style={{fontFamily:'BarlowCondensed_700Bold',fontSize:16,color:'#6B7A99'}}>▼</Text>
        </TouchableOpacity>

        {/* Botón */}
        <TouchableOpacity style={s.btnWrap} onPress={handleContinue} activeOpacity={0.85} disabled={loading}>
          <LinearGradient
            colors={loading ? ['#555','#333'] : ['#FFD700','#FFA500','#E8A000']}
            start={{x:0,y:0}} end={{x:1,y:0}} style={s.btn}
          >
            <Text style={s.btnTxt}>{loading ? t('loading') : `⚡  ${t('register_btn')}`}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divisor */}
        <View style={s.divRow}>
          <View style={s.divLine} />
          <Text style={s.divTxt}>{t('register_or')}</Text>
          <View style={s.divLine} />
        </View>

        {/* Social login — próximamente */}

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={s.loginBtn}>
          <Text style={s.loginTxt}>{t('login_have_account')}</Text>
        </TouchableOpacity>

        <Text style={s.fine}>{t('register_terms')}</Text>
      </ScrollView>

      <View style={s.bottomLine} />
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:C.darker },
  topLine:{ position:'absolute', top:0, left:0, right:0, height:2, backgroundColor:'rgba(255,215,0,0.5)', zIndex:10 },
  bottomLine:{ position:'absolute', bottom:0, left:0, right:0, height:1, backgroundColor:'rgba(255,215,0,0.15)' },
  glowTop:{ position:'absolute', width:350, height:350, borderRadius:175, top:-100, alignSelf:'center', backgroundColor:'rgba(255,215,0,0.07)' },
  glowBottom:{ position:'absolute', width:250, height:250, borderRadius:125, bottom:-80, right:-80, backgroundColor:'rgba(0,198,255,0.04)' },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:16, paddingTop:52, paddingBottom:14, borderBottomWidth:1, borderBottomColor:'rgba(255,215,0,0.1)' },
  backBtn:{ width:60 },
  backTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.muted },
  topLogo:{ width:36, height:36 },
  scroll:{ paddingHorizontal:16, paddingTop:20, paddingBottom:40 },
  titleWrap:{ marginBottom:20 },
  eyebrow:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, color:'rgba(255,215,0,0.5)', letterSpacing:3, marginBottom:4 },
  title:{ fontFamily:'BebasNeue_400Regular', fontSize:44, color:C.gold, letterSpacing:2, lineHeight:48 },
  titleLine:{ width:48, height:3, backgroundColor:C.gold, borderRadius:2, marginVertical:8 },
  subtitle:{ fontFamily:'BarlowCondensed_400Regular', fontSize:14, color:C.muted },
  formCard:{ backgroundColor:'rgba(255,255,255,0.03)', borderRadius:20, borderWidth:1, borderColor:'rgba(255,215,0,0.12)', padding:16, marginBottom:16, overflow:'hidden' },
  formCardGlow:{ position:'absolute', top:0, left:0, right:0, bottom:0 },
  label:{ fontFamily:'BarlowCondensed_700Bold', fontSize:9, letterSpacing:2, color:C.muted, textTransform:'uppercase', marginBottom:6, marginTop:4 },
  inputWrap:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingHorizontal:12, height:50, marginBottom:10 },
  inputFocus:{ borderColor:'rgba(255,215,0,0.5)', backgroundColor:'rgba(255,215,0,0.05)' },
  inputIcon:{ fontSize:15, marginRight:8 },
  prefix:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:18, color:C.muted, marginRight:4 },
  input:{ flex:1, fontFamily:'Barlow_400Regular', fontSize:15, color:C.text } as any,
  eyeBtn:{ padding:4 },
  eyeIcon:{ fontSize:16 },
  errorBox:{ backgroundColor:'rgba(232,0,61,0.1)', borderWidth:1, borderColor:'rgba(232,0,61,0.3)', borderRadius:10, padding:10 },
  errorTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:12, color:C.red, letterSpacing:0.3 },
  countryNote:{ backgroundColor:'rgba(255,215,0,0.06)', borderWidth:1, borderColor:'rgba(255,215,0,0.15)', borderRadius:10, padding:10, marginBottom:12 },
  countryNoteTxt:{ fontFamily:'Barlow_400Regular', fontSize:11, color:C.muted2, lineHeight:16 },
  countryGrid:{ flexDirection:'row', flexWrap:'wrap', gap:7, marginBottom:20 },
  countryBtn:{ borderRadius:10, overflow:'hidden', borderWidth:1, borderColor:'rgba(255,255,255,0.06)' },
  countryBtnOn:{ borderColor:'rgba(255,215,0,0.4)' },
  countryBtnGrad:{ flexDirection:'row', alignItems:'center', gap:6, paddingVertical:8, paddingHorizontal:10 },
  countryFlag:{ fontSize:16 },
  countryName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:11, color:C.muted2 },
  countryNameOn:{ color:C.gold },
  btnWrap:{ width:'100%', marginBottom:16, borderRadius:14, overflow:'hidden', shadowColor:C.gold, shadowOffset:{width:0,height:6}, shadowOpacity:0.4, shadowRadius:16 },
  btn:{ borderRadius:14, paddingVertical:16, alignItems:'center' },
  btnTxt:{ fontFamily:'BebasNeue_400Regular', fontSize:19, letterSpacing:3, color:'#000' },
  divRow:{ flexDirection:'row', alignItems:'center', gap:10, marginBottom:12 },
  divLine:{ flex:1, height:1, backgroundColor:'rgba(255,255,255,0.06)' },
  divTxt:{ fontFamily:'BarlowCondensed_400Regular', fontSize:11, color:C.muted, letterSpacing:1 },
  socialRow:{ flexDirection:'row', gap:10, marginBottom:12 },
  socialBtn:{ flex:1, borderWidth:1, borderColor:'rgba(255,255,255,0.08)', borderRadius:12, paddingVertical:12, alignItems:'center', backgroundColor:'rgba(255,255,255,0.04)' },
  socialTxt:{ fontFamily:'Barlow_500Medium', fontSize:13, color:C.text },
  loginBtn:{ alignItems:'center', paddingVertical:10, marginBottom:8 },
  loginTxt:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:13, color:C.gold, letterSpacing:0.5 },
  fine:{ fontFamily:'Barlow_400Regular', fontSize:10, color:C.muted, textAlign:'center', lineHeight:16 },
  modalOverlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.8)', justifyContent:'flex-end' },
  modalContent:{ backgroundColor:'#0D1117', borderTopLeftRadius:24, borderTopRightRadius:24, maxHeight:'80%', paddingBottom:32 },
  modalHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.06)' },
  modalTitle:{ fontFamily:'BebasNeue_400Regular', fontSize:24, color:C.gold, letterSpacing:2 },
  modalClose:{ fontSize:18, color:C.muted, padding:4 },
  modalItem:{ flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingVertical:14, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.04)' },
  modalFlag:{ fontSize:24, marginRight:14 },
  modalCountryName:{ fontFamily:'BarlowCondensed_600SemiBold', fontSize:16, color:C.text },
});