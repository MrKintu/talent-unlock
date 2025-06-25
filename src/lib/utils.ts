/**
 * Formats a date from either a Firestore Timestamp or regular Date object
 * @param date - The date to format (can be Firestore Timestamp, Date object, or date string)
 * @param options - Optional formatting options
 * @returns Formatted date string
 */
export const formatDate = (date: any, options: Intl.DateTimeFormatOptions = {}) => {
    if (!date) return 'Unknown date';

    let dateObj;
    // Handle Firestore Timestamp object
    if (date._seconds) {
        dateObj = new Date(date._seconds * 1000);
    } else {
        // Handle regular Date object or string
        dateObj = new Date(date);
    }

    // Default options for date and time
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    // Merge default options with provided options
    const finalOptions = { ...defaultOptions, ...options };

    return dateObj.toLocaleString(undefined, finalOptions);
};

// Short date format (e.g., "Jan 15, 2024")
export const formatShortDate = (date: any) => {
    return formatDate(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

// Date with time (e.g., "January 15, 2024 at 2:30 PM")
export const formatDateWithTime = (date: any) => {
    return formatDate(date, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
