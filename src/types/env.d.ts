/// <reference types="react" />
/// <reference types="react-native" />

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.jpg' {
  const value: any;
  export = value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const GOOGLE_ANDROID_CLIENT_ID: string;
}
