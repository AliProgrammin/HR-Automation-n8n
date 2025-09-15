import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file and ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set. See SUPABASE_SETUP.md for instructions.'
  )
}

if (supabaseUrl === 'your_supabase_project_url' || supabaseAnonKey === 'your_supabase_anon_key') {
  throw new Error(
    'Please replace the placeholder values in your .env.local file with your actual Supabase credentials. See SUPABASE_SETUP.md for instructions.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our CV profile data
export interface CVProfile {
  id: string
  skills: string // JSON string array
  experience: string // JSON string array of experience objects
  education: string // JSON string array of education objects
  file_url: string
  created_at?: string
  updated_at?: string
}

// Parsed types for easier frontend usage
export interface ParsedCVProfile {
  id: string
  skills: string[]
  experience: ExperienceItem[]
  education: EducationItem[]
  file_url: string
  created_at?: string
  updated_at?: string
}

export interface ExperienceItem {
  period: string
  company: string
  location: string
  position: string
  details: string[]
}

export interface EducationItem {
  year: string
  degree: string
  institution: string
}