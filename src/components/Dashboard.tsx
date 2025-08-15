import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Upload, FileText, Receipt, TrendingUp, Euro, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "./UploadZone";
import { InvoiceGallery } from "./InvoiceGallery";
import { ExportSection } from "./ExportSection";

// Mock data for charts
const dailyExpenses = [
  { day: "Lun", amount: 145.50 },
  { day: "Mar", amount: 89.30 },
  { day: "Mer", amount: 234.80 },
  { day: "Jeu", amount: 67.20 },
  { day: "Ven", amount: 198.40 },
  { day: "Sam", amount: 156.90 },
  { day: "Dim", amount: 78.60 },
];

const expensesByCategory = [
  { name: "Grand Frais", value: 456.80, color: "#3B82F6" },
  { name: "Metro", value: 234.50, color: "#10B981" },
  { name: "Carrefour", value: 189.20, color: "#F59E0B" },
  { name: "Pharmacie", value: 67.40, color: "#EF4444" },
  { name: "Autres", value: 123.10, color: "#8B5CF6" },
];

const weeklyTrend = [
  { week: "S1", amount: 1250.30 },
  { week: "S2", amount: 1456.80 },
  { week: "S3", amount: 1123.40 },
  { week: "S4", amount: 1678.90 },
];

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const totalToday = dailyExpenses.reduce((sum, item) => sum + item.amount, 0);
  const totalMonth = 4890.65;
  const avgDaily = totalMonth / 30;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-dark to-primary bg-clip-text text-transparent">
            Gestionnaire de Factures
          </h1>
          <p className="text-muted-foreground text-lg">
            Analysez et organisez vos dépenses facilement
          </p>
        </div>

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
                  <div className="text-2xl font-bold text-primary">{totalToday.toFixed(2)}€</div>
                  <p className="text-xs text-muted-foreground">
                    +12% par rapport à hier
                  </p>
                </CardContent>
              </Card>

              <Card className="stats-card stats-card-success">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total du Mois</CardTitle>
                  <Calendar className="h-4 w-4 text-success" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{totalMonth.toFixed(2)}€</div>
                  <p className="text-xs text-muted-foreground">
                    156 factures ce mois
                  </p>
                </CardContent>
              </Card>

              <Card className="stats-card stats-card-warning">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Moyenne Quotidienne</CardTitle>
                  <Receipt className="h-4 w-4 text-warning" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{avgDaily.toFixed(2)}€</div>
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
                    Évolution des dépenses cette semaine
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dailyExpenses}>
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
                  <CardTitle>Répartition par Magasin</CardTitle>
                  <CardDescription>
                    Distribution des dépenses par enseigne
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={(entry) => `${entry.name}: ${entry.value}€`}
                      >
                        {expensesByCategory.map((entry, index) => (
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
                <CardTitle>Tendance Mensuelle</CardTitle>
                <CardDescription>
                  Évolution des dépenses par semaine
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weeklyTrend}>
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
  );
};