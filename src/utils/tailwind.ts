import { create } from 'twrnc';

// Create the tailwind instance
export const tw = create();

// Export a helper to create dynamic styles
export const twStyle = (styles: string) => tw`${styles}`;
