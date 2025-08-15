import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, FileSpreadsheet, Archive, Clock, CheckCircle } from "lucide-react";

// Mock data for export statistics
const exportData = {
  today: {
    count: 7,
    totalAmount: 245.67,
    invoices: ["Carrefour", "Metro", "Pharmacie"]
  },
  thisWeek: {
    count: 23,
    totalAmount: 1456.89,
    invoices: ["Grand Frais", "Metro", "Carrefour", "Monoprix"]
  },
  thisMonth: {
    count: 86,
    totalAmount: 4890.32,
    invoices: ["Grand Frais", "Metro", "Carrefour", "Monoprix", "Pharmacie"]
  }
};

type ExportPeriod = 'today' | 'thisWeek' | 'thisMonth';
type ExportFormat = 'excel' | 'pdf' | 'zip';

export const ExportSection = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<ExportPeriod>('today');
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('excel');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const currentData = exportData[selectedPeriod];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Export réussi",
        description: `${currentData.count} factures exportées au format ${selectedFormat.toUpperCase()}`,
      });

      // In a real app, this would trigger the actual download
      const filename = `factures_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.${selectedFormat}`;
      console.log(`Téléchargement simulé: ${filename}`);
      
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getPeriodLabel = (period: ExportPeriod) => {
    switch (period) {
      case 'today':
        return "Aujourd'hui";
      case 'thisWeek':
        return "Cette semaine";
      case 'thisMonth':
        return "Ce mois";
      default:
        return period;
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
        return <Download className="h-4 w-4" />;
      case 'zip':
        return <Archive className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export des Factures
          </CardTitle>
          <CardDescription>
            Téléchargez vos factures par période pour transmission à votre comptable
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Export Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration de l'export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Period Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Période d'export</label>
            <Select value={selectedPeriod} onValueChange={(value: ExportPeriod) => setSelectedPeriod(value)}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="thisWeek">Cette semaine</SelectItem>
                <SelectItem value="thisMonth">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Format d'export</label>
            <Select value={selectedFormat} onValueChange={(value: ExportFormat) => setSelectedFormat(value)}>
              <SelectTrigger>
                {getFormatIcon(selectedFormat)}
                <SelectValue className="ml-2" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                <SelectItem value="zip">Archive ZIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          <Card className="bg-gradient-to-r from-primary/5 to-success/5 border-primary/20">
            <CardContent className="pt-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                Aperçu de l'export - {getPeriodLabel(selectedPeriod)}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{currentData.count}</div>
                  <div className="text-sm text-muted-foreground">Factures</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">{currentData.totalAmount.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">Montant total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">{currentData.invoices.length}</div>
                  <div className="text-sm text-muted-foreground">Magasins</div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Magasins inclus:</p>
                <div className="flex flex-wrap gap-2">
                  {currentData.invoices.map((store, index) => (
                    <Badge key={index} variant="outline" className="category-badge-primary">
                      {store}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full md:w-auto"
            size="lg"
          >
            {isExporting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                {getFormatIcon(selectedFormat)}
                <span className="ml-2">
                  Exporter {currentData.count} factures
                </span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des exports</CardTitle>
          <CardDescription>
            Vos derniers téléchargements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "2024-01-15", period: "Aujourd'hui", format: "Excel", count: 7 },
              { date: "2024-01-14", period: "Hier", format: "PDF", count: 5 },
              { date: "2024-01-08", period: "Semaine dernière", format: "ZIP", count: 28 },
            ].map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  {getFormatIcon(export_.format.toLowerCase() as ExportFormat)}
                  <div>
                    <p className="font-medium text-sm">{export_.period}</p>
                    <p className="text-xs text-muted-foreground">{export_.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{export_.count} factures</p>
                  <p className="text-xs text-muted-foreground">{export_.format}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-warning/5 border-warning/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-4">
            <div className="p-2 rounded-full bg-warning/10">
              <FileSpreadsheet className="h-5 w-5 text-warning" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">Formats d'export disponibles</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Excel (.xlsx):</strong> Données tabulaires avec calculs automatiques</p>
                <p><strong>PDF (.pdf):</strong> Rapport complet avec graphiques</p>
                <p><strong>ZIP (.zip):</strong> Images originales des factures</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};