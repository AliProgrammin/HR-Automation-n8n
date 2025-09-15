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
    const { error } = await supabase
      .from('cv_profiles')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting CV profile:', error)
      return NextResponse.json(
        { error: 'Failed to delete CV profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'CV profile deleted successfully' })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}