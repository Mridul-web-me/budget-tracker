'use client';

import { GetTransactionHistoryResponseType } from '@/app/api/transaction-history/route';
import { DataTableColumnHeader } from '@/components/DataTable/ColumnHeader';
import { DataTableViewOptions } from '@/components/DataTable/ColumnToggle';
import { DataTableFacetedFilter } from '@/components/DataTable/FacetedFilter';
import SkeletonWrapper from '@/components/SkeletonWrapper/SkeletonWrapper';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateToUTCDate } from '@/lib/helper';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, ColumnFiltersState, SortingState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { download, generateCsv, mkConfig } from 'export-to-csv';
import { DownloadIcon, MoreHorizontal, TrashIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import DeleteTransactionDialog from './DeleteTransactionDialog';

interface Props {
  from: Date;
  to: Date;
}
const emptyData: any[] = [];
type GetTransactionHistoryRow = GetTransactionHistoryResponseType[0];
const columns: ColumnDef<GetTransactionHistoryRow>[] = [
  {
    accessorKey: 'category',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Category" />,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    cell: ({ row }) => (
      <div className="flex gap-2 capitalize">
        {row.original.categoryIcon}
        <div className="capitalize">{row.original.category}</div>
      </div>
    )
  },
  {
    accessorKey: 'description',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
    cell: ({ row }) => <div className="capitalize">{row.original.description}</div>
  },
  {
    accessorKey: 'day',
    header: 'Date',
    cell: ({ row }) => {
      const date = new Date(row.original.date);
      const formattedDate = date.toLocaleDateString('default', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      return <div className="capitalize">{formattedDate}</div>;
    }
  },
  {
    accessorKey: 'type',
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
    cell: ({ row }) => <div className={cn('capitalize rounded-lg text-center p-2', row.original.type === 'income' && 'bg-emerald-400/10 text-emerald-500', row.original.type === 'expense' && 'bg-red-400/10 text-red-500')}>{row.original.type}</div>
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => <p className="text-md rounded-lg bg-gray-400/10 p-2 text-center font-medium">{row.original.formattedAmount}</p>
  },
  {
    id: 'action',
    enableHiding: false,
    cell: ({ row }) => <RowAction transaction={row.original} />
  }
];

const TransactionTable = ({ from, to }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const history = useQuery<GetTransactionHistoryResponseType>({
    queryKey: ['Transaction', 'history', from, to],
    queryFn: () => fetch(`/api/transaction-history?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then(res => res.json())
  });

  const handleExportCSV = (data: any[]) => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const table = useReactTable({
    data: history.data || emptyData,
    columns,
    getCoreRowModel: getCoreRowModel(),

    state: {
      sorting,
      columnFilters
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const categoriesOptions = useMemo(() => {
    const categoriesMap = new Map();
    history.data?.forEach(transaction => {
      categoriesMap.set(transaction.category, {
        value: transaction.category,
        label: `${transaction.categoryIcon} ${transaction.category}`
      });
    });

    const uniqueCategories = new Set(categoriesMap.values());
    return Array.from(uniqueCategories);
  }, [history.data]);

  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true
  });

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-end gap-2 py-4 justify-between">
        <div className="flex gap-2">
          {table.getColumn('category') && <DataTableFacetedFilter title="Category" column={table.getColumn('category')} options={categoriesOptions} />}
          <div className="flex gap-2">
            {table.getColumn('type') && (
              <DataTableFacetedFilter
                title="Type"
                column={table.getColumn('type')}
                options={[
                  { label: 'Income', value: 'income' },
                  { label: 'Expense', value: 'expense' }
                ]}
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={'outline'}
            size={'sm'}
            className="ml-auto h-8 lg:flex"
            onClick={() => {
              const data = table.getFilteredRowModel().rows.map(row => ({
                category: row.original.category,
                categoryIcon: row.original.categoryIcon,
                description: row.original.description,
                type: row.original.type,
                amount: row.original.amount,
                formattedAmount: row.original.formattedAmount,
                date: row.original.date
              }));
              handleExportCSV(data);
            }}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <SkeletonWrapper isLoading={history.isFetching}>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => {
                    return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant={'outline'} size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            Previous
          </Button>
          <Button variant={'outline'} size="sm" onClick={() => table.getCanNextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </SkeletonWrapper>
    </div>
  );
};

export default TransactionTable;

function RowAction({ transaction }: { transaction: GetTransactionHistoryRow }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <DeleteTransactionDialog open={showDeleteDialog} setOpen={setShowDeleteDialog} transactionId={transaction.id} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'ghost'} className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Action</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex items-center gap-2"
            onSelect={() => {
              setShowDeleteDialog(prev => !prev);
            }}
          >
            <TrashIcon className="h-4 w-4 text-muted-foreground" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
