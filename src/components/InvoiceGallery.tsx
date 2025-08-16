import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Calendar, Eye, Download, Filter, Folder, Receipt } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Separator } from "@/components/ui/separator";

const categoryColors = {
  "Grand Frais": "secondary",
  "Metro": "outline", 
  "Pharmacie": "secondary",
  "Monoprix": "destructive",
  "Carrefour": "secondary",
  "Autres": "outline"
} as const;

export const InvoiceGallery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [realInvoices, setRealInvoices] = useState<any[]>([]);
  const { user } = useAuth();

  // Load user's invoices and listen for real-time updates
  useEffect(() => {
    if (!user) return;
    
    // Initial load
    loadInvoices();

    // Set up real-time subscription
    const channel = supabase
      .channel('invoice-gallery-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Data base',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update in gallery:', payload);
          loadInvoices(); // Reload data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('Data base')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRealInvoices(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  // Get unique categories and dates from real invoices
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(realInvoices.map(invoice => invoice.categorie).filter(Boolean)));
    return uniqueCategories;
  }, [realInvoices]);

  const dates = useMemo(() => {
    const uniqueDates = Array.from(new Set(realInvoices.map(invoice => {
      return new Date(invoice.created_at).toLocaleDateString('fr-FR');
    })));
    return uniqueDates.sort().reverse(); // Most recent first
  }, [realInvoices]);

  // Filter invoices based on search term, category, and date
  const filteredInvoices = useMemo(() => {
    return realInvoices.filter(invoice => {
      const searchableText = [
        invoice.article_description,
        invoice.fournisseur,
        invoice.categorie
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = searchableText.includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || invoice.categorie === selectedCategory;
      const invoiceDate = new Date(invoice.created_at).toLocaleDateString('fr-FR');
      const matchesDate = selectedDate === "all" || invoiceDate === selectedDate;
      
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [searchTerm, selectedCategory, selectedDate, realInvoices]);

  // Group filtered invoices by date
  const groupedInvoices = useMemo(() => {
    const groups = filteredInvoices.reduce((acc, invoice) => {
      const date = new Date(invoice.created_at).toLocaleDateString('fr-FR');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(invoice);
      return acc;
    }, {} as Record<string, any[]>);

    // Sort groups by date (most recent first)
    const sortedGroups = Object.keys(groups)
      .sort((a, b) => new Date(b.split('/').reverse().join('-')).getTime() - new Date(a.split('/').reverse().join('-')).getTime())
      .reduce((acc, date) => {
        acc[date] = groups[date];
        return acc;
      }, {} as Record<string, any[]>);

    return sortedGroups;
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
    return categoryColors[category as keyof typeof categoryColors] || "outline";
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
            Parcourez et organisez toutes vos factures téléchargées et traitées automatiquement
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
                    {date}
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
              <h3 className="text-lg font-semibold">{date}</h3>
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
                          {invoice.image_url ? (
                            <img 
                              src={invoice.image_url} 
                              alt={invoice.article_description || 'Facture'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-success/10 flex items-center justify-center">
                              <Receipt className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Invoice Info */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">
                              {invoice.article_description || invoice.fournisseur || 'Facture sans description'}
                            </h4>
                            <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline"
                              className={`category-badge-${getCategoryBadgeVariant(invoice.categorie || 'Autres')} text-xs`}
                            >
                              {invoice.categorie || 'Autre'}
                            </Badge>
                            <span className="font-bold text-primary">
                              €{invoice.total_ttc?.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground truncate">
                            {invoice.fournisseur || 'Fournisseur non spécifié'}
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
                        {invoice.article_description || 'Facture'}
                      </DialogTitle>
                      <DialogDescription>
                        Détails de la facture du {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Invoice Image */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Aperçu de la facture</h3>
                        <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                          {invoice.image_url ? (
                            <img 
                              src={invoice.image_url} 
                              alt={invoice.article_description || 'Facture'}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-success/10 flex items-center justify-center">
                              <Receipt className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        {invoice.image_url && (
                          <Button className="w-full" variant="outline" asChild>
                            <a href={invoice.image_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger l'original
                            </a>
                          </Button>
                        )}
                      </div>

                      {/* Extracted Data */}
                      <div className="space-y-4">
                        <h3 className="font-semibold">Données extraites</h3>
                        
                        {/* Basic Info */}
                        <Card>
                          <CardContent className="pt-4 space-y-3">
                            {invoice.fournisseur && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Fournisseur:</span>
                                <span className="font-medium">{invoice.fournisseur}</span>
                              </div>
                            )}
                            {invoice.categorie && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Catégorie:</span>
                                <Badge variant={getCategoryBadgeVariant(invoice.categorie)}>
                                  {invoice.categorie}
                                </Badge>
                              </div>
                            )}
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Date de traitement:</span>
                              <span className="font-medium">
                                {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            {invoice.date && (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Date facture:</span>
                                <span className="font-medium">
                                  {new Date(invoice.date).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Financial Summary */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Résumé financier</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {invoice.total_ht && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Total HT:</span>
                                <span>€{invoice.total_ht.toFixed(2)}</span>
                              </div>
                            )}
                            {invoice.tva && (
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">TVA:</span>
                                <span>€{invoice.tva.toFixed(2)}</span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-medium text-lg">
                              <span>Total TTC:</span>
                              <span className="text-primary">€{invoice.total_ttc?.toFixed(2) || '0.00'}</span>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Article Details */}
                        {invoice.article_description && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Détails de l'article</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Description:</span>
                                <span className="text-right max-w-48 text-sm">{invoice.article_description}</span>
                              </div>
                              {invoice.article_quantite && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Quantité:</span>
                                  <span>{invoice.article_quantite}</span>
                                </div>
                              )}
                              {invoice.article_prix_unitaire && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Prix unitaire:</span>
                                  <span>€{invoice.article_prix_unitaire}</span>
                                </div>
                              )}
                              {invoice.article_total && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-muted-foreground">Total article:</span>
                                  <span>€{invoice.article_total}</span>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )}

                        {/* Payment Method */}
                        {invoice.mode_paiement && (
                          <Card>
                            <CardContent className="pt-4">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Mode de paiement:</span>
                                <span className="font-medium">{invoice.mode_paiement}</span>
                              </div>
                            </CardContent>
                          </Card>
                        )}
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
              <h3 className="text-lg font-semibold mb-2">
                {realInvoices.length === 0 ? "Aucune facture trouvée" : "Aucun résultat"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {realInvoices.length === 0 
                  ? "Uploadez vos premières factures dans l'onglet Upload pour commencer."
                  : "Essayez d'ajuster vos filtres pour voir plus de résultats."
                }
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