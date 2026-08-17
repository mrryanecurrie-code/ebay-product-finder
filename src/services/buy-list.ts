import { analyzeOpportunity, OpportunityInput } from "../domain/opportunity.js";
import { HistoryAnalysis } from "../domain/history.js";
export type BuyDecision={decision:"BUY"|"WATCH"|"REJECT";score:number;recommendedQty:number;reasons:string[]};
export function decideBuy(input:OpportunityInput,history:HistoryAnalysis):BuyDecision{
 const a=analyzeOpportunity(input); let score=a.score; const reasons=[...a.reasons];
 if(history.continuity==="CONTINUOUS"){score+=15;reasons.push(`Sales occurred in ${history.activeMonths}/12 recent months`)}
 if(history.continuity==="ONE_OFF"){score-=35;reasons.push("Sales are concentrated in only one recent month")}
 if(history.continuity==="INTERMITTENT"){score-=10;reasons.push(`Demand is intermittent; longest dry spell ${history.longestDrySpellMonths} months`)}
 if(a.grossProfit<=0){score=0;reasons.push("No estimated unit profit")}
 score=Math.max(0,Math.min(100,score));
 const decision:BuyDecision["decision"]=score>=60&&a.grossProfit>0?"BUY":score>=40&&a.grossProfit>0?"WATCH":"REJECT";
 return {decision,score,recommendedQty:decision==="BUY"?a.recommendedInitialQty:0,reasons};
}
