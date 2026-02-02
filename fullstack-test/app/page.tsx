"use client";

import { Map } from "@/components/ui/map";
import { FilterPanel } from "@/components/filters/FilterPanel";

export default function Home() {
    return (
        <div className="flex min-h-screen">
            <aside className="w-80 border-r bg-background p-4 overflow-y-auto">
                <FilterPanel />
            </aside>
            <main className="flex-1 relative">
                <div className="h-screen w-full">
                    <Map center={[2.35, 48.85]} zoom={12}></Map>
                </div>
            </main>
        </div>
    );
}
