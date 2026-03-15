import type { Metadata } from 'next'
import './globals.css'

import { Header } from '@/components/header'
import { NavigationTabs } from '@/components/navigation-tabs'
import { getSyncedSkills } from '@/lib/skills-fs'

export const metadata: Metadata = {
    title: 'Skills Insights',
    description: 'Skills leaderboard and analytics',
    icons: {
        icon: '/favicon.svg',
    },
}

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 relative overflow-x-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none -z-10" />
                <div className="fixed -top-[300px] -left-[300px] w-[600px] h-[600px] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none -z-10" />
                <div className="fixed -top-[300px] -right-[300px] w-[600px] h-[600px] bg-indigo-900/20 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16 relative z-10 w-full">
                    <Header />
                    <NavigationTabs syncedSkillsCount={getSyncedSkills().length} />
                    {children}
                </div>
            </body>
        </html>
    )
}
