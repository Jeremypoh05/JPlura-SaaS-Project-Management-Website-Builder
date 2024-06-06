"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"; // Adjust the import path as needed

const isDesktopDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("windows") ||
    userAgent.includes("macintosh") ||
    userAgent.includes("linux")
  );
};

const BookmarkButton = () => {
  const [open, setOpen] = useState(false);

  const handleBookmark = () => {
    if (isDesktopDevice()) {
      if (window.external && "AddFavorite" in window.external) {
        // For IE
        window.external.AddFavorite(window.location.href, document.title);
      } else {
        // For other browsers
        setOpen(true);
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleBookmark}
        className="bg-primary py-2 px-[14px] rounded-md text-white"
      >
        Start
      </button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bookmark This Page</AlertDialogTitle>
            <AlertDialogDescription>
              {isDesktopDevice()
                ? "To bookmark this page, press Ctrl+D (Windows) or Command+D (Mac)."
                : "To save this website to your home screen, tap the 'Share' button and select 'Add to Home Screen'."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookmarkButton;
