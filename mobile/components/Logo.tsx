import React from 'react';
import Svg, { Path } from 'react-native-svg';

// Simple inline SVG logo. Replace paths with your actual logo paths for a perfect match.
export default function Logo({ width = 36, height = 36 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12a10 10 0 1020 0A10 10 0 002 12z" fill="#1e90ff" />
      <Path d="M7 12h10v2H7z" fill="#fff" />
    </Svg>
  );
}
