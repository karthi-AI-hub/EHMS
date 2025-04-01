import { format, parseISO, isValid } from 'date-fns';

export const safeFormatDate = (dateString, formatStr = 'MMM dd, yyyy') => {
  if (!dateString) return 'N/A';
  
  try {
    // Handle ISO strings, timestamps, and date objects
    const date = new Date(dateString);
    if (!isValid(date)) return 'Invalid Date';
    
    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
};