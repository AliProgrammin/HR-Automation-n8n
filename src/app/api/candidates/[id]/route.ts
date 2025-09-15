import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { data: candidate, error } = await supabase
      .from('cv_profiles')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching CV profile:', error)
      return NextResponse.json(
        { error: 'CV profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ candidate })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { name, email, position, experience, skills, location, status } = body

    const { data: candidate, error } = await supabase
      .from('cv_profiles')
      .update({
        name,
        email,
        position,
        experience,
        skills,
        location,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating CV profile:', error)
      return NextResponse.json(
        { error: 'Failed to update CV profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ candidate })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // First, get the profile to retrieve the file_url
    const { data: profile, error: fetchError } = await supabase
      .from('cv_profiles')
      .select('file_url')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      console.error('Error fetching CV profile for deletion:', fetchError)
      return NextResponse.json(
        { error: 'CV profile not found' },
        { status: 404 }
      )
    }

    // Extract filename from file_url to delete from storage
    let fileName = null
    if (profile.file_url) {
      try {
        const url = new URL(profile.file_url)
        const pathParts = url.pathname.split('/')
        fileName = pathParts[pathParts.length - 1] // Get the last part (filename)
      } catch (urlError) {
        console.error('Error parsing file URL:', urlError)
      }
    }

    // Delete the file from Supabase storage if filename exists
    if (fileName) {
      const { error: storageError } = await supabase.storage
        .from('CVs')
        .remove([fileName])

      if (storageError) {
        console.error('Error deleting file from storage:', storageError)
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete the profile from the database
    const { error: deleteError } = await supabase
      .from('cv_profiles')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting CV profile from database:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete CV profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'CV profile and file deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}