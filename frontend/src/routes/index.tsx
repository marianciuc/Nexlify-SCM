import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import {
    ShoppingCart,
    Store,
    Truck,
    ShieldCheck,
    ArrowRight,
    Server,
    Zap,
    GitBranch,
    Building2,
    Lock,
    Globe,
    ExternalLink,
} from 'lucide-react';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import useAuthStore from '@/service/auth/auth-store';

export const Route = createFileRoute('/')({
    component: EnterprisePortalGateway,
});

export function EnterprisePortalGateway() {
    const navigate = useNavigate();
    const { isAuthenticated, userData } = useAuthStore();

    useEffect(() => {
        document.title = 'Nexlify-SCM — Zintegrowana Platforma Łańcucha Dostaw B2B';
    }, []);

    const WORKSPACE_CARDS = [
        {
            id: 'buyer',
            title: 'Dział Zakupów (Buyer)',
            roleTag: 'PROCUREMENT',
            badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            buttonColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
            borderColor: 'hover:border-emerald-500/40',
            icon: ShoppingCart,
            url: '/buyer',
            description:
                'Zarządzanie katalogiem B2B, wieloetapowa Saga zamówień (13 statusów FSM), składanie zapotrzebowań RFQ oraz rozliczenia Faktur VAT (MPP).',
            features: [
                'Transactional Outbox Saga',
                'Krajowy System e-Faktur (KSeF)',
                'Giełda przetargowa RFQ',
                'Płatności odroczone Net-30',
            ],
        },
        {
            id: 'supplier',
            title: 'Magazyn i Dostawca (WMS)',
            roleTag: 'SUPPLIER_WMS',
            badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white',
            borderColor: 'hover:border-amber-500/40',
            icon: Store,
            url: '/supplier/dashboard',
            description:
                'Wielomagazynowy stan zapasów (Warszawa, Szczecin, Katowice), rozproszone blokady Redisson, analityka ABC/XYZ i obsługa ofert w przetargach.',
            features: [
                'Redisson Distributed Locking',
                'Kolejka kompletacji (Pick & Pack)',
                'Przesunięcia międzymagazynowe (WZ/PZ)',
                'Tablica ofert przetargowych',
            ],
        },
        {
            id: 'logistics',
            title: 'Dyspozycja Transportu (TMS)',
            roleTag: 'DISPATCHER',
            badgeColor: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
            buttonColor: 'bg-sky-600 hover:bg-sky-700 text-white',
            borderColor: 'hover:border-sky-500/40',
            icon: Truck,
            url: '/logistics/map',
            description:
                'Optymalizacja tras VRP z silnikiem GraphHopper 9.x na mapach OpenStreetMap, telematyka pojazdów, generowanie e-CMR i raporty CO₂.',
            features: [
                'GraphHopper 9.x Road Matrix',
                'VRP Optymalizacja ładowności',
                'Cyfrowy list przewozowy e-CMR',
                'Raportowanie emisji GHG / ESG',
            ],
        },
        {
            id: 'admin',
            title: 'Zarządzanie i Audyt (Admin)',
            roleTag: 'GOVERNANCE',
            badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
            buttonColor: 'bg-rose-600 hover:bg-rose-700 text-white',
            borderColor: 'hover:border-rose-500/40',
            icon: ShieldCheck,
            url: '/admin/analytics',
            description:
                'Weryfikacja podmiotów GUS/VIES (NIP), monitorowanie kolejek Kafka Dead Letter Topic (DLT), wskaźniki OTIF i zarządzanie tożsamością Keycloak.',
            features: [
                'Weryfikacja VIES & Biała Lista VAT',
                'Kafka DLT Audyt i reprocess',
                'Wskaźniki OTIF i Lead Time',
                'Zarządzanie najemcami (Tenants)',
            ],
        },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30">
            {/* Top Navigation */}
            <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-xs">
                        N
                    </div>
                    <div>
                        <div className="font-bold tracking-tight text-sm flex items-center gap-2 text-white">
                            Nexlify-SCM
                            <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-1.5 border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-mono"
                            >
                                ENTERPRISE B2B
                            </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Wydział Informatyki ZUT • Praca Dyplomowa
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/auth/login"
                        className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors flex items-center gap-1.5"
                    >
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        Logowanie SSO (Keycloak)
                    </Link>
                </div>
            </header>

            {/* Main Hero & Workspace Hub */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 flex flex-col justify-center">
                <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        9 Mikrousług Java 21 • Apache Kafka KRaft • Redisson • GraphHopper 9.x
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                        Zintegrowana Platforma Łańcucha Dostaw B2B
                    </h1>
                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                        Wybierz profil roboczy, aby wejść do dedykowanego obszaru operacyjnego platformy
                        lub przetestować przepływ zdarzeniowy (EDA Saga) pomiędzy węzłami logistycznymi.
                    </p>
                </div>

                {/* Grid of Workspaces */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {WORKSPACE_CARDS.map((ws) => {
                        const Icon = ws.icon;
                        return (
                            <Card
                                key={ws.id}
                                className={`bg-slate-900/90 border-slate-800/80 ${ws.borderColor} transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-black/40 group`}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2.5 rounded-xl bg-slate-800 text-slate-100 group-hover:scale-105 transition-transform">
                                            <Icon className="w-5 h-5 text-slate-200" />
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] font-mono border ${ws.badgeColor}`}
                                        >
                                            {ws.roleTag}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                                        {ws.title}
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-400 line-clamp-3 leading-relaxed mt-1">
                                        {ws.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="space-y-4 pt-0">
                                    <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                                        {ws.features.map((feat, idx) => (
                                            <div
                                                key={idx}
                                                className="text-[11px] text-slate-400 flex items-center gap-1.5"
                                            >
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        asChild
                                        className={`w-full text-xs font-semibold h-9 rounded-lg ${ws.buttonColor} shadow-xs flex items-center justify-center gap-1.5`}
                                    >
                                        <Link to={ws.url}>
                                            Otwórz moduł
                                            <ArrowRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Architecture Highlights Bar */}
                <div className="mt-14 p-5 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-lg font-bold text-white font-mono">13 Stanów</div>
                        <div className="text-xs text-slate-400">Order FSM & Outbox Saga</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white font-mono">VRP 9.x</div>
                        <div className="text-xs text-slate-400">GraphHopper OSM Routing</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white font-mono">PL VAT 23%</div>
                        <div className="text-xs text-slate-400">Faktura VAT & Split Payment</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-white font-mono">Opaque Token</div>
                        <div className="text-xs text-slate-400">Zero-Trust Redis Gateway</div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
                <span>Nexlify-SCM • Opracowanie w języku Java platformy B2B do zarządzania łańcuchem dostaw • WI ZUT</span>
            </footer>
        </div>
    );
}

export default EnterprisePortalGateway;
