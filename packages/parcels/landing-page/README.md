# @grasdouble/slm_parcel_landing-page

Home page microfrontend for the Lufa platform. Demonstrates Single-SPA microfrontend integration patterns.

## Overview

This microfrontend serves as the landing/home page of the Lufa application. It showcases:

- Independent development and deployment
- Integration with the main container
- Use of shared design system components
- Routing within a microfrontend

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Single-SPA** - Microfrontend lifecycle
- **Vite** - Build tool
- **Lufa Design System** - Shared UI components
- **Vanilla CSS** - CSS Modules for styling

## Development

```bash
# Start standalone dev server
pnpm --filter @grasdouble/slm_parcel_landing-page dev

# Or start with main container
pnpm app:mf:dev

# Build
pnpm --filter @grasdouble/slm_parcel_landing-page build
```

## Integration

This microfrontend is registered in the [main-container](../main-container/) and loaded at the `/home` route.

## Related

- [Main Container](../main-container/) - Container application
- [Microfrontends Overview](../README.md) - Architecture documentation
