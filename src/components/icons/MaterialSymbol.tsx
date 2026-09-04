/**
 * Material Symbols (Rounded, filled) rendered as inline SVG.
 *
 * Path data is copied from Google's Material Symbols (Apache License 2.0,
 * https://fonts.google.com/icons?icon.style=Rounded) so the icons ship in the
 * bundle and work offline instead of loading the icon font at runtime.
 */

import { useId, type SVGProps } from 'react'

const MATERIAL_SYMBOL_PATHS = {
  prayer_times:
    'M346.16-160H220q-24.75 0-42.37-17.63Q160-195.25 160-220v-125.59L68-438q-9-9-13-19.81-4-10.82-4-22Q51-491 55-502q4-11 13-20l92-92.41V-740q0-24.75 17.63-42.38Q195.25-800 220-800h125.59L438-892q9-9 20.5-13t22.7-4q11.19 0 22.02 4.7 10.82 4.69 19.78 13.3l91 91h126q24.75 0 42.38 17.62Q800-764.75 800-740v125.59L892-522q9 9 13 19.81 4 10.82 4 22 0 11.19-4 22.19-4 11-13 20l-92 92.41V-220q0 24.75-17.62 42.37Q764.75-160 740-160H614l-91 90q-8.96 8.13-19.78 12.57Q492.39-53 481.2-53q-11.2 0-22.16-4.43Q448.07-61.87 439-70l-92.84-90ZM521-500l59-43 58 43-23-68 59-43h-72l-22-69-22 69h-73l59 43-23 68Zm-41 220q83 0 141.5-58T680-480q0-8-.5-16t-2.5-16q-11 47-49 77.5T539-404q-60 0-101-41t-41-101q0-46 26-82.5t68-51.5h-11q-84 0-142 58.5T280-480q0 84 58 142t142 58Z',
  search:
    'M378-329q-108.16 0-183.08-75Q120-479 120-585t75-181q75-75 181.5-75t181 75Q632-691 632-584.85 632-542 618-502q-14 40-42 75l242 240q9 8.56 9 21.78T818-143q-9 9-22.22 9-13.22 0-21.78-9L533-384q-30 26-69.96 40.5Q423.08-329 378-329Zm-1-60q81.25 0 138.13-57.5Q572-504 572-585t-56.87-138.5Q458.25-781 377-781q-82.08 0-139.54 57.5Q180-666 180-585t57.46 138.5Q294.92-389 377-389Z',
  event:
    'M528-248.18q-28-28.19-28-69Q500-358 528.18-386q28.19-28 69-28Q638-414 666-385.82q28 28.19 28 69Q694-276 665.82-248q-28.19 28-69 28Q556-220 528-248.18ZM180-80q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h65v-28q0-13.6 9-22.8 9-9.2 23.02-9.2t23.5 9.2Q310-861.6 310-848v28h340v-28q0-13.6 9-22.8 9-9.2 23.02-9.2t23.5 9.2Q715-861.6 715-848v28h65q24 0 42 18t18 42v620q0 24-18 42t-42 18H180Zm0-60h600v-430H180v430Z',
  mosque:
    'M304-634q-20 0-37-17t-17-37q0-37 17.5-69.5T316-810l131-88q15-11 33-11t33 11l131 88q31 20 48.5 52.5T710-688q0 20-17 37t-37 17H304ZM40-180v-449q-18-11-29-27T0-692q0-20 20.5-49T70-798q29 28 49.5 57t20.5 49q0 20-11 36t-29 27v189h110v-102q0-24 18.5-43t47.5-19h408q29 0 47.5 19t18.5 43v102h110v-189q-18-11-29-27t-11-36q0-20 20.5-49t49.5-57q29 28 49.5 57t20.5 49q0 20-11 36t-29 27v449q0 25-17.5 42.5T860-120H590q-13 0-21.5-8.5T560-150v-130q0-32-24-56t-56-24q-32 0-56 24t-24 56v130q0 13-8.5 21.5T370-120H100q-25 0-42.5-17.5T40-180Z',
  calendar_month:
    'M180-80q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h65v-28q0-13.6 9-22.8 9-9.2 23.02-9.2t23.5 9.2Q310-861.6 310-848v28h340v-28q0-13.6 9-22.8 9-9.2 23.02-9.2t23.5 9.2Q715-861.6 715-848v28h65q24 0 42 18t18 42v620q0 24-18 42t-42 18H180Zm0-60h600v-430H180v430Zm300-260q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-188.5-11.5Q280-423 280-440t11.5-28.5Q303-480 320-480t28.5 11.5Q360-457 360-440t-11.5 28.5Q337-400 320-400t-28.5-11.5ZM640-400q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-188.5-11.5Q280-263 280-280t11.5-28.5Q303-320 320-320t28.5 11.5Q360-297 360-280t-11.5 28.5Q337-240 320-240t-28.5-11.5ZM640-240q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z',
  event_note:
    'M180-80q-24 0-42-18t-18-42v-620q0-24 18-42t42-18h65v-28q0-13.6 9-22.8 9-9.2 23.02-9.2t23.5 9.2Q310-861.6 310-848v28h340v-28q0-13.6 9-22.8 9-9.2 23.02-9.2t23.5 9.2Q715-861.6 715-848v28h65q24 0 42 18t18 42v620q0 24-18 42t-42 18H180Zm0-60h600v-430H180v430Zm130-280q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h340q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H310Zm0 180q-12.75 0-21.37-8.68-8.63-8.67-8.63-21.5 0-12.82 8.63-21.32 8.62-8.5 21.37-8.5h219q12.75 0 21.38 8.68 8.62 8.67 8.62 21.5 0 12.82-8.62 21.32-8.63 8.5-21.38 8.5H310Z',
} as const

/**
 * Composite icons built from Material paths where the set has no single glyph.
 * `calendar_search`: the calendar with a magnifier cut into its lower-right corner.
 */
type CompositeSymbolName = 'calendar_search'

export type MaterialSymbolName = keyof typeof MATERIAL_SYMBOL_PATHS | CompositeSymbolName

interface MaterialSymbolProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: MaterialSymbolName
  /** Accessible label; omit for purely decorative icons. */
  title?: string
}

export function MaterialSymbol({ name, title, className, ...rest }: MaterialSymbolProps) {
  const maskId = useId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      className={className}
      {...rest}
    >
      {title && <title>{title}</title>}
      {name === 'calendar_search' ? (
        <>
          <mask id={maskId}>
            <rect x="0" y="-960" width="960" height="960" fill="white" />
            <circle cx="660" cy="-300" r="270" fill="black" />
          </mask>
          <path d={MATERIAL_SYMBOL_PATHS.event} mask={`url(#${maskId})`} />
          <g transform="translate(420 -80) scale(0.62)">
            <path d={MATERIAL_SYMBOL_PATHS.search} />
          </g>
        </>
      ) : (
        <path d={MATERIAL_SYMBOL_PATHS[name]} />
      )}
    </svg>
  )
}
