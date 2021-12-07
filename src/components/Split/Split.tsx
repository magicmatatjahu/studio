import classNames from "classnames";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import useResizeObserver from "use-resize-observer";

import { Orientation } from "./sash";
import { Sizing, SplitView, SplitViewOptions } from "./split-view/split-view";

import styles from "./split.module.css";

function isPane(item: React.ReactNode): item is typeof Pane {
  return (item as any).type.displayName === "Split.Pane";
}

export interface CommonProps {
  /** Maximum size of each element */
  maxSize?: number;
  /** Minimum size of each element */
  minSize?: number;
  /** Enable snap to zero size */
  snap?: boolean;
  /** Show/Hide element */
  show?: boolean;
}

export type PaneProps = {
  children: React.ReactNode;
} & CommonProps;

export const Pane = forwardRef<HTMLDivElement, PaneProps>(
  ({ children }: PaneProps, ref) => {
    return (
      <div ref={ref} className={styles.splitViewView}>
        {children}
      </div>
    );
  }
);

Pane.displayName = "Split.Pane";

export type SplitHandle = { reset: () => void };

export type SplitProps = {
  children: React.ReactNode;
  /**
   * Initial size of each element
   */
  defaultSizes?: number[];
  /**
   * Initial size of each element
   * @deprecated Use {@link SplitProps.defaultSizes defaultSizes} instead
   */
  sizes?: number[];
  /** Direction to split */
  vertical?: boolean;
  /** Callback on drag */
  onChange?: (sizes: number[]) => void;
} & CommonProps;

const Split = forwardRef<SplitHandle, SplitProps>(
  (
    {
      children,
      maxSize = Infinity,
      minSize = 30,
      sizes,
      defaultSizes = sizes,
      snap = false,
      show = true,
      vertical = false,
      onChange,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null!);
    const previousKeys = useRef<string[]>([]);
    const splitViewPropsRef = useRef(new Map<React.Key, CommonProps>());
    const splitViewRef = useRef<SplitView | null>(null);
    const splitViewViewRef = useRef(new Map<React.Key, HTMLElement>());

    if (process.env.NODE_ENV !== "production" && sizes) {
      console.warn(
        `Prop sizes is deprecated. Please use defaultSizes instead.`
      );
    }

    const childrenArray = useMemo(
      () => React.Children.toArray(children).filter(React.isValidElement),
      [children]
    );

    useImperativeHandle(ref, () => ({
      reset: () => {
        splitViewRef.current?.distributeViewSizes();
      },
    }));

    useLayoutEffect(() => {
      let initializeSizes = true;

      if (sizes && splitViewViewRef.current.size !== sizes.length) {
        initializeSizes = false;

        console.warn(
          `Expected ${sizes.length} children based on sizes but found ${splitViewViewRef.current.size}`
        );
      }

      if (initializeSizes && sizes) {
        previousKeys.current = childrenArray.map(
          (child) => child.key as string
        );
      }

      const options: SplitViewOptions = {
        orientation: vertical ? Orientation.Vertical : Orientation.Horizontal,
        ...(initializeSizes &&
          defaultSizes && {
            descriptor: {
              size: defaultSizes.reduce((a, b) => a + b, 0),
              views: defaultSizes.map((size, index) => ({
                // splitViewViewRef.current is iterator, `any` is for fixing TS error
                container: [...(splitViewViewRef.current as any).values()][index],
                size: size,
                view: {
                  element: document.createElement("div"),
                  minimumSize: minSize,
                  maximumSize: maxSize,
                  snap: snap,
                  layout: () => {},
                },
              })),
            },
          }),
      };

      splitViewRef.current = new SplitView(
        containerRef.current,
        options,
        onChange
      );

      splitViewRef.current.on("sashreset", (_index: number) => {
        splitViewRef.current?.distributeViewSizes();
      });

      const that = splitViewRef.current;

      return () => {
        that.dispose();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Add or remove views as number of children changes
     */
    useEffect(() => {
      const keys = childrenArray.map((child) => child.key as string);

      const enter = keys.filter((key) => !previousKeys.current.includes(key));
      const exit = previousKeys.current.map((key) => !keys.includes(key));

      exit.forEach((flag, index) => {
        if (flag) {
          splitViewRef.current?.removeView(index);
        }
      });

      for (const key of enter) {
        const props = splitViewPropsRef.current.get(key);

        splitViewRef.current?.addView(
          splitViewViewRef.current.get(key)!,
          {
            element: document.createElement("div"),
            minimumSize: props?.minSize ?? minSize,
            maximumSize: props?.maxSize ?? maxSize,
            snap: props?.snap ?? snap,
            layout: () => {},
          },
          Sizing.Distribute
        );
      }

      if (enter.length > 0 || exit.length > 0) {
        previousKeys.current = keys;
      }

      childrenArray.forEach((child, index) => {
        splitViewRef.current?.setViewVisible(index, (child.props as CommonProps).show !== false)
      })
    }, [childrenArray, maxSize, minSize, show, snap]);

    useResizeObserver({
      ref: containerRef,
      onResize: ({ width, height }) => {
        if (width && height) {
          splitViewRef.current?.layout(vertical ? height : width);
        }
      },
    });

    return (
      <div
        ref={containerRef}
        className={classNames(
          styles.splitView,
          vertical ? styles.vertical : styles.horizontal,
          styles.separatorBorder
        )}
      >
        <div className={styles.splitViewContainer}>
          {React.Children.toArray(children).map((child, index) => {
            if (!React.isValidElement(child)) {
              return null;
            }

            // toArray flattens and converts nulls to non-null keys
            const key = child.key!;

            if (isPane(child)) {
              splitViewPropsRef.current.set(key, child.props);
              // console.log((child.props as CommonProps).show)

              return React.cloneElement(child, {
                key: key,
                ref: (el: HTMLElement | null) => {
                  if (el) {
                    splitViewViewRef.current.set(key, el);
                  } else {
                    splitViewViewRef.current.delete(key);
                  }
                },
              });
            } else {
              return (
                <Pane
                  key={key}
                  ref={(el: HTMLElement | null) => {
                    if (el) {
                      splitViewViewRef.current.set(key, el);
                    } else {
                      splitViewViewRef.current.delete(key);
                    }
                  }}
                >
                  {child}
                </Pane>
              );
            }
          })}
        </div>
      </div>
    );
  }
);

Split.displayName = "Split";
export default Object.assign(Split, { Pane: Pane });