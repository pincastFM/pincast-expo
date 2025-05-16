# PINCASTER_STYLE_GUIDE.md

## VISUAL_IDENTITY {
  PRIMARY_COLOR: "hsl(153 100% 20%)";  // Teal-green shade used throughout the application
  PRIMARY_ACTIVE: "hsl(153 100% 98%)";  // Light teal for active states
  BACKGROUND: "hsl(153 0% 100%)";  // White base
  
  TYPOGRAPHY: {
    FONT_FAMILY: "font-mono"; // Monospace primary typeface
    HEADINGS: "font-semibold"; // Semi-bold weight for headings
    BODY: "text-primary font-mono"; // Primary color text in monospace
  }
  
  SHADOWS: {
    PRIMARY_SHADOW: "shadow-[4px_4px_0px_0px_hsl(153_100%_20%)]"; // Distinctive 4px offset teal shadow
    HOVER_SHADOW: "shadow-[0px_0px_0px_0px_rgba(79,153,153,0)]"; // Shadow disappears on hover
  }
  
  BACKGROUND_GRID: "bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"; // Subtle 24px grid background
  
  AVATAR_SYSTEM: {
    // Character-based color assignments
    COLORS: {
      A: {bg: "bg-red-100", text: "text-red-500"},
      B: {bg: "bg-blue-100", text: "text-blue-500"},
      C: {bg: "bg-green-100", text: "text-green-500"},
      // Additional characters mapped to colors...
    }
  }
}

## COMPONENT_SYSTEM {
  BUTTONS: {
    BASE: "text-center cursor-pointer inline-block border rounded-md transition-all primary-shadow hover:primary-shadow-hover font-semibold";
    SIZES: {
      SMALL: "text-sm py-1 px-3";
      MEDIUM: "text-base py-1 px-4";
      LARGE: "text-lg py-1 px-6";
    }
    VARIANTS: {
      DEFAULT: "border-white bg-primary text-white hover:bg-white hover:text-primary hover:border-primary";
      INVERTED: "bg-white text-primary border-primary";
      MUTED: "bg-primary/10 border-primary text-primary";
    }
    DISABLED: "opacity-50 cursor-not-allowed";
    ANIMATION: "transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg";
  }
  
  MODALS: {
    BACKDROP: "fixed inset-0 bg-primary/10 transition-opacity backdrop-blur-sm";
    PANEL: "relative transform rounded-lg border border-primary bg-white primary-shadow px-4 pb-4 pt-5 text-left transition-all";
    TRANSITIONS: {
      ENTER: "ease-out duration-300";
      LEAVE: "ease-in duration-200";
      TRANSFORM_ENTER: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95";
      TRANSFORM_ENTER_TO: "opacity-100 translate-y-0 sm:scale-100";
    }
  }
  
  CARDS: {
    CONTAINER: "bg-white rounded-lg border border-primary primary-shadow p-4 transition-all";
    HOVER: "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_hsl(153_100%_20%)]";
  }
  
  AUDIO_CONTROLS: {
    PLAYER_BUTTON: "transition-all flex w-12 h-12 justify-center items-center flex-shrink-0 rounded-full border border-primary";
    ACTIVE: "bg-primary text-white";
    INACTIVE: "bg-white text-primary primary-shadow";
    PROGRESS_BAR: "h-2 bg-gray-100 rounded-full overflow-hidden";
    PROGRESS_FILL: "h-full bg-primary transition-all duration-200";
  }
  
  STATUS_INDICATORS: {
    LOADING: "animate-pulse text-primary/60";
    ERROR: "text-red-500 font-semibold";
    SUCCESS: "text-green-500 font-semibold";
  }
  
  USER_AVATAR: {
    BASE: "rounded-full flex items-center justify-center"; 
    SIZES: {
      SMALL: "h-8 w-8 text-sm";
      MEDIUM: "h-12 w-12 text-lg";
      LARGE: "h-16 w-16 text-xl";
    }
  }
  
  NAVIGATION: {
    DIRECTION_INDICATOR: "transform transition-transform duration-300";
    PROGRESS_CONTAINER: "w-full h-2 bg-gray-200 rounded-full overflow-hidden";
    PROGRESS_BAR: "h-full bg-primary transition-all duration-500 relative";
  }
  
  MAP_ELEMENTS: {
    PULSING_DOT: {
      OUTER_COLOR: "rgba(66, 135, 245, ALPHA)"; // Blue with variable opacity
      INNER_COLOR: "rgba(66, 135, 245, 1)"; // Solid blue
      STROKE: "white";
    }
  }
}

## ANIMATIONS {
  CURSOR_BLINK: {
    KEYFRAMES: "@keyframes blink { 0%, 50% { opacity: 1; } 50.01%, 100% { opacity: 0; } }";
    USAGE: "animation: blink 1s infinite step-start";
  }
  
  FLASH: {
    KEYFRAMES: "@keyframes flash { '0%, 100%': { backgroundColor: 'var(--primary)' }, '50%': { backgroundColor: 'var(--background)' } }";
    USAGE: "animate-flash";
  }
  
  BUTTON_TRANSFORM: {
    BASE: "transition-transform duration-300";
    HOVER: "translate-x-[-2px] translate-y-[-2px]";
  }
  
  PULSING_DOT: {
    DURATION: 1750; // milliseconds
    RADIUS_BASE: 0.3; // fraction of size
    OPACITY: "1 - t"; // decreases with time
  }
}

