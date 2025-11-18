'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Link } from 'react-router-dom';
import { Button } from '@heroui/react';

interface Props {}

export function DashboardPage({}: Props) {
  const stats = useQuery(api.campaigns.getDashboardStats);
  const recentEmails = useQuery(api.emails.listMyEmailsAndStatuses);

  if (stats === undefined || recentEmails === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Emails',
      value: stats.totalEmails,
      icon: '📧',
      color: 'bg-blue-500',
    },
    {
      title: 'Queued',
      value: stats.queued,
      icon: '⏳',
      color: 'bg-yellow-500',
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: '✅',
      color: 'bg-green-500',
    },
    {
      title: 'Failed',
      value: stats.failed,
      icon: '❌',
      color: 'bg-red-500',
    },
    {
      title: 'Opened',
      value: stats.opened,
      icon: '👀',
      color: 'bg-purple-500',
    },
    {
      title: 'Total Contacts',
      value: stats.totalContacts,
      icon: '👥',
      color: 'bg-indigo-500',
    },
    {
      title: 'Total Lists',
      value: stats.totalLists,
      icon: '📋',
      color: 'bg-pink-500',
    },
    {
      title: 'Campaigns',
      value: stats.totalCampaigns,
      icon: '🚀',
      color: 'bg-orange-500',
    },
  ];

  const getStatusBadge = (email: typeof recentEmails[0]) => {
    const status = email.resendStatus || email.status;
    const colors = {
      queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      bounced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      complained: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Overview of your email campaigns and statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border border-slate-200 dark:border-slate-700">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                  {stat.icon}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h2>
          </CardHeader>
          <CardBody>
            <div className="flex flex-wrap gap-4">
              <Button as={Link} to="/send" color="primary" variant="solid">
                📧 Send Email Campaign
              </Button>
              <Button as={Link} to="/users" color="secondary" variant="flat">
                👥 Add Contact
              </Button>
              <Button as={Link} to="/lists" color="secondary" variant="flat">
                📋 Create List
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Emails */}
      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Emails
          </h2>
        </CardHeader>
        <CardBody>
          {recentEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No emails sent yet. Start by sending your first campaign!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentEmails.slice(0, 10).map((email) => (
                    <tr key={email._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {email.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {email.recipientEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(email)}`}>
                          {email.resendStatus || email.status}
                          {email.opened && ' 👀'}
                          {email.complained && ' ⚠️'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(email.sentAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {email.errorMessage && (
                          <span className="text-red-600 dark:text-red-400" title={email.errorMessage}>
                            ⚠️ Error
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

