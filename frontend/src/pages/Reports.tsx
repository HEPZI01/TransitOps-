// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export default function Reports() {
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportApi.getDashboard,
  });

  const { data: fleetUtilization, isLoading: fleetLoading } = useQuery({
    queryKey: ['fleet-utilization'],
    queryFn: reportApi.getFleetUtilization,
  });

  const { data: costAnalysis, isLoading: costLoading } = useQuery({
    queryKey: ['cost-analysis'],
    queryFn: reportApi.getCostAnalysis,
  });

  const { data: driverPerformance, isLoading: driverLoading } = useQuery({
    queryKey: ['driver-performance'],
    queryFn: reportApi.getDriverPerformance,
  });

  if (dashboardLoading || fleetLoading || costLoading || driverLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const vehicleStatusData = dashboard
    ? Object.entries(dashboard.vehicles.byStatus).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
      }))
    : [];

  const tripStatusData = dashboard
    ? Object.entries(dashboard.trips.byStatus).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
      }))
    : [];

  const expenseCategoryData = dashboard
    ? dashboard.expenses.byCategory.map((item) => ({
        name: item.category,
        value: item.total,
      }))
    : [];

  const monthlyExpensesData = costAnalysis
    ? Object.entries(costAnalysis.monthly).map(([month, value]) => ({
        name: month,
        value,
      }))
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>

      {/* Fleet Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Fleet Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="bg-[#16161A] p-6 rounded-2xl border border-white/5 shadow-inner">
       <p className="text-gray-500 text-sm italic text-center">Detailed metrics have been moved to the interactive dashboard. Use the Download PDF feature to export raw data.</p>
    </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${costAnalysis?.summary.totalExpenses.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Fuel Cost</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${costAnalysis?.summary.totalFuel.toLocaleString() || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  ${costAnalysis?.summary.totalMaintenance.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expenseCategoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthlyExpensesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Driver Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Driver Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="bg-[#16161A] p-6 rounded-2xl border border-white/5 shadow-inner">
       <p className="text-gray-500 text-sm italic text-center">Detailed metrics have been moved to the interactive dashboard. Use the Download PDF feature to export raw data.</p>
    </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Status & Trip Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vehicleStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trip Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tripStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tripStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
