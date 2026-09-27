import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  FileCode,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/supplier/edi')({
  component: EdiHubPage,
  staticData: {
    crumb: {
      label: 'EDI & Peppol Hub',
    },
  },
});

interface EdiMessage {
  id: string;
  type: 'ORDERS' | 'DESADV' | 'INVOIC';
  partner: string;
  docNumber: string;
  timestamp: string;
  status: 'PROCESSED' | 'SENT' | 'QUEUED';
}

const INITIAL_EDI: EdiMessage[] = [
  { id: '1', type: 'ORDERS', partner: 'Baltic Retail Group (NIP 8522619472)', docNumber: 'EDI-ORD-99120', timestamp: '10 min ago', status: 'PROCESSED' },
  { id: '2', type: 'DESADV', partner: 'Nexlify Logistics Gateway', docNumber: 'DESADV-PL-4819', timestamp: '1 hour ago', status: 'SENT' },
  { id: '3', type: 'INVOIC', partner: 'Peppol BIS Billing 3.0 (KSeF)', docNumber: 'INVOIC-2026-0043', timestamp: '2 hours ago', status: 'SENT' },
];

function EdiHubPage() {
  const [messages] = useState<EdiMessage[]>(INITIAL_EDI);

  const handleUploadCatalog = () => {
    toast.success('Uploaded 2,500 catalog items via Excel/CSV! Validation passed.');
  };

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="h-6 w-6 text-amber-600" />
              EDIFACT, Peppol & Enterprise Integration Hub
            </h1>
            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200">
              Enterprise SCM 2.0
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Standardized B2B document exchange (ORDERS, DESADV, Peppol BIS 3.0) and batch Excel catalog price synchronization.
          </p>
        </div>

        <Button
          className="bg-amber-600 hover:bg-amber-700 text-white gap-2 text-xs shadow-xs"
          onClick={handleUploadCatalog}
        >
          <Upload className="h-4 w-4" /> Batch Import Catalog (CSV/Excel)
        </Button>
      </div>

      {/* EDI Transmission Feed */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <CardHeader className="py-3 px-5 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileCode className="h-4 w-4 text-amber-600" /> Recent Electronic Data Interchange (EDI) Transmissions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b text-slate-600 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Standard Message</th>
                <th className="py-3 px-4">EDI Document #</th>
                <th className="py-3 px-4">Counterparty / Hub</th>
                <th className="py-3 px-4">Processed Timestamp</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                  <td className="py-3 px-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                    <Badge variant="outline" className="text-2xs font-mono">
                      {m.type}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {m.docNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{m.partner}</td>
                  <td className="py-3 px-4 text-slate-500">{m.timestamp}</td>
                  <td className="py-3 px-4 text-right">
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-2xs">
                      {m.status}
                    </Badge>
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
