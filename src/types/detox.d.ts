declare module 'detox' {
  export const device: Device;
  export const element: ElementFacade;
  export const waitFor: WaitForFacade;
  export const by: ByFacade;
  export const expect: ExpectFacade;

  interface LaunchAppParams {
    newInstance?: boolean;
    permissions?: Record<string, boolean>;
    url?: string;
    userNotification?: Record<string, unknown>;
    delete?: boolean;
    launchArgs?: Record<string, string>;
  }

  interface Device {
    launchApp(params?: LaunchAppParams): Promise<void>;
    reloadReactNative(): Promise<void>;
    terminateApp(): Promise<void>;
    sendToHome(): Promise<void>;
    getBundleId(): Promise<string>;
    installApp(): Promise<void>;
    uninstallApp(): Promise<void>;
    openURL(url: string): Promise<void>;
    takeScreenshot(name: string): Promise<void>;
    shake(): Promise<void>;
    setLocation(lat: number, lon: number): Promise<void>;
    setURLBlacklist(urls: string[]): Promise<void>;
    enableSynchronization(): Promise<void>;
    disableSynchronization(): Promise<void>;
    resetContentAndSettings(): Promise<void>;
    getPlatform(): Promise<'ios' | 'android'>;
    pressBack(): Promise<void>;
  }

  interface ElementFacade {
    (by: Matcher): ElementActions;
  }

  interface Matcher {
    id: string;
    text: string;
    label: string;
    type: string;
    traits: string[];
  }

  interface ElementActions {
    tap(): Promise<void>;
    tapAtPoint(point: { x: number; y: number }): Promise<void>;
    longPress(): Promise<void>;
    multiTap(times: number): Promise<void>;
    typeText(text: string): Promise<void>;
    replaceText(text: string): Promise<void>;
    clearText(): Promise<void>;
    scroll(pixels: number, direction: 'up' | 'down' | 'left' | 'right'): Promise<void>;
    scrollTo(edge: 'top' | 'bottom' | 'left' | 'right'): Promise<void>;
    swipe(
      direction: 'up' | 'down' | 'left' | 'right',
      speed?: 'fast' | 'slow',
      percentage?: number,
    ): Promise<void>;
    atIndex(index: number): ElementActions;
  }

  interface WaitForFacade {
    (element: ElementActions): WaitForActions;
  }

  interface WaitForActions {
    toBeVisible(): Promise<void>;
    toBeNotVisible(): Promise<void>;
    toExist(): Promise<void>;
    toNotExist(): Promise<void>;
    toHaveText(text: string): Promise<void>;
    toHaveValue(value: string): Promise<void>;
    toBeFocused(): Promise<void>;
  }

  interface ByFacade {
    id(id: string): Matcher;
    text(text: string): Matcher;
    label(label: string): Matcher;
    type(type: string): Matcher;
    traits(traits: string[]): Matcher;
  }

  interface ExpectFacade {
    (element: ElementActions): Expect;
  }

  interface Expect {
    toBeVisible(): Promise<void>;
    toBeNotVisible(): Promise<void>;
    toExist(): Promise<void>;
    toNotExist(): Promise<void>;
    toHaveText(text: string): Promise<void>;
    toHaveValue(value: string): Promise<void>;
    toBeFocused(): Promise<void>;
  }
}
