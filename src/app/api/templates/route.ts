import { ITemplate, IGetTemplatesResponse } from '@/types'
import { NextResponse } from 'next/server'
import templatesData from '@/data/templates.json'

export async function GET() {
    try {
        const templates = templatesData.templates as ITemplate[]

        const response: IGetTemplatesResponse = { templates }

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control':
                    'public, s-maxage=3600, stale-while-revalidate',
            },
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to load templates' },
            { status: 500 }
        )
    }
}
