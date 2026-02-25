import { DemoBanner } from "@/components/shared/DemoBanner";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <DemoBanner />
            <div className="flex min-h-screen w-full flex-col bg-[#F8F9FA]">
                <Header />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                        <div className="mx-auto max-w-7xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}
