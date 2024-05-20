"use client";
import React from 'react';
import { Button } from '../ui/button';

const isDesktopDevice = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
        userAgent.includes('windows') ||
        userAgent.includes('macintosh') ||
        userAgent.includes('linux')
    );
};

const handleBookmark = () => {
    if (isDesktopDevice()) {
        if (window.external && 'AddFavorite' in window.external) {
            // For IE
            window.external.AddFavorite(window.location.href, document.title);
        } else {
            // For other browsers
            alert('To bookmark this page, press Ctrl+D (Windows) or Command+D (Mac).');
        }
    } else {
        alert(
            "To save this website to your home screen, tap the 'Share' button and select 'Add to Home Screen'."
        );
    }
};

const BookmarkButton = () => {
    return (
        <button
            onClick={handleBookmark}
            className="bg-primary py-2 px-[14px] rounded-md text-white"
        >
            Start
        </button>
    );
};

export default BookmarkButton;
