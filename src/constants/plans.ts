export const TABLA_PLANS = ['MASTER','GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
export const QR_PLANS    = ['GOLZAIR','PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
export const BROADCAST_PLANS = ['PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
export const DASHBOARD_PLANS = ['PARTNER','BUSINESS','GOLD','GOLZI PREMIUM'];
export const BRANDING_PLANS  = ['BUSINESS','GOLD','GOLZI PREMIUM'];

export const MAX_MEMBERS_BY_PLAN: Record<string, number> = {
  free:0, liga:5, pro:10, master:25, golzair:100,
  partner:500, business:1000, gold:2500, 'golzi premium':5000,
};
