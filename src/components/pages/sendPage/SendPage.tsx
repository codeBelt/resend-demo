'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
} from '@heroui/react';

interface Props {}

export function SendPage({}: Props) {
  const lists = useQuery(api.lists.listLists);
  const createCampaign = useMutation(api.campaigns.createCampaign);
  const sendCampaign = useMutation(api.campaigns.sendCampaign);

  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [recipientEmails, setRecipientEmails] = useState('');
  const [sendMode, setSendMode] = useState<'list' | 'emails'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  const handleCreateCampaign = async () => {
    if (!campaignName.trim() || !subject.trim() || !body.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (sendMode === 'list' && !selectedListId) {
      alert('Please select a list');
      return;
    }

    if (sendMode === 'emails' && !recipientEmails.trim()) {
      alert('Please enter recipient emails');
      return;
    }

    setIsSubmitting(true);
    try {
      const id = await createCampaign({
        name: campaignName.trim(),
        subject: subject.trim(),
        body: body.trim(),
        listId: sendMode === 'list' ? (selectedListId as any) : undefined,
        recipientEmails:
          sendMode === 'emails'
            ? recipientEmails
                .split(',')
                .map((e) => e.trim())
                .filter((e) => e)
            : undefined,
      });
      setCampaignId(id);
      alert('Campaign created! Click "Send Campaign" to send emails.');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignId) {
      alert('Please create a campaign first');
      return;
    }

    if (!confirm('Are you sure you want to send this campaign? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await sendCampaign({ campaignId: campaignId as any });
      alert(`Campaign sent! ${result.sentCount} emails sent, ${result.failedCount} failed.`);
      // Reset form
      setCampaignName('');
      setSubject('');
      setBody('');
      setSelectedListId('');
      setRecipientEmails('');
      setCampaignId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (lists === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Send Email Campaign
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create and send batch emails to your lists or specific recipients
        </p>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardHeader>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Campaign Details
          </h2>
        </CardHeader>
        <CardBody className="space-y-6">
          <Input
            label="Campaign Name"
            placeholder="Monthly Newsletter"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            isRequired
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Send To
            </label>
            <div className="flex gap-4 mb-4">
              <Button
                size="sm"
                color={sendMode === 'list' ? 'primary' : 'default'}
                variant={sendMode === 'list' ? 'solid' : 'flat'}
                onPress={() => setSendMode('list')}
              >
                Send to List
              </Button>
              <Button
                size="sm"
                color={sendMode === 'emails' ? 'primary' : 'default'}
                variant={sendMode === 'emails' ? 'solid' : 'flat'}
                onPress={() => setSendMode('emails')}
              >
                Send to Specific Emails
              </Button>
            </div>

            {sendMode === 'list' ? (
              <Select
                label="Select List"
                placeholder="Choose a list"
                selectedKeys={selectedListId ? [selectedListId] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedListId(selected || '');
                }}
              >
                {lists.map((list) => (
                  <SelectItem key={list._id} value={list._id}>
                    {list.name} ({list.memberCount} members)
                  </SelectItem>
                ))}
              </Select>
            ) : (
              <Textarea
                label="Recipient Emails"
                placeholder="email1@example.com, email2@example.com"
                value={recipientEmails}
                onChange={(e) => setRecipientEmails(e.target.value)}
                description="Separate multiple emails with commas"
                isRequired
              />
            )}
          </div>

          <Input
            label="Subject"
            placeholder="Your email subject line"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            isRequired
          />

          <Textarea
            label="Email Body"
            placeholder="Write your email message here..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            minRows={8}
            isRequired
          />

          <div className="flex gap-4">
            <Button
              color="primary"
              onPress={handleCreateCampaign}
              isLoading={isSubmitting}
              isDisabled={!campaignName || !subject || !body}
            >
              Create Campaign
            </Button>
            {campaignId && (
              <Button
                color="primary"
                variant="solid"
                onPress={handleSendCampaign}
                isLoading={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Send Campaign
              </Button>
            )}
          </div>

          {campaignId && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✓ Campaign created successfully! Click "Send Campaign" to send emails to recipients.
              </p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

