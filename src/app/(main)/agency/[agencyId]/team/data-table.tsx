"use client";  

// The page for data table from ShadCN UI  
// https://ui.shadcn.com/docs/components/data-table  

import React from "react";  
import {  
  Table,  
  TableBody,  
  TableCell,  
  TableHead,  
  TableHeader,  
  TableRow,  
} from "@/components/ui/table";  

import {  
  ColumnDef,  
  flexRender,  
  getCoreRowModel,  
  getFilteredRowModel,  
  getSortedRowModel,  
  useReactTable,  
} from "@tanstack/react-table";  
import { useModal } from "@/providers/modal-provider";  
import { Search } from "lucide-react";  
import { Input } from "@/components/ui/input";  
import { Button } from "@/components/ui/button";  
import CustomModal from "@/components/global/custom-modal";  
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react"; // Import chevron icons  

interface DataTableProps<TData, TValue> {  
  columns: ColumnDef<TData, TValue>[];  
  data: TData[];  
  filterValue: string;  
  actionButtonText?: React.ReactNode;  
  modalChildren?: React.ReactNode;  
}  

export default function DataTable<TData, TValue>({  
  columns,  
  data,  
  filterValue,  
  actionButtonText,  
  modalChildren,  
}: DataTableProps<TData, TValue>) {  
  const { setOpen } = useModal(); // Hook to manage modal state  
  const table = useReactTable({  
    data,  
    columns,  
    getCoreRowModel: getCoreRowModel(),  
    getFilteredRowModel: getFilteredRowModel(),  
    getSortedRowModel: getSortedRowModel(), // Add sorting model  
  });  

  // Define sortable columns  
  const sortableColumns = ["Name", "Email", "Owned Accounts", "Role"];  

  return (  
    <>  
      <div className="flex items-center justify-between">  
        <div className="flex items-center py-4 gap-2">  
          <Search />  
          <Input  
            placeholder="Search Name..."  
            value={  
              // Sets the initial value of the input field. It retrieves the current filter value from the table object using the getColumn method and the filterValue prop passed to the DataTable component.  
              // If the filter value is not found, it returns an empty string.  
              (table.getColumn(filterValue)?.getFilterValue() as string) ?? ""  
            }  
            // Sets a callback function that is called whenever the input field's value changes. It retrieves the current filter value from the table object using the getColumn method and the filterValue prop passed to the DataTable component.  
            // It then updates the filter value using the setFilterValue method.  
            onChange={(event) => {  
              table.getColumn(filterValue)?.setFilterValue(event.target.value);  
            }}  
            className="h-12"  
          />  
        </div>  
        <Button  
          className="flex gap-2"  
          onClick={() => {  
            if (modalChildren) {  
              setOpen(  
                <CustomModal  
                  title="Add a team member"  
                  subHeading="Send an invitation"  
                >  
                  {modalChildren}  
                </CustomModal>  
              );  
            }  
          }}  
        >  
          {actionButtonText}  
        </Button>  
      </div>  
      <div className="border bg-background rounded-lg">  
        <Table>  
          <TableHeader>  
            {table.getHeaderGroups().map((headerGroup) => (  
              <TableRow key={headerGroup.id}>  
                {headerGroup.headers.map((header) => {  
                  const isSortable = sortableColumns.includes(  
                    String(header.column.columnDef.header)  
                  ); // Check if the current header is sortable  
                  return (  
                    <TableHead  
                      key={header.id}  
                      onClick={isSortable ? header.column.getToggleSortingHandler() : undefined} // Toggle sorting if the column is sortable  
                    >  
                      {header.isPlaceholder ? null : (  
                        <div className={`flex items-center gap-2 ${isSortable ? "cursor-pointer" : ""}`}>  
                          {flexRender(  
                            header.column.columnDef.header,  
                            header.getContext()  
                          )}  
                          {isSortable && (  
                            // Render chevron icons based on sorting state  
                            header.column.getIsSorted() === "asc" ? (  
                              <ChevronUp className="h-5 w-5 text-blue-500" />  
                            ) : header.column.getIsSorted() === "desc" ? (  
                              <ChevronDown className="h-5 w-5 text-blue-500" />  
                            ) : (  
                              <ChevronsUpDown className="h-5 w-5 text-gray-500" />  
                            )  
                          )}  
                        </div>  
                      )}  
                    </TableHead>  
                  );  
                })}  
              </TableRow>  
            ))}  
          </TableHeader>  
          <TableBody>  
            {table.getRowModel().rows.length ? (  
              table.getRowModel().rows.map((row) => (  
                <TableRow  
                  key={row.id}  
                  data-state={row.getIsSelected() && "selected"}  
                >  
                  {row.getVisibleCells().map((cell) => (  
                    <TableCell key={cell.id}>  
                      {flexRender(  
                        cell.column.columnDef.cell,  
                        cell.getContext()  
                      )}  
                    </TableCell>  
                  ))}  
                </TableRow>  
              ))  
            ) : (  
              <TableRow>  
                <TableCell  
                  colSpan={columns.length}  
                  className="h-24 text-center"  
                >  
                  No Results.  
                </TableCell>  
              </TableRow>  
            )}  
          </TableBody>  
        </Table>  
      </div>  
    </>  
  );  
}