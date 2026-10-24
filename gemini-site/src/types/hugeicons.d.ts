// The installed free-icons package exports its SVG data but omits the declared types directory.
declare module '@hugeicons/core-free-icons/*' {
  const icon: import('@hugeicons/react').IconSvgElement;
  export default icon;
}
