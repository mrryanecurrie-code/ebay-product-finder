export type JobStatus="QUEUED"|"RUNNING"|"WAITING_FOR_DATA"|"COMPLETE"|"FAILED";
export type ResearchJob<T=unknown>={id:string;mode:string;status:JobStatus;createdAt:string;updatedAt:string;input:T;processed:number;total:number;error?:string};
const jobs=new Map<string,ResearchJob>();
export function createResearchJob<T>(mode:string,input:T,total=0){const now=new Date().toISOString();const job:ResearchJob<T>={id:crypto.randomUUID(),mode,status:"QUEUED",createdAt:now,updatedAt:now,input,processed:0,total};jobs.set(job.id,job);return job;}
export function updateResearchJob(id:string,patch:Partial<ResearchJob>){const current=jobs.get(id);if(!current)throw new Error("Research job not found");const next={...current,...patch,updatedAt:new Date().toISOString()};jobs.set(id,next);return next;}
export function getResearchJob(id:string){return jobs.get(id);}
export function listResearchJobs(){return [...jobs.values()].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
