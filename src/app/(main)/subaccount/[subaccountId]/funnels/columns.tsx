'use client'
import { Badge } from '@/components/ui/badge'
import { FunnelsForSubAccount } from '@/lib/types'
import { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import DeleteFunnelButton from './delete-funnel-button'
 // Adjust the import path as necessary

 //this ColumnDef will get all the funnels details 
 //Each row in the table represents a funnel, and the data for each row includes the funnelId.
export const columns: ColumnDef<FunnelsForSubAccount>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      return (
        <Link
          className="flex gap-2 items-center"
          href={`/subaccount/${row.original.subAccountId}/funnels/${row.original.id}`}
        >
          {row.getValue('name')}
          <ExternalLink size={15} />
        </Link>
      )
    },
  },
  {
    accessorKey: 'updatedAt',
    header: 'Last Updated',
    cell: ({ row }) => {
      const date = ` ${row.original.updatedAt.toDateString()} ${row.original.updatedAt.toLocaleTimeString()} `
      return <span className="text-muted-foreground">{date}</span>
    },
  },
  {
    accessorKey: 'published',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.published
      return status ? (
        <Badge variant={'default'}>Live - {row.original.subDomainName}</Badge>
      ) : (
        <Badge variant={'secondary'}>Draft</Badge>
      )
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      console.log("Funnels Data", row.original);
      const funnelId = row.original.id; //In the "Action" column, access the data for the current row using row.original.
      const subaccountId = row.original.subAccountId; // Extract the subAccountId from the current row's data.  
      return <DeleteFunnelButton
        funnelId={funnelId}
        subaccountId={subaccountId} // Pass the subaccountId to DeleteFunnelButton  
      />; //extract the funnelId from the current row's data.
      //funnelId to DeleteFunnelButton: Pass the extracted funnelId to the DeleteFunnelButton component as a prop.
    },
  },
];