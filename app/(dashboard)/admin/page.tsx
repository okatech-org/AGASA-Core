"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/components/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, ShieldAlert, MonitorPlay } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = ['#1B4F72', '#2E86C1', '#27AE60', '#F39C12', '#E74C3C', '#8E44AD', '#34495E', '#16A085'];

export default function AdminDashboard() {
    const { user } = useAuth();
    const stats = useQuery(api.admin.stats.getDashboardStats, user?._id ? { userId: user._id } : "skip");

    if (!stats) {
        return <div className="flex items-center justify-center p-12 text-muted-foreground">Chargement des statistiques système...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-agasa-primary">Administration Système</h1>
                <p className="text-muted-foreground">
                    Aperçu global de l'état de la plateforme AGASA-Admin.
                </p>
            </div>

            {/* KPI Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.kpi.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Sur {stats.kpi.totalUsers} comptes au total
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessions Actives</CardTitle>
                        <MonitorPlay className="h-4 w-4 text-agasa-secondary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-agasa-secondary">{stats.kpi.activeSessions}</div>
                        <p className="text-xs text-muted-foreground">
                            Utilisateurs actuellement en ligne
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Actions (24h)</CardTitle>
                        <Activity className="h-4 w-4 text-agasa-accent" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-agasa-accent">{stats.kpi.recentActions}</div>
                        <p className="text-xs text-muted-foreground">
                            Opérations journalisées récemment
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Alertes / Verrouillages</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-agasa-danger" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-agasa-danger">{stats.kpi.systemAlerts}</div>
                        <p className="text-xs text-muted-foreground">
                            Comptes bloqués nécessitant attention
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Répartition par Province</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <BarChart data={stats.charts.provincesDistribution}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                    <Bar dataKey="value" fill="#27AE60" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Comptes par Rôle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.charts.rolesDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {stats.charts.rolesDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Logs Section */}
            <div className="grid gap-4 grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>5 Dernières Actions (Journal d'Audit)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats.recentLogs.map((log) => (
                                <div key={log._id} className="flex items-center gap-4 rounded-lg border p-3 bg-muted/20">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {log.action.replace(/_/g, " ")} — <span className="text-xs text-muted-foreground">{log.module}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {log.details.length > 80 ? log.details.substring(0, 80) + "..." : log.details}
                                        </p>
                                    </div>
                                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString("fr-GA")}
                                    </div>
                                </div>
                            ))}
                            {stats.recentLogs.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Aucune action récente.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
