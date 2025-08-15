import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Calendar, Eye, Download, Filter, Folder, Receipt } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for invoices
const mockInvoices = [
  {
    id: "1",
    name: "Ticket Carrefour",
    date: "2024-01-15",
    category: "Grand Frais",
    amount: 45.67,
    store: "Carrefour Market",
    image: "/api/placeholder/400/500",
    extractedData: {
      total: 45.67,
      items: ["Pain", "Lait", "Fromage"],
      address: "123 Rue de la Paix, Paris"
    }
  },
  {
    id: "2", 
    name: "Facture Metro",
    date: "2024-01-14",
    category: "Metro",
    amount: 156.89,
    store: "Metro Cash & Carry",
    image: "/api/placeholder/400/500",
    extractedData: {
      total: 156.89,
      items: ["Légumes", "Viande", "Poisson"],
      address: "456 Avenue du Commerce, Lyon"
    }
  },
  {
    id: "3",
    name: "Ticket Pharmacie",
    date: "2024-01-13",
    category: "Pharmacie",
    amount: 23.45,
    store: "Pharmacie de la Ville",
    image: "/api/placeholder/400/500",
    extractedData: {
      total: 23.45,
      items: ["Médicaments", "Vitamines"],
      address: "789 Place de la Santé, Marseille"
    }
  },
  // Add more mock data for different days and categories
  {
    id: "4",
    name: "Courses Monoprix",
    date: "2024-01-12",
    category: "Monoprix",
    amount: 89.32,
    store: "Monoprix Centre",
    image: "/api/placeholder/400/500",
    extractedData: {
      total: 89.32,
      items: ["Produits d'entretien", "Cosmétiques"],
      address: "321 Boulevard Central, Nice"
    }
  }
];

const categoryColors = {
  "Grand Frais": "success",
  "Metro": "primary",
  "Pharmacie": "warning",
  "Monoprix": "destructive",
  "Autres": "secondary"
} as const;

export const InvoiceGallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);

  // Get unique categories and dates
  const categories = useMemo(() => {
    const cats = Array.from(new Set(mockInvoices.map(inv => inv.category)));
    return cats.sort();
  }, []);

  const dates = useMemo(() => {
    const dates = Array.from(new Set(mockInvoices.map(inv => inv.date)));
    return dates.sort().reverse();
  }, []);

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return mockInvoices.filter(invoice => {
      const matchesSearch = invoice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.store.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || invoice.category === selectedCategory;
      const matchesDate = selectedDate === "all" || invoice.date === selectedDate;
      
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [searchTerm, selectedCategory, selectedDate]);

  // Group invoices by date
  const groupedInvoices = useMemo(() => {
    const groups: Record<string, typeof mockInvoices> = {};
    filteredInvoices.forEach(invoice => {
      const date = invoice.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(invoice);
    });
    return groups;
  }, [filteredInvoices]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryBadgeVariant = (category: string) => {
    return categoryColors[category as keyof typeof categoryColors] || "secondary";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            Galerie des Factures
          </CardTitle>
          <CardDescription>
            Parcourez et organisez toutes vos factures téléchargées
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                {dates.map(date => (
                  <SelectItem key={date} value={date}>
                    {formatDate(date)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedDate("all");
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredInvoices.length} facture(s) trouvée(s)
        </p>
        <div className="flex gap-2">
          {categories.map(category => (
            <Badge
              key={category}
              variant="outline"
              className={`category-badge category-badge-${getCategoryBadgeVariant(category)}`}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Invoice Gallery */}
      <div className="space-y-8">
        {Object.entries(groupedInvoices).map(([date, invoices]) => (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center gap-3 py-2 border-b border-border">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
              <Badge variant="secondary" className="ml-auto">
                {invoices.length} facture(s)
              </Badge>
            </div>

            {/* Invoices Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {invoices.map((invoice) => (
                <Dialog key={invoice.id}>
                  <DialogTrigger asChild>
                    <Card className="invoice-card cursor-pointer group">
                      <CardContent className="p-4">
                        {/* Invoice Preview */}
                        <div className="aspect-[3/4] bg-muted rounded-lg mb-3 overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-success/10 flex items-center justify-center">
                            <Receipt className="h-12 w-12 text-muted-foreground" />
                          </div>
                        </div>

                        {/* Invoice Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{invoice.name}</h4>
                            <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline"
                              className={`category-badge-${getCategoryBadgeVariant(invoice.category)} text-xs`}
                            >
                              {invoice.category}
                            </Badge>
                            <span className="font-bold text-primary">
                              {invoice.amount.toFixed(2)}€
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground truncate">
                            {invoice.store}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </DialogTrigger>

                  {/* Invoice Detail Modal */}
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        {invoice.name}
                      </DialogTitle>
                      <DialogDescription>
                        Détails de la facture du {formatDate(invoice.date)}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Invoice Image */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Aperçu de la facture</h3>
                        <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-success/10 flex items-center justify-center">
                            <Receipt className="h-16 w-16 text-muted-foreground" />
                          </div>
                        </div>
                        <Button className="w-full" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger l'original
                        </Button>
                      </div>

                      {/* Extracted Data */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Données extraites</h3>
                        
                        <Card>
                          <CardContent className="pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Magasin:</span>
                              <span className="font-medium">{invoice.store}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Montant total:</span>
                              <span className="font-bold text-lg text-primary">
                                {invoice.extractedData.total.toFixed(2)}€
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Date:</span>
                              <span className="font-medium">{formatDate(invoice.date)}</span>
                            </div>
                            <div className="flex justify-between items-start">
                              <span className="text-sm text-muted-foreground">Adresse:</span>
                              <span className="font-medium text-right text-sm">
                                {invoice.extractedData.address}
                              </span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Articles</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {invoice.extractedData.items.map((item, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                                  <span className="text-sm">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Button className="w-full">
                          <Download className="h-4 w-4 mr-2" />
                          Exporter en Excel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucune facture trouvée</h3>
              <p className="text-muted-foreground mb-4">
                Essayez d'ajuster vos filtres ou téléchargez de nouvelles factures.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedDate("all");
              }}>
                Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};