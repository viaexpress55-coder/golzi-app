// functions/src/index.ts 
import * as admin from 'firebase-admin'; 
 
if (!admin.apps.length) { 
  admin.initializeApp(); 
} 
 
export { onMatchFinish }           from './predictions/onMatchFinish'; 
export { onMatchFinishChallenges } from './predictions/onMatchFinishChallenges'; 
export { submitPrediction }        from './predictions/validatePrediction'; 
 
export { onLeagueMemberAdded }  from './leagues/checkCapacity'; 
export { rivalryNotification }  from './leagues/rivalryNotification'; 
export { generateLeagueAssets } from './leagues/generateLeagueAssets'; 
 
export { calculateStreak } from './streaks/calculateStreak'; 
export { calculateRanking } from './rankings/calculateRanking'; 
 
export { createPaymentPreference } from './payments/createPreference'; 
export { createWompiPayment }      from './payments/createWompiPayment'; 
 
export { wompiWebhook }       from './payments/wompiWebhook'; 
export { wompiWebhookRouter } from './payments/wompiWebhookRouter';
export { syncMatchResults } from './matches/syncMatchResults';