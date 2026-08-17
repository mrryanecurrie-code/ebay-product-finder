import crypto from "node:crypto";

export type CredentialKey = "EBAY_CLIENT_ID"|"EBAY_CLIENT_SECRET"|"KEEPA_API_KEY"|"HISTORICAL_EBAY_API_KEY";
export type CredentialRecord={key:CredentialKey;ciphertext:string;iv:string;tag:string;updatedAt:string};

function encryptionKey(){
 const raw=process.env.APP_ENCRYPTION_KEY;
 if(!raw) throw new Error("APP_ENCRYPTION_KEY is required before credentials can be stored");
 return crypto.createHash("sha256").update(raw).digest();
}
export function encryptSecret(key:CredentialKey,value:string):CredentialRecord{
 const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv("aes-256-gcm",encryptionKey(),iv);
 const ciphertext=Buffer.concat([cipher.update(value,"utf8"),cipher.final()]);const tag=cipher.getAuthTag();
 return {key,ciphertext:ciphertext.toString("base64"),iv:iv.toString("base64"),tag:tag.toString("base64"),updatedAt:new Date().toISOString()};
}
export function decryptSecret(r:CredentialRecord){
 const decipher=crypto.createDecipheriv("aes-256-gcm",encryptionKey(),Buffer.from(r.iv,"base64"));decipher.setAuthTag(Buffer.from(r.tag,"base64"));
 return Buffer.concat([decipher.update(Buffer.from(r.ciphertext,"base64")),decipher.final()]).toString("utf8");
}
export function maskSecret(v:string){return v.length<=6?"••••••":`${v.slice(0,3)}••••${v.slice(-3)}`;}
