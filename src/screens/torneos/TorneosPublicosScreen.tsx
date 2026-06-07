import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, onSnapshot, query, getDocs, doc, updateDoc, arrayUnion, getDoc, setDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold } from '@expo-google-fonts/barlow-condensed';

const C = {
  bg:'#020408', surface:'#0A0F1A', gold:'#FFD700', gold2:'#FFA500',
  green:'#00FF87', cyan:'#00C6FF', red:'#FF3355', muted:'#6B7A99', text:'#FFFFFF',
};

const SOEMEX_LIGA_ID = 'EMNGKyhHwDMbD8Da3bkZ';
const SOEMEX_TORNEO_ID = 'AjWDEeAmswbDSXV1HkBs';
const SOEMEX_LOGO = 'https://storage.googleapis.com/golzi-2026.firebasestorage.app/branding/EMNGKyhHwDMbD8Da3bkZ/logo.png';

const DEMO_TOURNAMENTS = [
  { id:'demo1', name:'Copa Bar El Estadio', ligaName:'Bar El Estadio', ciudad:'Bogotá', pais:'Colombia', flag:'🇨🇴', brandColor:'#FFD700', description:'Torneo oficial de predicciones del Mundial 2026', prize:'$500.000 COP en consumo + 2 entradas al partido', startDate:'2026-06-11', endDate:'2026-07-19', participants:847, maxParticipants:1000, status:'active', isDemo:true, isPublic:false, tags:['Sports Bar'] },
  { id:'demo2', name:'Copa La Leña · Mundial 2026', ligaName:'Restaurante La Leña', ciudad:'Medellín', pais:'Colombia', flag:'🇨🇴', brandColor:'#F97316', description:'Torneo para clientes del restaurante', prize:'Cena para 4 personas + botella de vino', startDate:'2026-06-11', endDate:'2026-07-19', participants:178, maxParticipants:200, status:'active', isDemo:true, isPublic:false, tags:['Restaurante'] },
  { id:'demo4', name:'Copa Cervecería Reforma', ligaName:'Cervecería Reforma', ciudad:'Ciudad de México', pais:'México', flag:'🇲🇽', brandColor:'#00FF87', description:'El torneo más grande de la CDMX', prize:'$10,000 MXN en consumo + playera oficial', startDate:'2026-06-11', endDate:'2026-07-19', participants:923, maxParticipants:1000, status:'active', isDemo:true, isPublic:false, tags:['Cervecería'] },
  { id:'demo5', name:'Copa Sports Bar Palermo', ligaName:'Sports Bar Palermo', ciudad:'Buenos Aires', pais:'Argentina', flag:'🇦🇷', brandColor:'#A78BFA', description:'Torneo para hinchas de toda Argentina', prize:'$50,000 ARS en consumo + camiseta', startDate:'2026-06-11', endDate:'2026-07-19', participants:756, maxParticipants:800, status:'active', isDemo:true, isPublic:false, tags:['Sports Bar'] },
  { id:'demo6', name:'El Cordobazo · Copa Mundial', ligaName:'El Cordobazo Sports Bar', ciudad:'Córdoba', pais:'Argentina', flag:'🇦🇷', brandColor:'#EC4899', description:'Torneo para la comunidad cordobesa', prize:'$30,000 ARS + noche de asado para el ganador', startDate:'2026-06-11', endDate:'2026-07-19', participants:234, maxParticipants:300, status:'active', isDemo:true, isPublic:false, tags:['Bar'] },
  { id:'demo7', name:'Copa Bar do Zé · Brasil 2026', ligaName:'Bar do Zé', ciudad:'São Paulo', pais:'Brasil', flag:'🇧🇷', brandColor:'#00FF87', description:'Torneio do Mundial para os fãs do futebol', prize:'R$500 em consumação + camisa da seleção', startDate:'2026-06-11', endDate:'2026-07-19', participants:445, maxParticipants:500, status:'active', isDemo:true, isPublic:false, tags:['Bar'] },
  { id:'demo8', name:'Copa El Estadio · Chile', ligaName:'El Estadio Bar', ciudad:'Santiago', pais:'Chile', flag:'🇨🇱', brandColor:'#FF3355', description:'El torneo más popular de Santiago', prize:'$150,000 CLP en consumo', startDate:'2026-06-11', endDate:'2026-07-19', participants:312, maxParticipants:400, status:'active', isDemo:true, isPublic:false, tags:['Sports Bar'] },
  { id:'demo9', name:'Copa La Cancha · Lima', ligaName:'La Cancha Sports Bar', ciudad:'Lima', pais:'Perú', flag:'🇵🇪', brandColor:'#FFD700', description:'El torneo peruano del Mundial 2026', prize:'S/300 en consumo + regalo sorpresa', startDate:'2026-06-11', endDate:'2026-07-19', participants:189, maxParticipants:250, status:'active', isDemo:true, isPublic:false, tags:['Sports Bar'] },
  { id:'demo10', name:'Copa Latino Sports Bar · Miami', ligaName:'Latino Sports Bar', ciudad:'Miami', pais:'USA', flag:'🇺🇸', brandColor:'#00C6FF', description:'The biggest Latino tournament in South Florida', prize:'$200 USD bar tab + World Cup jersey', startDate:'2026-06-11', endDate:'2026-07-19', participants:567, maxParticipants:600, status:'active', isDemo:true, isPublic:false, tags:['Sports Bar'] },
  { id:'demo11', name:'Copa Latina · Los Angeles', ligaName:'Copa Latina LA', ciudad:'Los Angeles', pais:'USA', flag:'🇺🇸', brandColor:'#F97316', description:'The ultimate World Cup prediction tournament in LA', prize:'$300 USD + VIP experience', startDate:'2026-06-11', endDate:'2026-07-19', participants:834, maxParticipants:1000, status:'active', isDemo:true, isPublic:false, tags:['Comunidad'] },
  { id:'demo12', name:'Copa Bar Caracas 2026', ligaName:'Bar Caracas', ciudad:'Caracas', pais:'Venezuela', flag:'🇻🇪', brandColor:'#A78BFA', description:'El torneo oficial de predicciones en Caracas', prize:'Consumo para 4 + camiseta oficial', startDate:'2026-06-11', endDate:'2026-07-19', participants:298, maxParticipants:400, status:'active', isDemo:true, isPublic:false, tags:['Bar'] },
  { id:'demo13', name:'Copa El Golazo · Maracaibo', ligaName:'El Golazo Bar', ciudad:'Maracaibo', pais:'Venezuela', flag:'🇻🇪', brandColor:'#FFD700', description:'El torneo más esperado de Maracaibo', prize:'Cena especial + sorpresa del campeón', startDate:'2026-06-11', endDate:'2026-07-19', participants:145, maxParticipants:200, status:'active', isDemo:true, isPublic:false, tags:['Bar'] },
  { id:'demo14', name:'Copa Av. Balboa · Panamá', ligaName:'Av. Balboa Sports Bar', ciudad:'Ciudad de Panamá', pais:'Panamá', flag:'🇵🇦', brandColor:'#00FF87', description:'El torneo panameño del Mundial 2026', prize:'$150 USD en consumo + experiencia VIP', startDate:'2026-06-11', endDate:'2026-07-19', participants:223, maxParticipants:300, status:'upcoming', isDemo:true, isPublic:false, tags:['Sports Bar'] },
  { id:'demo15', name:'Copa El Bernabéu · Madrid', ligaName:'El Bernabéu Bar', ciudad:'Madrid', pais:'España', flag:'🇪🇸', brandColor:'#FF3355', description:'El torneo del Mundial para los aficionados madrileños', prize:'€100 en consumo + camiseta de la selección', startDate:'2026-06-11', endDate:'2026-07-19', participants:389, maxParticipants:500, status:'active', isDemo:true, isPublic:false, tags:['Bar'] },
];

