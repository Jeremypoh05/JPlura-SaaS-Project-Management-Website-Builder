import React, { useState, useEffect } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSave: (url: string) => void;
};

const VideoUrlDialog = ({ isOpen, onClose, onSave }: Props) => {
    const [url, setUrl] = useState("");

    useEffect(() => {
        console.log("Dialog isOpen state changed:", isOpen);
        if (!isOpen) {
            setUrl(""); // Reset the URL when the dialog is closed
        }
    }, [isOpen]);

    const handleSave = () => {
        console.log("Saving URL in dialog:", url);
        if (url) {
            onSave(url);
        }
        onClose(); // Close the dialog after saving
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onClose();
            }
        }}>
            <AlertDialogContent>
                <AlertDialogTitle>Enter Video URL</AlertDialogTitle>
                <AlertDialogDescription>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="border p-2 w-full mb-4"
                        placeholder="https://www.youtube.com/embed/..."
                    />
                    <p className="text-red-500 text-sm">Press ESC to close</p>
                </AlertDialogDescription>
                <AlertDialogFooter>
                    <AlertDialogAction asChild>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Save
                        </button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default VideoUrlDialog;