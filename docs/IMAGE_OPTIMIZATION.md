# Image Optimization Guide
**Phase 168: Optimizing Images for React Native**

## Overview

Images are often the largest assets in mobile apps. This guide covers strategies to reduce image sizes and improve loading performance.

## Quick Wins

### 1. Use WebP Format

WebP provides **25-35% smaller file sizes** compared to JPEG/PNG with similar quality.

**Conversion:**
```bash
# Install cwebp
# macOS
brew install webp

# Ubuntu/Debian
apt-get install webp

# Convert images
cwebp -q 80 input.jpg -o output.webp
cwebp -q 80 input.png -o output.webp

# Batch convert
for img in *.jpg; do
  cwebp -q 80 "$img" -o "${img%.jpg}.webp"
done
```

**Usage:**
```tsx
import { OptimizedImage } from '@components/OptimizedImage';

<OptimizedImage
  source={{ uri: 'https://example.com/image.webp' }}
  style={{ width: 200, height: 200 }}
/>
```

### 2. Compress Images

**Online Tools:**
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [Squoosh](https://squoosh.app/) - Advanced compression
- [Compressor.io](https://compressor.io/) - Lossy/lossless compression

**Command Line:**
```bash
# Install ImageMagick
brew install imagemagick

# Compress JPEG (quality 85%)
convert input.jpg -quality 85 output.jpg

# Compress PNG
pngquant input.png --output output.png

# Batch compress
mogrify -quality 85 *.jpg
```

### 3. Use Appropriate Resolutions

Provide multiple resolutions for different screen densities:

```
assets/
  images/
    logo.png       # 1x (100x100)
    logo@2x.png    # 2x (200x200)
    logo@3x.png    # 3x (300x300)
```

React Native automatically selects the appropriate resolution.

## OptimizedImage Component

### Basic Usage

```tsx
import { OptimizedImage } from '@components/OptimizedImage';

// Simple usage
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 200, height: 200 }}
/>

// With placeholder
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  placeholder={require('./placeholder.png')}
  style={{ width: 200, height: 200 }}
/>

// With fallback on error
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  fallback={require('./fallback.png')}
  style={{ width: 200, height: 200 }}
/>

// Lazy loading
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  lazy={true}
  style={{ width: 200, height: 200 }}
/>
```

### Advanced Features

```tsx
// High priority image
<OptimizedImage
  source={{ uri: 'https://example.com/important.jpg' }}
  priority="high"
  cache="immutable"
  style={{ width: 200, height: 200 }}
/>

// With loading indicator
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  showLoadingIndicator={true}
  onLoadStart={() => console.log('Loading started')}
  onLoadEnd={() => console.log('Loading finished')}
  onError={(error) => console.error('Load error:', error)}
  style={{ width: 200, height: 200 }}
/>

// Disable fade-in animation
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  fadeIn={false}
  style={{ width: 200, height: 200 }}
/>

// Custom fade duration
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  fadeIn={true}
  fadeDuration={500}
  style={{ width: 200, height: 200 }}
/>
```

## Caching Strategies

### Cache Options

```tsx
// Immutable - Cache forever (default for remote images)
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  cache="immutable"
/>

// Web - Use HTTP cache headers
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  cache="web"
/>

// Cache only - Don't fetch from network
<OptimizedImage
  source={{ uri: 'https://example.com/image.jpg' }}
  cache="cacheOnly"
/>
```

### Preloading Images

```tsx
import { preloadImages } from '@components/OptimizedImage';

// Preload images before they're needed
useEffect(() => {
  const images = [
    { uri: 'https://example.com/image1.jpg' },
    { uri: 'https://example.com/image2.jpg' },
    { uri: 'https://example.com/image3.jpg' },
  ];

  preloadImages(images);
}, []);
```

### Clearing Cache

```tsx
import { clearImageCache } from '@components/OptimizedImage';

// Clear memory and disk cache
const handleClearCache = async () => {
  await clearImageCache();
  console.log('Cache cleared');
};
```

## Lazy Loading

### Simple Lazy Load

```tsx
<OptimizedImage
  source={{ uri: 'https://example.com/large-image.jpg' }}
  lazy={true}
  placeholder={require('./placeholder.png')}
  style={{ width: 300, height: 200 }}
/>
```

### In a ScrollView

```tsx
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

function ImageGallery() {
  const [visibleImages, setVisibleImages] = useState<Set<number>>(new Set());

  const handleScroll = (event: any) => {
    const { y } = event.nativeEvent.contentOffset;
    // Calculate which images are visible
    // Update visibleImages state
  };

  return (
    <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
      {images.map((image, index) => (
        <OptimizedImage
          key={index}
          source={{ uri: image.url }}
          lazy={!visibleImages.has(index)}
          style={{ width: 300, height: 200 }}
        />
      ))}
    </ScrollView>
  );
}
```

### In a FlatList

```tsx
import { FlatList } from 'react-native';

function ImageList() {
  const renderItem = ({ item, index }: any) => (
    <OptimizedImage
      source={{ uri: item.url }}
      lazy={index > 5} // Load first 5 immediately
      style={{ width: 300, height: 200 }}
    />
  );

  return (
    <FlatList
      data={images}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      initialNumToRender={5}
      maxToRenderPerBatch={5}
      windowSize={10}
    />
  );
}
```

## Progressive Image Loading

### Low-Quality Image Placeholder (LQIP)

```tsx
// Generate tiny placeholder (e.g., 20x20)
<OptimizedImage
  source={{ uri: 'https://example.com/full-quality.jpg' }}
  placeholder={require('./tiny-placeholder.jpg')} // 20x20
  style={{ width: 400, height: 300 }}
/>
```

**Generate LQIP:**
```bash
# Create tiny version
convert input.jpg -resize 20x20 -quality 50 tiny.jpg
```

### Blurred Placeholder

```tsx
import { BlurView } from '@react-native-community/blur';

function BlurredPlaceholder() {
  const [loaded, setLoaded] = useState(false);

  return (
    <View>
      <Image
        source={require('./placeholder-blurred.jpg')}
        style={StyleSheet.absoluteFill}
        blurRadius={10}
      />
      {loaded && (
        <OptimizedImage
          source={{ uri: 'https://example.com/image.jpg' }}
          onLoadEnd={() => setLoaded(true)}
          style={{ width: 400, height: 300 }}
        />
      )}
    </View>
  );
}
```

## Image Formats Comparison

| Format | Use Case | Pros | Cons | Typical Size |
|--------|----------|------|------|--------------|
| JPEG | Photos, complex images | Widely supported, good compression | No transparency | 50-200 KB |
| PNG | Logos, icons, transparency | Lossless, transparency | Larger files | 100-500 KB |
| WebP | Modern apps | 25-35% smaller than JPEG/PNG | Limited browser support (N/A for RN) | 30-150 KB |
| SVG | Icons, simple graphics | Scalable, tiny | Not for complex images | 1-10 KB |

## Optimization Checklist

### Before Adding Images

- [ ] Resize to exact dimensions needed
- [ ] Compress using appropriate tool
- [ ] Consider WebP format
- [ ] Generate @2x and @3x versions
- [ ] Remove EXIF data
- [ ] Optimize for target quality (usually 80-85%)

### In Code

- [ ] Use OptimizedImage component
- [ ] Implement lazy loading for off-screen images
- [ ] Provide placeholders for better UX
- [ ] Set appropriate cache strategy
- [ ] Handle errors with fallback images
- [ ] Preload critical images

### Testing

- [ ] Test on slow network (3G)
- [ ] Check memory usage
- [ ] Verify caching works
- [ ] Test error handling
- [ ] Measure loading times

## Performance Tips

### 1. Avoid Large Images

```tsx
// ❌ Bad - Loading 4K image for small thumbnail
<Image
  source={{ uri: 'https://example.com/4k-image.jpg' }}
  style={{ width: 100, height: 100 }}
/>

// ✅ Good - Use appropriately sized image
<OptimizedImage
  source={{ uri: 'https://example.com/thumbnail-100x100.jpg' }}
  style={{ width: 100, height: 100 }}
/>
```

### 2. Use Image CDN

```tsx
// Generate optimized URL with CDN
const getOptimizedUrl = (url: string, width: number, height: number) => {
  return `https://cdn.example.com/resize?url=${url}&w=${width}&h=${height}&format=webp`;
};

<OptimizedImage
  source={{ uri: getOptimizedUrl(originalUrl, 400, 300) }}
  style={{ width: 400, height: 300 }}
/>
```

### 3. Batch Image Loading

```tsx
// Load images in batches instead of all at once
const useImageBatchLoader = (images: string[], batchSize = 5) => {
  const [loadedBatches, setLoadedBatches] = useState<Set<number>>(new Set([0]));

  const loadNextBatch = () => {
    const nextBatch = loadedBatches.size;
    setLoadedBatches(prev => new Set([...prev, nextBatch]));
  };

  return { loadedBatches, loadNextBatch };
};
```

### 4. Memory Management

```tsx
// Clean up on unmount
useEffect(() => {
  return () => {
    // Images are automatically cleaned up
    // But you can force it if needed
    clearImageCache();
  };
}, []);
```

## Automated Optimization

### Build Script

**scripts/optimize-images.sh:**
```bash
#!/bin/bash

echo "Optimizing images..."

# Convert to WebP
for img in src/assets/images/*.{jpg,png}; do
  [ -f "$img" ] || continue
  base="${img%.*}"
  cwebp -q 85 "$img" -o "$base.webp"
done

# Compress PNGs
pngquant src/assets/images/*.png --ext .png --force

# Compress JPEGs
mogrify -quality 85 src/assets/images/*.jpg

echo "Optimization complete!"
```

### Pre-commit Hook

**.husky/pre-commit:**
```bash
#!/bin/sh

# Optimize images before commit
./scripts/optimize-images.sh

# Add optimized images
git add src/assets/images/
```

## Troubleshooting

### Issue: Images Not Loading

**Solutions:**
1. Check network connectivity
2. Verify image URL is accessible
3. Check CORS headers (if applicable)
4. Try different cache strategy

### Issue: App Crashes with Large Images

**Solutions:**
1. Reduce image resolution
2. Implement pagination for galleries
3. Use lazy loading
4. Increase memory limit (Android)

### Issue: Slow Image Loading

**Solutions:**
1. Enable image caching
2. Preload critical images
3. Use CDN for images
4. Reduce image file sizes

## Best Practices

1. **Always compress images** before adding to project
2. **Use WebP** when possible for 25-35% size reduction
3. **Provide multiple resolutions** (@1x, @2x, @3x)
4. **Implement lazy loading** for images below the fold
5. **Use placeholders** for better perceived performance
6. **Cache aggressively** for remote images
7. **Monitor memory usage** when loading many images
8. **Test on slow networks** to ensure good UX

## Tools

| Tool | Purpose | URL |
|------|---------|-----|
| TinyPNG | PNG/JPEG compression | https://tinypng.com |
| Squoosh | Advanced image compression | https://squoosh.app |
| cwebp | WebP conversion | https://developers.google.com/speed/webp |
| ImageMagick | Image manipulation | https://imagemagick.org |
| OptiPNG | PNG optimization | http://optipng.sourceforge.net |
| JPEGoptim | JPEG optimization | https://github.com/tjko/jpegoptim |

## References

- [React Native Image Performance](https://reactnative.dev/docs/images#cache-control-ios-only)
- [FastImage Documentation](https://github.com/DylanVann/react-native-fast-image)
- [WebP Format](https://developers.google.com/speed/webp)
- [Image Optimization Guide](https://web.dev/fast/#optimize-your-images)