## LAYOUT_PATTERNS {
  CONTAINER: {
    BASE: "px-2 md:px-6 xl:px-0 max-w-7xl mx-auto";
    FULL_HEIGHT: "h-dvh";
    FLEX_COLUMN: "flex flex-col overflow-hidden";
  }
  
  HEADER: {
    BASE: "flex items-center justify-between";
    SPACING: "mt-3 mb-2 px-2";
    BRANDING: {
      CONTAINER: "flex items-center pr-2";
      TITLE: "font-mono text-lg font-bold";
      SUBTITLE: "font-mono pl-[0.5px] text-xs md:text-sm md:block";
    }
  }
  
  MAIN_CONTENT: {
    BASE: "flex-grow overflow-hidden px-2";
  }
  
  FOOTER: {
    BASE: "flex justify-between items-center px-2 py-3";
    TEXT: "font-mono text-xs md:text-sm md:block";
    LINKS: "text-primary hover:text-primary/70 underline";
  }
  
  RESPONSIVE_PATTERNS: {
    TEXT: "text-xs md:text-sm";
    PADDING: "px-2 md:px-6 xl:px-0";
    DISPLAY: "hidden md:block"; // Only show on medium screens and up
  }
}

## UX_PATTERNS {
  GEOLOCATION: {
    USER_MARKER: {
      STYLE: "pulsing-dot";
      COLOR: "blue";
    }
    PROXIMITY_ALERT: {
      NEAR: "bg-primary/20 animate-pulse";
      ARRIVED: "bg-primary text-white";
    }
  }
  
  AUDIO_EXPERIENCE: {
    INITIALIZATION: "modal dialog explaining audio requirements";
    PROGRESS_INDICATOR: "linearized progression with current/total display";
    WAVEFORM: "visual representation of audio content";
  }
  
  STATE_TRACKING: {
    LOADING_STATES: "explicit loading indicators with meaningful messages";
    ERROR_HANDLING: "clear error messages with retry options";
    COMPLETION_TRACKING: "persistent progress indicators";
  }
}

## EVOLUTION_GUIDANCE {
  COLOR_EVOLUTION: {
    APPROACH: "Maintain the teal/green primary color as an anchor, but introduce secondary and tertiary colors for hierarchy";
    SUGGESTIONS: {
      SECONDARY: "hsl(333, 100%, 45%)"; // Vibrant magenta as contrast color
      TERTIARY: "hsl(43, 100%, 50%)"; // Warm yellow as accent
      NEUTRALS: "Expanded range of monochromatic tints and shades of the primary";
    }
  }
  
  TYPOGRAPHY_EVOLUTION: {
    APPROACH: "Keep monospace as primary identity font, but introduce a complementary sans-serif for improved readability in longer content";
    SUGGESTIONS: {
      DISPLAY: "font-mono"; // Keep monospace for headers, buttons, branding
      BODY: "font-sans"; // More readable font for longer text passages
      SCALE: "More dramatic size contrast between display and body text";
    }
  }
  
  COMPONENT_EVOLUTION: {
    APPROACH: "Add dimension through subtle depth effects while maintaining the geometric character";
    SUGGESTIONS: {
      SHADOWS: "Multiple layers of shadows with varying opacities";
      GRADIENTS: "Subtle linear gradients within buttons and cards";
      MOTION: "Expanded motion language with more playful interactions";
    }
  }
  
  LAYOUT_EVOLUTION: {
    APPROACH: "Maintain the clean grid-based layout but add asymmetrical elements for visual interest";
    SUGGESTIONS: {
      GRID: "Keep 24px grid but introduce diagonal or curved elements that break the grid in strategic places";
      WHITESPACE: "More dramatic use of whitespace to create hierarchy";
      CONTAINMENT: "Less rigid container boundaries with elements that bleed out";
    }
  }
  
  VISUAL_NOISE_EVOLUTION: {
    APPROACH: "Introduce subtle texture while maintaining minimalist aesthetic";
    SUGGESTIONS: {
      TEXTURES: "Noise patterns, dot grids, or paper textures at low opacity";
      GRAIN: "Subtle grain effect on backgrounds or cards";
      GRID_VARIATION: "Multiple overlapping grids at different scales and opacities";
    }
  }
}

## LO-FI_CONSTRAINTS {
  TECHNICAL_SPECS: {
    MAX_CSS_SIZE: "Maximize use of utility classes, minimize custom CSS";
    PERFORMANCE: "Ensure smooth animations on mobile devices";
    ACCESSIBILITY: "Maintain 4.5:1 contrast ratio for text";
  }
  
  MINIMALISM_PRINCIPLES: {
    REDUCTION: "Eliminate decorative elements that don't serve function";
    CONSISTENCY: "Use consistent spacing, sizing, and color application";
    HIERARCHY: "Create clear hierarchy through typography, color, and space";
  }
  
  GEOMETRIC_FOCUS: {
    PRIMITIVES: "Rectangles, circles, and straight lines as primary shapes";
    PRECISION: "Pixel-perfect alignment to the 24px grid";
    ANGLES: "90-degree and 45-degree angles only";
  }
}

## IMPLEMENTATION_INSTRUCTIONS {
  CSS_APPROACH: {
    EXTEND_TAILWIND: "Add the new colors and animation properties to the tailwind.config.js";
    CSS_VARIABLES: "Define new CSS variables for the evolved color palette in :root";
    UTILITY_FIRST: "Create reusable components with utility classes before writing custom CSS";
  }
  
  MIGRATION_STRATEGY: {
    INCREMENTAL: "Update components one by one, starting with the most frequently used";
    PARALLEL_SYSTEMS: "Create new version alongside existing styles to allow comparison";
    DOCUMENTATION: "Document each pattern with before/after examples";
  }
  
  CODE_PATTERNS: {
    COMPONENT_STRUCTURE: "Use Vue 3 Composition API with proper TypeScript types";
    NAMING_CONVENTIONS: "Follow established naming patterns of the codebase";
    REUSABILITY: "Extract reusable styles into Tailwind components using @apply";
  }
}