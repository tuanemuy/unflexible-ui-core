import "ress";
import React from "react";
import { styled } from "@linaria/react";
import {
  Screen,
  ScreenKind,
  ValuesForScreens,
  getScreen,
  getValueOfScreen,
} from "../lib/screen";
import { BlockProps, initialBlockProps } from "./Block";
import { ColumnsProps, initialColumnsProps } from "./Columns";
import { PlainTextProps, initialPlainTextProps } from "./PlainText";
import { StackedProps, initialStackedProps } from "./Stacked";
import { WrapProps, initialWrapProps } from "./Wrap";

export type Config = {
  breakpoints: [number, number, number, number];
  textColor: string;
  fontFamily: string;
  lineHeight: number;
  fontSize: ValuesForScreens<string>;
};

const defaultConfig: Config = {
  breakpoints: [481, 768, 1069, 1442],
  textColor: "#333333",
  fontFamily: "sans-serif",
  lineHeight: 1.75,
  fontSize: { xl: "100%", m: "87.5%" },
};

export type InitialProps = {
  block: BlockProps;
  columns: ColumnsProps;
  plainText: PlainTextProps;
  stacked: StackedProps;
  wrap: WrapProps;
};

export type ViewPort = {
  width: number;
  screen: Screen;
};

export const ConfigContext = React.createContext<Config>(defaultConfig);

export const InitialPropsContext = React.createContext<InitialProps>({
  block: {},
  columns: {},
  plainText: {},
  stacked: {},
  wrap: {},
});

export const ViewPortContext = React.createContext<ViewPort>({
  width: 0,
  screen: ScreenKind.XS,
});

const debounce = <T extends (...args: any[]) => unknown>(
  callback: T,
  delay = 250
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};

export type UnflexibleProviderProps = {
  config?: Config;
  initialProps?: InitialProps;
  children?: React.ReactNode;
};

export const UnflexibleProvider = ({
  config,
  initialProps,
  children,
}: UnflexibleProviderProps) => {
  const defaultInitialProps = {
    block: initialBlockProps,
    columns: initialColumnsProps,
    plainText: initialPlainTextProps,
    stacked: initialStackedProps,
    wrap: initialWrapProps,
  };

  const c = { ...defaultConfig, ...config };
  const i = { ...defaultInitialProps, ...initialProps };
  const [width, setWidth] = React.useState(window?.innerWidth || 0);
  const [screen, setScreen] = React.useState(
    getScreen(c.breakpoints, window?.innerWidth || 0)
  );

  React.useEffect(() => {
    const handleResize = debounce(() => {
      setWidth(window.innerWidth || 0);
      setScreen(getScreen(c.breakpoints, window.innerWidth || 0));
    });

    handleResize();
    window.addEventListener("resize", handleResize);

    return window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <ConfigContext.Provider value={c}>
      <InitialPropsContext.Provider value={i}>
        <ViewPortContext.Provider value={{ width, screen }}>
          <Component
            color={c.textColor}
            fontSize={getValueOfScreen(c.fontSize, screen) || "100%"}
            fontFamily={c.fontFamily}
            lineHeight={c.lineHeight}
          >
            {children}
          </Component>
        </ViewPortContext.Provider>
      </InitialPropsContext.Provider>
    </ConfigContext.Provider>
  );
};

type ComponentProps = {
  color: string;
  fontSize: string;
  fontFamily: string;
  lineHeight: number;
};

const Component = styled.div<ComponentProps>`
  html,
  body {
    padding: 0;
    margin: 0;
    width: 100vw;
    overflow-x: hidden;
    color: ${(p) => p.color};
    font-size: ${(p) => p.fontSize};
    font-family: ${(p) => p.fontFamily};
    line-height: ${(p) => p.lineHeight};
  }

  img {
    object-fit: cover;
    object-position: 50% 50%;
    vertical-align: middle;
  }
`;
