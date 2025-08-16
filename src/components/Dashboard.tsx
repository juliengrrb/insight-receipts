import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Upload, FileText, Receipt, TrendingUp, Euro, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "./layout/Header";
import { UploadZone } from "./UploadZone";
import { InvoiceGallery } from "./InvoiceGallery";
import { ExportSection } from "./ExportSection";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [totalToday, setTotalToday] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [averageDaily, setAverageDaily] = useState(0);
  const { user } = useAuth();

  // Load user's invoices and listen for real-time updates
  useEffect(() => {
    if (!user) return;

    // Initial load
    loadInvoices();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Data base',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time update:', payload);
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

      setInvoicesData(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const calculateStats = (invoices: any[]) => {
    const today = new Date().toDateString();
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();

    const todayTotal = invoices
      .filter(inv => new Date(inv.created_at).toDateString() === today)
      .reduce((sum, inv) => sum + (inv.total_ttc || 0), 0);

    const monthTotal = invoices
      .filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate.getMonth() === thisMonth && invDate.getFullYear() === thisYear;
      })
      .reduce((sum, inv) => sum + (inv.total_ttc || 0), 0);

    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();
    const avgDaily = monthTotal / daysInMonth;

    setTotalToday(todayTotal);
    setTotalMonth(monthTotal);
    setAverageDaily(avgDaily);
  };

  // Process invoices data for charts
  const processChartData = () => {
    if (!invoicesData.length) {
      return {
        dailyExpenses: [],
        expensesByCategory: [],
        weeklyTrend: []
      };
    }

    // Group by date for daily expenses
    const dailyData = invoicesData.reduce((acc: any, inv) => {
      const date = new Date(inv.created_at).toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
      acc[date] = (acc[date] || 0) + (inv.total_ttc || 0);
      return acc;
    }, {});

    const dailyExpenses = Object.entries(dailyData).map(([date, amount]) => ({
      day: date,
      amount
    }));

    // Group by category
    const categoryData = invoicesData.reduce((acc: any, inv) => {
      const category = inv.categorie || 'Autre';
      acc[category] = (acc[category] || 0) + (inv.total_ttc || 0);
      return acc;
    }, {});

    const expensesByCategory = Object.entries(categoryData).map(([name, value], index) => ({
      name,
      value,
      color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
    }));

    // Simple weekly trend based on creation dates
    const weeklyTrend = dailyExpenses.slice(0, 7).map((item, index) => ({
      week: `S${index + 1}`,
      amount: item.amount
    }));

    return { dailyExpenses, expensesByCategory, weeklyTrend };
  };

  const chartData = processChartData();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6 fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="stats-card stats-card-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dépenses Aujourd'hui</CardTitle>
                  <Euro className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">€{totalToday.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Basé sur vos factures uploadées
                  </p>
                </CardContent>
              </Card>

              <Card className="stats-card stats-card-success">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total du Mois</CardTitle>
                  <Calendar className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">€{totalMonth.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    {invoicesData.length} factures ce mois
                  </p>
                </CardContent>
              </Card>

              <Card className="stats-card stats-card-warning">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Moyenne Quotidienne</CardTitle>
                  <Receipt className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">€{averageDaily.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">
                    Basé sur 30 jours
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Expenses Bar Chart */}
              <Card className="chart-container fade-in-delay">
                <CardHeader>
                  <CardTitle>Dépenses par Jour</CardTitle>
                  <CardDescription>
                    Évolution des dépenses basée sur vos factures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.dailyExpenses}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px"
                        }}
                      />
                      <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Pie Chart */}
              <Card className="chart-container fade-in-delay">
                <CardHeader>
                  <CardTitle>Répartition par Catégorie</CardTitle>
                  <CardDescription>
                    Distribution des dépenses par catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={chartData.expensesByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: €${entry.value.toFixed(2)}`}
                      >
                        {chartData.expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Trend */}
            <Card className="chart-container fade-in-delay">
              <CardHeader>
                <CardTitle>Tendance des Dépenses</CardTitle>
                <CardDescription>
                  Évolution basée sur vos données réelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData.weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--success))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="fade-in">
            <UploadZone />
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery" className="fade-in">
            <InvoiceGallery />
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="fade-in">
            <ExportSection />
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
};