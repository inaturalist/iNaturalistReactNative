// Provides a TypeScript type definition for SVG files imported as React components.
//
// Example usage:
//
// ```
// import MenuIcon from '../assets/menu-icon.svg';
// ```
declare module "*.svg" {
   import { FC, SVGProps, SVGSVGElement } from "react";

   const content: FC<SVGProps<SVGSVGElement>>;
   export default content;
}
