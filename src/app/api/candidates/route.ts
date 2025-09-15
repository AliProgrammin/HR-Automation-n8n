import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase
      .from('cv_profiles')
      .select('*')

    if (search) {
      query = query.or(`skills.ilike.%${search}%,experience.ilike.%${search}%,education.ilike.%${search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch CV profiles' }, { status: 500 })
    }

    // Parse JSON strings to arrays for frontend consumption
    const parsedData = data?.map(profile => {
      try {
        return {
          ...profile,
          skills: typeof profile.skills === 'string' ? JSON.parse(profile.skills) : (profile.skills || []),
          experience: typeof profile.experience === 'string' ? JSON.parse(profile.experience) : (profile.experience || []),
          education: typeof profile.education === 'string' ? JSON.parse(profile.education) : (profile.education || []),
        }
      } catch (parseError) {
        console.error('Error parsing profile data:', parseError, 'Profile ID:', profile.id)
        return {
          ...profile,
          skills: [],
          experience: [],
          education: [],
        }
      }
    }) || []

    return NextResponse.json(parsedData)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { skills, experience, education, file_url } = body
    if (!skills || !experience || !education || !file_url) {
      return NextResponse.json(
        { error: 'Skills, experience, education, and file_url are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('cv_profiles')
      .insert([body])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to create CV profile' }, { status: 500 })
    }

    // Parse JSON strings to arrays for consistent response format
    const parsedProfile = data[0] ? (() => {
      try {
        return {
          ...data[0],
          skills: typeof data[0].skills === 'string' ? JSON.parse(data[0].skills) : (data[0].skills || []),
          experience: typeof data[0].experience === 'string' ? JSON.parse(data[0].experience) : (data[0].experience || []),
          education: typeof data[0].education === 'string' ? JSON.parse(data[0].education) : (data[0].education || []),
        }
      } catch (parseError) {
        console.error('Error parsing new profile data:', parseError, 'Profile ID:', data[0].id)
        return {
          ...data[0],
          skills: [],
          experience: [],
          education: [],
        }
      }
    })() : null

    return NextResponse.json(parsedProfile, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}