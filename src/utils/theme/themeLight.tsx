import { createTheme, responsiveFontSizes } from '@mui/material/styles';
// @ts-ignore
import { deepmerge } from '@mui/utils';
import { themeCommonOptions } from './themeCommonOptions';

let themeLightOptions = deepmerge(
  {
    palette: {
      // mode: 'light',
      text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.54)',
        disabled: 'rgba(0, 0, 0, 0.38)',
        hint: 'rgba(0, 0, 0, 0.38)',
      },
      divider: 'rgba(0, 0, 0, 0.12)',
      background: {
        paper: '#fff',
        default: '#fff',
      },
    },
  },
  themeCommonOptions,
);
let themeLight = createTheme(themeLightOptions);
themeLight = responsiveFontSizes(themeLight);

export { themeLight };
