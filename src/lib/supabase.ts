import dotenv from "dotenv";
dotenv.config();

const _supabaseUrl: string | undefined = process.env.SUPABASE_URL 
const _supabaseAnonKey: string | undefined = process.env.SUPABASE_ANON_KEY

if(!_supabaseUrl || !_supabaseAnonKey){
    throw new Error("Supabase enviroment variables has not been added")
}

const supabaseUrl = _supabaseUrl as string;
const supabaseAnonKey = _supabaseAnonKey as string;

export {
    supabaseUrl,
    supabaseAnonKey
}