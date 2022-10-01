import { createTheme, responsiveFontSizes } from '@mui/material/styles';
// @ts-ignore
import { deepmerge } from '@mui/utils';
import { themeCommonOptions } from './themeCommonOptions';

const themeDarkOption = deepmerge(themeCommonOptions, {
  palette: {
    mode: 'dark',
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
      hint: 'rgba(255, 255, 255, 0.5)',
      // icon: "rgba(255, 255, 255, 0.5)",
    },
    primary: {
      light: 'rgba(0, 140, 150, 1)',
      main: 'rgba(0, 120, 150, 1)',
      dark: 'rgba(0, 100, 150, 1)',
    },
    secondary: {
      light: 'rgba(230, 120, 130, 1)',
      main: 'rgba(200, 120, 130, 1)',
      dark: 'rgba(200, 120, 150, 1)',
    },

    divider: 'rgba(255, 255, 255, 0.12)',
    background: {
      paper: '#303030',
      default: '#303030',
    },
  },
});
let themeDark = createTheme(themeDarkOption);
themeDark = responsiveFontSizes(themeDark);

export { themeDark };
