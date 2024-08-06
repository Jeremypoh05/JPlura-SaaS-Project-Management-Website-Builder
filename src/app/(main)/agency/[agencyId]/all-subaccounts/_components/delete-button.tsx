'use client';

import { deleteSubAccount, getSubaccountDetails, saveActivityLogsNotification } from '@/lib/queries';
import { useRouter } from 'next/navigation';
import React from 'react';

type Props = {
    subaccountId: string;
    subaccountName: string; // Pass subaccount name for logging  
};

const DeleteButton = ({ subaccountId, subaccountName }: Props) => {
    const router = useRouter();

    const handleDelete = async () => {
        try {
            console.log(`Delete button clicked for subaccount ID: ${subaccountId}`);
            console.log(`Subaccount name: ${subaccountName}`); // Log the name of the subaccount  

            const response = await getSubaccountDetails(subaccountId);
            console.log(`Fetching details for subaccount:`, response);

            await saveActivityLogsNotification({
                agencyId: undefined,
                description: `Deleted a subaccount | ${response?.name}`,
                subaccountId,
            });

            await deleteSubAccount(subaccountId);
            console.log(`Subaccount with ID ${subaccountId} and name '${subaccountName}' has been deleted.`);

            router.refresh(); // Refresh the router after deletion  
        } catch (error) {
            console.error("Error deleting subaccount:", error);
        }
    };

    return (
        <div
            className="text-white cursor-pointer" // Added cursor pointer for better UX  
            onClick={handleDelete}
        >
            Delete Sub Account
        </div>
    );
};

export default DeleteButton;
