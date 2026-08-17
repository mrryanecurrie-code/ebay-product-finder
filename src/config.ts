import {z} from "zod";
const optional=z.string().min(1).optional();
export const configSchema=z.object({PORT:z.coerce.number().default(3000),DATABASE_URL:optional,KEEPA_API_KEY:optional,KEEPA_DOMAIN:z.string().default("CA"),EBAY_CLIENT_ID:optional,EBAY_CLIENT_SECRET:optional,EBAY_MARKETPLACE:z.string().default("EBAY_US"),TARGET_CURRENCY:z.string().default("USD"),DEFAULT_EBAY_FEE_RATE:z.coerce.number().default(.15),DEFAULT_PROMOTED_RATE:z.coerce.number().default(0),DEFAULT_RETURNS_RESERVE:z.coerce.number().default(.03),MAX_CAPITAL_PER_SKU:z.coerce.number().default(250)});
export const config=configSchema.parse(process.env);
export function integrationStatus(){return {database:Boolean(config.DATABASE_URL),keepa:Boolean(config.KEEPA_API_KEY),ebay:Boolean(config.EBAY_CLIENT_ID&&config.EBAY_CLIENT_SECRET),marketplace:config.EBAY_MARKETPLACE,targetCurrency:config.TARGET_CURRENCY,keepaDomain:config.KEEPA_DOMAIN};}
