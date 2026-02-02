"use client";

import { Map } from "@/components/ui/map";

export default function Home() {
    return (
        <div className="flex min-h-screen justify-center items-center">
            <main className="flex min-h-screen w-full justify-center items-center">
                <div className="h-screen w-full">
                    <Map center={[2.35, 48.85]} zoom={12}></Map>
                </div>
            </main>
        </div>
    );
}
