# Assets

Static assets including images, fonts, and other media files.

## Structure

```
assets/
├── images/          # Image assets
│   ├── icons/       # App icons
│   ├── logos/       # Logo variants
│   └── illustrations/
├── fonts/           # Custom fonts
├── sounds/          # Sound effects
└── animations/      # Lottie animations
```

## Guidelines

- Use optimized images (WebP when possible)
- Provide @2x and @3x variants for images
- Use vector graphics (SVG) for icons when possible
- Keep asset file sizes minimal
- Use descriptive filenames

## Image Usage

```typescript
// Using static images
import logo from '@assets/images/logo.png';

<Image source={logo} style={styles.logo} />;

// Using SVG icons
import HomeIcon from '@assets/images/icons/home.svg';

<HomeIcon width={24} height={24} />;
```

## Asset Organization

- **images/icons/**: UI icons (24x24, 32x32)
- **images/logos/**: App branding
- **images/illustrations/**: Onboarding, empty states
- **fonts/**: Custom typography
- **sounds/**: Notification sounds, feedback
- **animations/**: Loading, success animations
