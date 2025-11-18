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
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
} from '@heroui/react';
import { Link } from 'react-router-dom';

interface Props {}

export function ListsPage({}: Props) {
  const lists = useQuery(api.lists.listLists);
  const createList = useMutation(api.lists.createList);
  const deleteList = useMutation(api.lists.deleteList);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateList = async () => {
    if (!name.trim()) {
      alert('List name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await createList({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create list');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list? All memberships will be removed.')) {
      return;
    }

    try {
      await deleteList({ listId: listId as any });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete list');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Lists
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your email lists and newsletters
          </p>
        </div>
        <Button color="primary" onPress={onOpen}>
          + Create List
        </Button>
      </div>

      {lists.length === 0 ? (
        <Card className="border border-slate-200 dark:border-slate-700">
          <CardBody>
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No lists yet. Create your first list to organize contacts!
              </p>
              <Button color="primary" onPress={onOpen}>
                Create List
              </Button>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <Card key={list._id} className="border border-slate-200 dark:border-slate-700">
              <CardHeader className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {list.name}
                  </h3>
                  {list.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {list.description}
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <Chip color="primary" variant="flat">
                    {list.memberCount} {list.memberCount === 1 ? 'member' : 'members'}
                  </Chip>
                </div>
                <div className="flex gap-2">
                  <Button
                    as={Link}
                    to={`/lists/${list._id}`}
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="flex-1"
                  >
                    Manage
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => handleDelete(list._id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>Create New List</ModalHeader>
          <ModalBody>
            <Input
              label="List Name"
              placeholder="Newsletter Subscribers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              isRequired
            />
            <Textarea
              label="Description (Optional)"
              placeholder="A list for our monthly newsletter subscribers"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleCreateList}
              isLoading={isSubmitting}
            >
              Create List
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

