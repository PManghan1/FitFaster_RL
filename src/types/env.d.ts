import type { ImageSourcePropType } from 'react-native';
import type { SvgProps } from 'react-native-svg';

declare module '*.png' {
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpg' {
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.svg' {
  import type { FC } from 'react';
  const content: FC<SvgProps>;
  export default content;
}

declare module '@env' {
  export const SUPABASE_URL: string;
  export const SUPABASE_ANON_KEY: string;
  export const GOOGLE_WEB_CLIENT_ID: string;
  export const GOOGLE_IOS_CLIENT_ID: string;
  export const GOOGLE_ANDROID_CLIENT_ID: string;
}
