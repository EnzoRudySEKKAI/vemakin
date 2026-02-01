/**
 * @deprecated This hook has been deprecated in favor of useSyncLayout from the Sync Layout System.
 * 
 * Please use the new system:
 * 1. Wrap your app with LayoutProvider from '../context/LayoutContext'
 * 2. Use useSyncLayout hook instead
 * 
 * Example migration:
 * ```typescript
 * // OLD
 * const { style } = useHeaderPadding({
 *   headerRef,
 *   isHeaderVisible: showControls,
 *   viewType: mainView,
 * });
 * 
 * // NEW
 * // In parent component:
 * <LayoutProvider>
 *   <YourApp />
 * </LayoutProvider>
 * 
 * // In child component:
 * const { style, isReady } = useSyncLayout({
 *   viewType: mainView,
 *   animate: true,
 * });
 * ```
 * 
 * The new Sync Layout System provides:
 * - Better performance with CSS custom properties
 * - Perfect synchronization between header and content
 * - Support for prefers-reduced-motion
 * - More accurate measurements
 * - Better mobile support
 * 
 * This file is kept for backward compatibility but will be removed in a future version.
 * 
 * Last updated: February 2026
 */

// Re-export useSyncLayout as useHeaderPadding for backward compatibility
export { useSyncLayout as useHeaderPadding } from './useSyncLayout';
export { useSyncLayout as default } from './useSyncLayout';

// Also export the old interface for type compatibility
export type { UseSyncLayoutOptions as UseHeaderPaddingOptions, UseSyncLayoutReturn as UseHeaderPaddingReturn } from './useSyncLayout';
