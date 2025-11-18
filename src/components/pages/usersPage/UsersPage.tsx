'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardBody,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react';

interface Props {}

export function UsersPage({}: Props) {
  const contacts = useQuery((api as any).contacts.listContacts);
  const createContact = useMutation((api as any).contacts.createContact);
  const deleteContact = useMutation((api as any).contacts.deleteContact);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateContact = async () => {
    if (!email.trim()) {
      alert('Email is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createContact({
        email: email.trim(),
        name: name.trim() || undefined,
      });
      setEmail('');
      setName('');
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) {
      return;
    }

    try {
      await deleteContact({ contactId: contactId as any });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete contact');
    }
  };

  if (contacts === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your email contacts
          </p>
        </div>
        <Button color="primary" onPress={onOpen}>
          + Add Contact
        </Button>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700">
        <CardBody>
          {contacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No contacts yet. Add your first contact to get started!
              </p>
              <Button color="primary" onPress={onOpen}>
                Add Contact
              </Button>
            </div>
          ) : (
            <Table aria-label="Contacts table">
              <TableHeader>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {contacts.map((contact: any) => (
                  <TableRow key={contact._id}>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.name || '-'}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contact.unsubscribed
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}
                      >
                        {contact.unsubscribed ? 'Unsubscribed' : 'Subscribed'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => handleDelete(contact._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Add New Contact</ModalHeader>
          <ModalBody>
            <Input
              label="Email"
              placeholder="contact@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
            />
            <Input
              label="Name (Optional)"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateContact}
              isLoading={isSubmitting}
            >
              Add Contact
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

