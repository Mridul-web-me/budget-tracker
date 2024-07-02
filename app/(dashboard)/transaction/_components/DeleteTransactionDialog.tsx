'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { DeleteCategory } from '../../_actions/categories';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DeleteTransaction } from '../_actions/deleteTransaction';

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  transactionId: string;
}
const DeleteTransactionDialog = ({ open, setOpen, transactionId }: Props) => {
  const queryClient = useQueryClient();
  const deleteMutations = useMutation({
    mutationFn: DeleteTransaction,
    onSuccess: async () => {
      toast.success('Transaction deleted successfully', {
        id: transactionId
      });

      await queryClient.invalidateQueries({
        queryKey: ['transactions']
      });
    },
    onError: () => {
      toast.error('Something went wrong!', {
        id: transactionId
      });
    }
  });
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure delete your transaction?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone. This will permanently delete your category.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              toast.loading('Deleting transaction...', {
                id: transactionId
              });
              deleteMutations.mutate(transactionId);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteTransactionDialog;
