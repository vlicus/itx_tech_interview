'use client'

import { Button, Tooltip } from '@heroui/react'
import { useUIStore } from '@/lib/store'
import { useEffect } from 'react'
import { Icon } from '@iconify/react'

export function ZoomControls() {
    const zoomLevel = useUIStore((state) => state.zoomLevel)
    const zoomIn = useUIStore((state) => state.zoomIn)
    const zoomOut = useUIStore((state) => state.zoomOut)
    const resetZoom = useUIStore((state) => state.resetZoom)

    useEffect(() => {
        function handleKeyboard(e: KeyboardEvent) {
            if ((e.ctrlKey || e.metaKey) && e.key === '=') {
                e.preventDefault()
                zoomIn()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '-') {
                e.preventDefault()
                zoomOut()
            }
            if ((e.ctrlKey || e.metaKey) && e.key === '0') {
                e.preventDefault()
                resetZoom()
            }
        }

        window.addEventListener('keydown', handleKeyboard)
        return () => window.removeEventListener('keydown', handleKeyboard)
    }, [zoomIn, zoomOut, resetZoom])

    const zoomPercentage = Math.round(zoomLevel * 100)

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-white">
                <Tooltip className="bg-white rounded-full" content="Zoom out">
                    <Button
                        isIconOnly
                        onPress={zoomOut}
                        isDisabled={zoomLevel <= 0.5}
                        aria-label="Zoom out"
                        size="md"
                        variant="flat"
                        className="rounded-none border-r border-neutral-200 hover:bg-neutral-100 transition-colors duration-200 flex items-center"
                    >
                        <Icon icon="akar-icons:zoom-out" className="w-4 h-4 " />
                    </Button>
                </Tooltip>

                <Tooltip
                    className=" bg-white rounded-full"
                    content="Reset zoom"
                >
                    <Button
                        onPress={resetZoom}
                        className="min-w-[60px] rounded-none border-r border-neutral-200 hover:bg-neutral-100 transition-colors duration-200 font-medium text-neutral-700 "
                        aria-label="Reset zoom"
                        size="md"
                        variant="flat"
                    >
                        {zoomPercentage}%
                    </Button>
                </Tooltip>

                <Tooltip className="bg-white rounded-full" content="Zoom in">
                    <Button
                        isIconOnly
                        onPress={zoomIn}
                        isDisabled={zoomLevel >= 2.0}
                        aria-label="Zoom in"
                        size="md"
                        variant="flat"
                        className="rounded-none hover:bg-neutral-100 transition-colors duration-200 flex items-center"
                    >
                        <Icon icon="akar-icons:zoom-in" className="w-4 h-4" />
                    </Button>
                </Tooltip>
            </div>
        </div>
    )
}
