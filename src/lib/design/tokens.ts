// CareClock Design System Tokens
export const designTokens = {
  colors: {
    primary: {
      50: '#e6f7ff',
      100: '#bae7ff', 
      200: '#91d5ff',
      300: '#69c0ff',
      400: '#40a9ff',
      500: '#1890ff', // Primary
      600: '#096dd9',
      700: '#0050b3',
      800: '#003a8c',
      900: '#002766',
    },
    
    success: {
      50: '#f6ffed',
      100: '#d9f7be',
      200: '#b7eb8f',
      300: '#95de64',
      400: '#73d13d',
      500: '#52c41a', // Success
      600: '#389e0d',
      700: '#237804',
      800: '#135200',
      900: '#092b00',
    },
    
    warning: {
      50: '#fffbe6',
      100: '#fff1b8',
      200: '#ffe58f',
      300: '#ffd666',
      400: '#ffc53d',
      500: '#faad14', // Warning
      600: '#d48806',
      700: '#ad6800',
      800: '#874d00',
      900: '#613400',
    },
    
    error: {
      50: '#fff2f0',
      100: '#ffccc7',
      200: '#ffa39e',
      300: '#ff7875',
      400: '#ff4d4f', // Error
      500: '#f5222d',
      600: '#cf1322',
      700: '#a8071a',
      800: '#820014',
      900: '#5c0011',
    },
    
    neutral: {
      0: '#ffffff',
      50: '#fafafa',
      100: '#f5f5f5', 
      200: '#f0f0f0',
      300: '#d9d9d9',
      400: '#bfbfbf',
      500: '#8c8c8c',
      600: '#595959',
      700: '#434343',
      800: '#262626',
      900: '#1f1f1f',
      1000: '#000000',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.03)',
    md: '0 2px 8px rgba(0, 0, 0, 0.06)',
    lg: '0 4px 16px rgba(0, 0, 0, 0.08)',
    xl: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
  
  breakpoints: {
    xs: 480,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200,
    xxl: 1600,
  },
} as const;

// CSS-in-JS helper functions
export const getColor = (path: string) => {
  const keys = path.split('.');
  let value: any = designTokens.colors;
  for (const key of keys) {
    value = value[key];
  }
  return value;
};

export const getSpacing = (size: keyof typeof designTokens.spacing) => {
  return `${designTokens.spacing[size]}px`;
};
