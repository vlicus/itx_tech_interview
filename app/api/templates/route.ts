/**
 * GET /api/templates
 *
 * Retorna todas las plantillas disponibles desde datos locales.
 */

import { ITemplate } from '@/types'
import { NextResponse } from 'next/server'
import templatesData from '@/data/templates.json'

export async function GET() {
    try {
        // Cargar templates desde el archivo JSON
        const templates = templatesData.templates as ITemplate[]

        return NextResponse.json(templates, { status: 200 })
    } catch (error) {
        console.error('Error loading templates:', error)
        return NextResponse.json(
            { error: 'Failed to load templates' },
            { status: 500 }
        )
    }
}
