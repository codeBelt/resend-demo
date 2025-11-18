'use client';

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
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

export function ListDetailPage({}: Props) {
  const { listId } = useParams<{ listId: string }>();
  const lists = useQuery((api as any).lists.listLists);
  const listContacts = useQuery(
    (api as any).lists.getListContacts,
    listId ? { listId: listId as any } : 'skip',
  );
  const allContacts = useQuery((api as any).contacts.listContacts);
  const addContactToList = useMutation((api as any).lists.addContactToList);
  const removeContactFromList = useMutation((api as any).lists.removeContactFromList);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentList = lists?.find((list: any) => list._id === listId);

  const handleAddContact = async () => {
    if (!selectedContactId || !listId) {
      alert('Please select a contact');
      return;
    }

    setIsSubmitting(true);
    try {
      await addContactToList({
        listId: listId as any,
        contactId: selectedContactId as any,
      });
      setSelectedContactId('');
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to remove this contact from the list?')) {
      return;
    }

    try {
      await removeContactFromList({
        listId: listId as any,
        contactId: contactId as any,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to remove contact');
    }
  };

  if (!listId || lists === undefined || listContacts === undefined || allContacts === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!currentList) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">List not found</p>
              <Button as={Link} to="/lists" color="primary">
                Back to Lists
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Get contacts not already in the list
  const availableContacts = allContacts.filter(
    (contact: any) => !listContacts.some((lc: any) => lc._id === contact._id),
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button as={Link} to="/lists" variant="light" size="sm">
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {currentList.name}
            </h1>
            {currentList.description && (
              <p className="text-gray-600 dark:text-gray-400">{currentList.description}</p>
            )}
          </div>
        </div>
      </div>

      <Card className="border border-slate-200 dark:border-slate-700 mb-6">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Contacts ({listContacts.length})
          </h2>
          <Button color="primary" onPress={onOpen} isDisabled={availableContacts.length === 0}>
            + Add Contact
          </Button>
        </CardHeader>
        <CardBody>
          {listContacts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No contacts in this list yet.
              </p>
              <Button color="primary" onPress={onOpen} isDisabled={availableContacts.length === 0}>
                Add Contact
              </Button>
            </div>
          ) : (
            <Table aria-label="List contacts table">
              <TableHeader>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>NAME</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody>
                {listContacts.map((contact: any) => (
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
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => handleRemoveContact(contact._id)}
                      >
                        Remove
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
          <ModalHeader>Add Contact to List</ModalHeader>
          <ModalBody>
            {availableContacts.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                All contacts are already in this list. Add more contacts from the Users page.
              </p>
            ) : (
              <div className="space-y-2">
                {availableContacts.map((contact: any) => (
                  <label
                    key={contact._id}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedContactId === contact._id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedContactId === contact._id}
                      onChange={() => setSelectedContactId(contact._id)}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {contact.email}
                      </p>
                      {contact.name && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{contact.name}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleAddContact}
              isLoading={isSubmitting}
              isDisabled={!selectedContactId || availableContacts.length === 0}
            >
              Add Contact
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

