/**
 * GET /api/templates
 *
 * Retorna todas las plantillas disponibles desde datos locales.
 */

import { ITemplate, IGetTemplatesResponse } from '@/types'
import { NextResponse } from 'next/server'
import templatesData from '@/data/templates.json'

export async function GET() {
    try {
        // Cargar templates desde el archivo JSON
        const templates = templatesData.templates as ITemplate[]

        const response: IGetTemplatesResponse = { templates }

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
            },
        })
    } catch (error) {
        console.error('Error loading templates:', error)
        return NextResponse.json(
            { error: 'Failed to load templates' },
            { status: 500 }
        )
    }
}
