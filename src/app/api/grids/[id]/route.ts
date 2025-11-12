/**
 * POST /api/grids
 *
 * Guarda configuración de grid en memoria del servidor.
 * Los datos persisten mientras el servidor esté corriendo.
 */

import { NextRequest, NextResponse } from 'next/server'
import type { ISaveGridRequest, ISaveGridResponse } from '@/types'

/**
 * In-memory storage para grids guardados
 * Persiste durante la vida del proceso del servidor
 */
interface StoredGrid {
    id: string
    timestamp: string
    data: ISaveGridRequest
}

// Storage global en memoria
const gridsStore = new Map<string, StoredGrid>()

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body: ISaveGridRequest = await request.json()

        // Validar que existe el campo rows
        if (!body.rows || !Array.isArray(body.rows)) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid request: missing rows array',
                },
                { status: 400 }
            )
        }

        // Generar ID único para el grid
        const gridId = crypto.randomUUID()
        const timestamp = new Date().toISOString()

        // Guardar en memoria
        const storedGrid: StoredGrid = {
            id: gridId,
            timestamp,
            data: body,
        }

        gridsStore.set(gridId, storedGrid)

        console.log(`✅ [API /grids] Grid guardado: ${gridId}`, {
            rowsCount: body.rows.length,
            timestamp,
        })

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

/**
 * GET /api/grids/:id
 * Recupera un grid guardado por su ID
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const gridId = searchParams.get('id')

        if (!gridId) {
            // Si no hay ID, retornar lista de todos los grids guardados
            const allGrids = Array.from(gridsStore.values())
            return NextResponse.json(
                {
                    grids: allGrids,
                    count: allGrids.length,
                },
                { status: 200 }
            )
        }

        // Buscar grid específico
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
