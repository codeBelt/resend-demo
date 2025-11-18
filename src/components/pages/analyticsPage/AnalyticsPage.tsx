'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardBody,
  CardHeader,
} from '@heroui/react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface Props {}

export function AnalyticsPage({}: Props) {
  const stats = useQuery((api as any).campaigns.getDashboardStats);
  const emails = useQuery(api.emails.listMyEmailsAndStatuses);

  if (stats === undefined || emails === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Prepare data for charts
  const statusData = [
    { name: 'Queued', value: stats.queued, color: '#eab308' },
    { name: 'Sent', value: stats.sent, color: '#3b82f6' },
    { name: 'Delivered', value: stats.delivered, color: '#22c55e' },
    { name: 'Bounced', value: stats.bounced, color: '#ef4444' },
    { name: 'Failed', value: stats.failed, color: '#dc2626' },
    { name: 'Opened', value: stats.opened, color: '#a855f7' },
    { name: 'Complained', value: stats.complained, color: '#f97316' },
  ].filter((item) => item.value > 0);

  // Group emails by date for time series
  const emailsByDate = emails.reduce((acc, email) => {
    const date = new Date(email.sentAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, sent: 0, delivered: 0, failed: 0 };
    }
    const status = email.resendStatus || email.status;
    if (status === 'sent' || status === 'delivered') {
      acc[date].sent++;
    }
    if (status === 'delivered') {
      acc[date].delivered++;
    }
    if (status === 'failed' || status === 'bounced') {
      acc[date].failed++;
    }
    return acc;
  }, {} as Record<string, { date: string; sent: number; delivered: number; failed: number }>);

  const timeSeriesData = Object.values(emailsByDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7); // Last 7 days

  const deliveryRate = stats.totalEmails > 0
    ? ((stats.delivered / stats.totalEmails) * 100).toFixed(1)
    : '0';
  const openRate = stats.delivered > 0
    ? ((stats.opened / stats.delivered) * 100).toFixed(1)
    : '0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Email performance metrics and statistics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardBody className="p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Delivery Rate
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {deliveryRate}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.delivered} of {stats.totalEmails} emails
            </p>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardBody className="p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Open Rate
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {openRate}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.opened} of {stats.delivered} delivered emails
            </p>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardBody className="p-6">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Total Emails Sent
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalEmails}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Across all campaigns
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Email Status Distribution
            </h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Email Status Breakdown
            </h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      </div>

      {/* Time Series Chart */}
      {timeSeriesData.length > 0 && (
        <Card className="border border-slate-200 dark:border-slate-700 mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Email Activity Over Time (Last 7 Days)
            </h2>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke="#3b82f6"
                  name="Sent"
                />
                <Line
                  type="monotone"
                  dataKey="delivered"
                  stroke="#22c55e"
                  name="Delivered"
                />
                <Line
                  type="monotone"
                  dataKey="failed"
                  stroke="#ef4444"
                  name="Failed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Detailed Stats Table */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detailed Statistics
          </h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {statusData.map((item) => (
                  <tr key={item.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {item.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stats.totalEmails > 0
                        ? ((item.value / stats.totalEmails) * 100).toFixed(1)
                        : '0'}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

