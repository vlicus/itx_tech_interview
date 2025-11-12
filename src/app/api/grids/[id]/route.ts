import { NextRequest, NextResponse } from 'next/server'
import type { ISaveGridRequest, ISaveGridResponse } from '@/types'

interface StoredGrid {
    id: string
    timestamp: string
    data: ISaveGridRequest
}

const gridsStore = new Map<string, StoredGrid>()

export async function POST(request: NextRequest) {
    try {
        const body: ISaveGridRequest = await request.json()

        if (!body.rows || !Array.isArray(body.rows)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid request: missing rows array',
                },
                { status: 400 }
            )
        }

        const gridId = crypto.randomUUID()
        const timestamp = new Date().toISOString()

        const storedGrid: StoredGrid = {
            id: gridId,
            timestamp,
            data: body,
        }

        gridsStore.set(gridId, storedGrid)

        const response: ISaveGridResponse = {
            success: true,
            gridId,
            message: 'Grid saved successfully in server memory',
        }

        return NextResponse.json(response, { status: 201 })
    } catch (error) {
        console.error(' [API /grids] Error saving grid:', error)
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : 'Failed to save grid',
            },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const gridId = searchParams.get('id')

        if (!gridId) {
            const allGrids = Array.from(gridsStore.values())
            return NextResponse.json(
                {
                    grids: allGrids,
                    count: allGrids.length,
                },
                { status: 200 }
            )
        }

        const grid = gridsStore.get(gridId)

        if (!grid) {
            return NextResponse.json(
                { error: 'Grid not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(grid, { status: 200 })
    } catch (error) {
        console.error('❌ [API /grids] Error retrieving grid:', error)
        return NextResponse.json(
            { error: 'Failed to retrieve grid' },
            { status: 500 }
        )
    }
}
