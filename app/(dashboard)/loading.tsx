import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="h-[calc(100vh-10rem)] w-full flex flex-col items-center justify-center space-y-4">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-medium text-slate-800">Chargement des données...</h3>
                <p className="text-sm text-slate-500 animate-pulse">Synchronisation avec le hub AGASA-Core</p>
            </div>
        </div>
    );
}
