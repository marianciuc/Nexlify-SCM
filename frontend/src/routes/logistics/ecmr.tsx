import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  FileCheck,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  PenTool,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/logistics/ecmr')({
  component: LogisticsEcmrPage,
  staticData: {
    crumb: {
      label: 'e-CMR Consignments',
    },
  },
});

interface EcmrDocument {
  id: string;
  cmrNumber: string;
  orderNumber: string;
  carrierName: string;
  consigneeName: string;
  destinationCity: string;
  signatureStatus: 'SIGNED_ON_GLASS' | 'PENDING_UNLOADING';
  signedTimestamp?: string;
  discrepancyNote?: string;
}

const ECMR_DATA: EcmrDocument[] = [
  {
    id: 'cmr-01',
    cmrNumber: 'CMR-PL-2026-9912',
    orderNumber: 'ORD-2026-0891',
    carrierName: 'Nexlify Fleet Express (WI 49102)',
    consigneeName: 'Baltic Retail Group Sp. z o.o.',
    destinationCity: 'Warszawa DC (Gate 4)',
    signatureStatus: 'SIGNED_ON_GLASS',
    signedTimestamp: '2026-09-24 14:15 CEST',
  },
  {
    id: 'cmr-02',
    cmrNumber: 'CMR-PL-2026-9913',
    orderNumber: 'ORD-2026-0893',
    carrierName: 'Nexlify Fleet Express (WI 49102)',
    consigneeName: 'Pomerania Foods Sp. k.',
    destinationCity: 'Gdańsk Port Terminal',
    signatureStatus: 'PENDING_UNLOADING',
  },
];

function LogisticsEcmrPage() {
  const [docs] = useState<EcmrDocument[]>(ECMR_DATA);

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileCheck className="h-6 w-6 text-amber-500" />
            Electronic Consignment Notes (e-CMR)
          </h1>
          <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
            e-CMR Protocol (Geneva Convention)
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Paperless international and domestic waybills with cryptographic sign-on-glass delivery confirmation and instant proof of delivery (POD).
        </p>
      </div>

      {/* e-CMR Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">e-CMR Document #</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Carrier</th>
                <th className="py-3 px-4">Consignee (Recipient)</th>
                <th className="py-3 px-4">Sign-on-Glass Status</th>
                <th className="py-3 px-4 text-right">PDF Waybill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    {doc.cmrNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{doc.orderNumber}</td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">{doc.carrierName}</td>
                  <td className="py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {doc.consigneeName} ({doc.destinationCity})
                  </td>
                  <td className="py-3 px-4">
                    <Badge
                      className={`text-2xs ${
                        doc.signatureStatus === 'SIGNED_ON_GLASS'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {doc.signatureStatus === 'SIGNED_ON_GLASS' ? (
                        <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1 inline" />
                      )}
                      {doc.signatureStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toast.success(`Downloaded verified e-CMR PDF: ${doc.cmrNumber}`)}
                      className="h-7 text-xs gap-1 text-emerald-600 hover:text-emerald-700"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