export default function TorneosPublicosScreen() {
  const [publicTournaments, setPublicTournaments] = useState<any[]>([]);
  const [soemexTorneo, setSoemexTorneo] = useState<any>(null);
  const [soemexInscrito, setSoemexInscrito] = useState(false);
  const [inscribiendo, setInscribiendo] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('');
  const [userId, setUserId] = useState<string|null>(null);
  const [fontsLoaded] = useFonts({ BebasNeue_400Regular, BarlowCondensed_400Regular, BarlowCondensed_600SemiBold, BarlowCondensed_700Bold });
  const navigation = useNavigation<StackNavigationProp<any>>();

  useEffect(() => {
    const auth = getAuth();
    const u = auth.currentUser;
    if (u) {
      setUserId(u.uid);
      // Obtener país del usuario
      getDoc(doc(db, 'users', u.uid)).then(snap => {
        if (snap.exists()) setUserCountry(snap.data()?.country || '');
      });
    }
    // Cargar torneos públicos reales
    const unsubPublic = onSnapshot(
      query(collection(db, 'public_tournaments'), orderBy('createdAt', 'desc')),
      snap => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data(), isReal: true }));
        setPublicTournaments(data);
      }
    );

    // Cargar torneo SOEMEX real
    const unsub = onSnapshot(
      doc(db, 'leagues', SOEMEX_LIGA_ID, 'tournaments', SOEMEX_TORNEO_ID),
      snap => {
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setSoemexTorneo(data);
          setSoemexInscrito((data as any).participants?.includes(u?.uid));
        }
      }
    );
    return () => { unsub(); unsubPublic(); };
  }, []);

  const handleInscribirse = async () => {
    if (!userId) { Alert.alert('Inicia sesión', 'Debes tener una cuenta para inscribirte.'); return; }
    if (userCountry !== 'CO') {
      Alert.alert('Solo Colombia 🇨🇴', 'Este torneo es exclusivo para usuarios registrados en Colombia. Verifica tu país en tu perfil.');
      return;
    }
    if (soemexInscrito) { Alert.alert('Ya inscrito', 'Ya estás participando en el torneo SOEMEX.'); return; }
    setInscribiendo(true);
    try {
      await updateDoc(doc(db, 'leagues', SOEMEX_LIGA_ID, 'tournaments', SOEMEX_TORNEO_ID), {
        participants: arrayUnion(userId),
      });
      await updateDoc(doc(db, 'leagues', SOEMEX_LIGA_ID), {
        memberIds: arrayUnion(userId),
      });
      await setDoc(doc(db, 'leagues', SOEMEX_LIGA_ID, 'members', userId), {
        userId,
        username: getAuth().currentUser?.displayName || 'Jugador',
        country: userCountry || 'CO',
        totalPoints: 0,
        joinedAt: new Date().toISOString(),
        role: 'member',
      }, { merge: true });
      setSoemexInscrito(true);
      Alert.alert('✅ ¡Inscrito!', 'Quedaste inscrito en el torneo SOEMEX · Copa Mundial 2026. ¡Buena suerte!');
    } catch(e) {
      Alert.alert('Error', 'No se pudo completar la inscripción.');
    } finally {
      setInscribiendo(false);
    }
  };

  const statusColor = (s: string) => s === 'active' ? C.red : s === 'upcoming' ? C.cyan : C.muted;
  const statusLabel = (s: string) => s === 'active' ? '🔴 EN VIVO' : s === 'upcoming' ? '⏳ PRÓXIMO' : '🏁 FINALIZADO';

  const renderTorneoCard = (t: any, isReal = false) => {
    const pct = Math.round((t.participants?.length || t.participants || 0) / (t.maxParticipants || 1) * 100);
    const inscritos = isReal ? (t.participants?.length || 0) : t.participants;
    const isFull = inscritos >= t.maxParticipants;
    const spotsLeft = t.maxParticipants - inscritos;

    return (
      <View key={t.id} style={[s.card, {borderTopColor: t.brandColor || C.gold}]}>
        <View style={[s.cardTopLine, {backgroundColor: t.brandColor || C.gold}]}/>

        {/* Header */}
        <View style={s.cardHeader}>
          {isReal && t.brandLogo ? (
            <Image source={{uri: t.brandLogo || SOEMEX_LOGO}} style={s.brandLogo} resizeMode="contain"/>
          ) : (
            <View style={[s.brandAvatar, {backgroundColor:(t.brandColor||C.gold)+'20', borderColor:t.brandColor||C.gold}]}>
              <Text style={{fontSize:20}}>🏢</Text>
            </View>
          )}
          <View style={{flex:1}}>
            <Text style={s.cardName}>{t.name}</Text>
            <Text style={s.cardLiga}>{t.ligaName || t.name}</Text>
            <View style={{flexDirection:'row',alignItems:'center',gap:6,marginTop:2,flexWrap:'wrap'}}>
              <Text style={{fontSize:10,color:C.muted}}>{t.flag || ''} {t.ciudad}, {t.pais}</Text>
              <View style={[s.visibilityBadge, t.isPublic ? s.publicBadge : s.privateBadge]}>
                <Text style={[s.visibilityTxt, {color: t.isPublic ? C.cyan : C.gold}]}>{t.isPublic ? '🌍 PÚBLICO' : '🔒 PRIVADO'}</Text>
              </View>

            </View>
          </View>
          <View style={[s.statusBadge, {backgroundColor:statusColor(t.status)+'15',borderColor:statusColor(t.status)+'40'}]}>
            <Text style={[s.statusTxt, {color:statusColor(t.status)}]}>{statusLabel(t.status)}</Text>
          </View>
        </View>

        {t.description && <Text style={s.cardDesc}>{t.description}</Text>}

        {/* Tags */}
        <View style={s.tagsRow}>
          {(t.tags||[]).map((tag:string) => (
            <View key={tag} style={s.tag}><Text style={s.tagTxt}>{tag}</Text></View>
          ))}
          <View style={s.tag}><Text style={s.tagTxt}>{t.startDate} → {t.endDate}</Text></View>
        </View>

        {/* Premios */}
        {isReal ? (
          <View style={s.prizeBox}>
            <Text style={s.prizeTxt}>{t.prize1}</Text>
            {t.prize2 ? <Text style={[s.prizeTxt, {marginTop:4, color: C.muted}]}>{t.prize2}</Text> : null}
          </View>
        ) : t.prize ? (
          <View style={s.prizeBox}>
            <Text style={s.prizeTxt}>🎁 {t.prize}</Text>
          </View>
        ) : null}

        {/* Website */}
        {t.website && (
          <TouchableOpacity onPress={() => Linking.openURL(t.website)} style={s.websiteBtn}>
            <Text style={s.websiteTxt}>🌐 {t.website || 'www.soemex.com'}</Text>
          </TouchableOpacity>
        )}

        {/* Barra participantes */}
        <View style={s.participantsRow}>
          <Text style={s.participantsTxt}>
            {isFull ? '🔴 TORNEO LLENO' : spotsLeft <= 50 ? `⚡ ¡Solo quedan ${spotsLeft} cupos!` : `👥 ${inscritos.toLocaleString()} / ${t.maxParticipants.toLocaleString()} inscritos`}
          </Text>
          <Text style={s.participantsPct}>{Math.min(pct,100)}%</Text>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, {width:`${Math.min(pct,100)}%`, backgroundColor: isFull ? C.red : t.brandColor || C.gold}]}/>
        </View>

        {/* Botón */}
        {isReal ? (
          <TouchableOpacity
            onPress={handleInscribirse}
            disabled={inscribiendo || isFull}
            style={[s.joinBtn, {
              backgroundColor: soemexInscrito ? 'rgba(0,255,135,0.1)' : isFull ? 'rgba(255,51,85,0.1)' : (t.brandColor||C.cyan)+'20',
              borderColor: soemexInscrito ? C.green : isFull ? C.red : t.brandColor||C.cyan,
            }]}
          >
            <Text style={[s.joinBtnTxt, {color: soemexInscrito ? C.green : isFull ? C.red : t.brandColor||C.cyan}]}>
              {inscribiendo ? 'INSCRIBIENDO...' : soemexInscrito ? '✅ YA ESTÁS INSCRITO' : isFull ? '🔴 TORNEO LLENO' : '⚡ INSCRIBIRME · Solo Colombia 🇨🇴'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.navigate('Plans')}
            style={[s.joinBtn, {backgroundColor:(t.brandColor||C.gold)+'15', borderColor:(t.brandColor||C.gold)+'40'}]}
          >
            <Text style={[s.joinBtnTxt, {color:t.brandColor||C.gold}]}>
              {isFull ? '🔴 TORNEO LLENO' : isReal ? '⚡ INSCRIBIRME' : '🔒 TORNEO PRIVADO · Ver planes empresariales'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (!fontsLoaded) return <View style={s.root}/>;

  return (
    <View style={s.root}>
      <LinearGradient colors={['#020408','#05080F','#020408']} style={StyleSheet.absoluteFill}/>
      <LinearGradient colors={['#020408','#05080F']} style={s.header}>
        <View style={s.topLine}/>
        <View style={s.headerLeft}>
          <Image source={{uri:'https://firebasestorage.googleapis.com/v0/b/golzi-2026.firebasestorage.app/o/icon.png?alt=media&token=2fc09f84-4a1a-4717-8f35-ef0faa08f7c5'}} style={s.headerLogo} resizeMode="contain"/>
          <View>
            <Text style={s.headerTitle}>TORNEOS</Text>
            <Text style={s.headerSub}>MUNDIAL 2026</Text>
          </View>
        </View>
        <View style={s.liveBadge}>
          <View style={s.liveDot}/>
          <Text style={s.liveTxt}>15 TORNEOS</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['rgba(255,215,0,0.1)','rgba(255,215,0,0.03)']} style={s.introBanner}>
          <Text style={s.introBannerTitle}>🏆 TORNEOS MUNDIALES</Text>
          <Text style={s.introBannerSub}>Compite en torneos creados por negocios y organizaciones · Gana premios reales</Text>
        </LinearGradient>

        {/* Torneo SOEMEX REAL primero */}
        {soemexTorneo && renderTorneoCard({...soemexTorneo, flag:'🇨🇴', ciudad:'Barranquilla', pais:'Colombia', tags:['Empresas','Colombia'], isPublic:true}, true)}

        {/* Torneos públicos reales de clientes — más reciente arriba */}
        {publicTournaments.filter(t => t.torneoId !== SOEMEX_TORNEO_ID).map(t => renderTorneoCard(t, true))}

        {/* Torneos demo siempre al final */}
        {DEMO_TOURNAMENTS.map(t => renderTorneoCard(t, false))}

        {/* CTA */}
        <LinearGradient colors={['rgba(255,215,0,0.08)','rgba(255,215,0,0.02)']} style={s.ctaBanner}>
          <Text style={s.ctaTitle}>¿Quieres crear tu propio torneo?</Text>
          <Text style={s.ctaSub}>Con los planes empresariales de GOLZI crea torneos para tus clientes con premios reales.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Plans')} style={s.ctaBtn}>
            <LinearGradient colors={[C.gold, C.gold2]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.ctaBtnInner}>
              <Text style={s.ctaBtnTxt}>⚡ VER PLANES EMPRESARIALES</Text>
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>

        <View style={s.disclaimer}>
          <Text style={s.disclaimerTxt}>⚠️ GOLZI no es responsable por los premios, promociones u ofertas publicadas por terceros. Los torneos y sus premios son responsabilidad exclusiva de cada organizador. GOLZI es un juego de predicciones deportivas sin apuestas ni dinero real.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},
  topLine:{position:'absolute',top:0,left:0,right:0,height:2,backgroundColor:'rgba(255,215,0,0.5)'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingTop:52,paddingBottom:14,borderBottomWidth:1,borderBottomColor:'rgba(255,215,0,0.15)'},
  headerLeft:{flexDirection:'row',alignItems:'center',gap:10},
  headerLogo:{width:36,height:36},
  headerTitle:{fontFamily:'BebasNeue_400Regular',fontSize:22,color:C.gold,letterSpacing:3},
  headerSub:{fontFamily:'BarlowCondensed_400Regular',fontSize:9,color:C.muted,letterSpacing:2},
  liveBadge:{flexDirection:'row',alignItems:'center',gap:6,backgroundColor:'rgba(255,215,0,0.08)',borderRadius:10,borderWidth:1,borderColor:'rgba(255,215,0,0.3)',paddingHorizontal:10,paddingVertical:6},
  liveDot:{width:6,height:6,borderRadius:3,backgroundColor:C.gold},
  liveTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:10,color:C.gold,letterSpacing:1},
  scroll:{paddingHorizontal:12,paddingBottom:40},
  introBanner:{borderRadius:14,borderWidth:1,borderColor:'rgba(255,215,0,0.2)',padding:16,marginVertical:12,alignItems:'center'},
  introBannerTitle:{fontFamily:'BebasNeue_400Regular',fontSize:22,color:C.gold,letterSpacing:3,marginBottom:6},
  introBannerSub:{fontFamily:'BarlowCondensed_400Regular',fontSize:12,color:C.muted,textAlign:'center',lineHeight:18},
  card:{backgroundColor:C.surface,borderRadius:14,borderWidth:1,borderColor:'rgba(255,255,255,0.06)',marginBottom:14,overflow:'hidden'},
  cardTopLine:{height:3},
  cardHeader:{flexDirection:'row',alignItems:'center',padding:14,paddingBottom:8,gap:10},
  brandLogo:{width:52,height:52,borderRadius:8},
  brandAvatar:{width:44,height:44,borderRadius:22,borderWidth:1.5,justifyContent:'center',alignItems:'center'},
  cardName:{fontFamily:'BarlowCondensed_700Bold',fontSize:15,color:C.text,letterSpacing:0.5},
  cardLiga:{fontFamily:'BarlowCondensed_400Regular',fontSize:11,color:C.muted,marginTop:1},
  visibilityBadge:{borderRadius:4,paddingHorizontal:5,paddingVertical:1,borderWidth:1},
  publicBadge:{backgroundColor:'rgba(0,198,255,0.1)',borderColor:'rgba(0,198,255,0.3)'},
  privateBadge:{backgroundColor:'rgba(255,215,0,0.1)',borderColor:'rgba(255,215,0,0.3)'},
  visibilityTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:8,letterSpacing:1},
  realBadge:{backgroundColor:'rgba(0,255,135,0.1)',borderRadius:4,paddingHorizontal:5,paddingVertical:1,borderWidth:1,borderColor:'rgba(0,255,135,0.3)'},
  realBadgeTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:8,color:'#00FF87',letterSpacing:1},
  statusBadge:{borderRadius:8,paddingHorizontal:8,paddingVertical:3,borderWidth:1},
  statusTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:9,letterSpacing:1},
  cardDesc:{fontFamily:'BarlowCondensed_400Regular',fontSize:12,color:C.muted,paddingHorizontal:14,marginBottom:8},
  tagsRow:{flexDirection:'row',flexWrap:'wrap',gap:6,paddingHorizontal:14,marginBottom:8},
  tag:{backgroundColor:'rgba(255,255,255,0.05)',borderRadius:6,paddingHorizontal:8,paddingVertical:3,borderWidth:1,borderColor:'rgba(255,255,255,0.08)'},
  tagTxt:{fontFamily:'BarlowCondensed_400Regular',fontSize:10,color:C.muted},
  prizeBox:{marginHorizontal:14,marginBottom:8,backgroundColor:'rgba(255,215,0,0.06)',borderRadius:8,padding:10,borderWidth:1,borderColor:'rgba(255,215,0,0.2)'},
  prizeTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:12,color:C.gold},
  websiteBtn:{marginHorizontal:14,marginBottom:8,padding:8,alignItems:'center'},
  websiteTxt:{fontFamily:'BarlowCondensed_600SemiBold',fontSize:12,color:C.cyan,textDecorationLine:'underline'},
  participantsRow:{flexDirection:'row',justifyContent:'space-between',paddingHorizontal:14,marginBottom:4},
  participantsTxt:{fontFamily:'BarlowCondensed_600SemiBold',fontSize:11,color:C.muted},
  participantsPct:{fontFamily:'BarlowCondensed_700Bold',fontSize:11,color:C.muted},
  progressBar:{height:6,backgroundColor:'rgba(255,255,255,0.06)',marginHorizontal:14,borderRadius:3,overflow:'hidden',marginBottom:12},
  progressFill:{height:6,borderRadius:3},
  joinBtn:{margin:14,marginTop:0,borderRadius:10,paddingVertical:12,alignItems:'center',borderWidth:1},
  joinBtnTxt:{fontFamily:'BarlowCondensed_700Bold',fontSize:13,letterSpacing:1},
  ctaBanner:{borderRadius:14,borderWidth:1,borderColor:'rgba(255,215,0,0.2)',padding:20,marginBottom:16,alignItems:'center',gap:10},
  ctaTitle:{fontFamily:'BebasNeue_400Regular',fontSize:20,color:C.gold,letterSpacing:2,textAlign:'center'},
  ctaSub:{fontFamily:'BarlowCondensed_400Regular',fontSize:12,color:C.muted,textAlign:'center',lineHeight:18},
  ctaBtn:{borderRadius:12,overflow:'hidden',width:'100%'},
  ctaBtnInner:{paddingVertical:14,alignItems:'center',borderRadius:12},
  ctaBtnTxt:{fontFamily:'BebasNeue_400Regular',fontSize:16,color:'#000',letterSpacing:2},
  disclaimer:{backgroundColor:'rgba(255,163,0,0.06)',borderRadius:10,borderWidth:1,borderColor:'rgba(255,163,0,0.2)',padding:12,marginBottom:8},
  disclaimerTxt:{fontFamily:'BarlowCondensed_400Regular',fontSize:10,color:C.muted,lineHeight:16,textAlign:'center'},
});
