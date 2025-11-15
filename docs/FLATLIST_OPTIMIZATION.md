# FlatList Optimization Guide
**Phase 159: FlatList Performance Best Practices**

## Basic Optimization

### Essential Props

```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={keyExtractor}

  // Performance props
  windowSize={5}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews={true}

  // Optional
  getItemLayout={getItemLayout}
/>
```

## windowSize

Controls how many screen lengths to render.

```typescript
// Default: 21
// Lower = better memory, worse scroll performance
// Higher = worse memory, better scroll performance

windowSize={5} // Recommended for most cases
```

## initialNumToRender

Number of items to render initially.

```typescript
// Should cover the screen + a bit more
initialNumToRender={10} // Adjust based on item height
```

## maxToRenderPerBatch

Maximum number of items to render per batch.

```typescript
// Lower = more frequent updates, smoother scroll
// Higher = fewer updates, better initial render
maxToRenderPerBatch={10}
```

## removeClippedSubviews

Remove off-screen views from the native view hierarchy.

```typescript
// Android: true (recommended)
// iOS: false (can cause issues)
removeClippedSubviews={Platform.OS === 'android'}
```

## getItemLayout

Provide item dimensions for better performance.

```typescript
const ITEM_HEIGHT = 80;

const getItemLayout = (data, index) => ({
  length: ITEM_HEIGHT,
  offset: ITEM_HEIGHT * index,
  index,
});

<FlatList
  getItemLayout={getItemLayout}
  // ...
/>
```

## Key Extractor

Use stable, unique keys.

```typescript
// ✅ Good - unique ID
const keyExtractor = (item) => item.id;

// ❌ Bad - index
const keyExtractor = (item, index) => String(index);

// ⚠️ Acceptable - if no ID
const keyExtractor = (item, index) => `${item.name}-${index}`;
```

## Memoized renderItem

```typescript
const renderItem = useCallback(({ item }) => (
  <MemoizedListItem
    item={item}
    onPress={handleItemPress}
  />
), [handleItemPress]);

// MemoizedListItem.tsx
const ListItem = memo(({ item, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );
});
```

## Using OptimizedFlatList

```typescript
import OptimizedFlatList from '@components/OptimizedFlatList';

<OptimizedFlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  itemHeight={80} // For getItemLayout
  optimize={true}
/>
```

## Using useOptimizedList Hook

```typescript
import { useOptimizedList } from '@hooks/useOptimizedList';

const MyList = () => {
  const {
    data,
    keyExtractor,
    createRenderItem,
    loadMore,
    hasMore,
  } = useOptimizedList({
    data: items,
    keyField: 'id',
    enablePagination: true,
    pageSize: 20,
    filter: (item) => item.active,
    sort: (a, b) => a.name.localeCompare(b.name),
  });

  const renderItem = createRenderItem(
    ListItem,
    (item) => ({
      item,
      onPress: handleItemPress,
    })
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};
```

## Pagination

### Load More

```typescript
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(false);

const loadMore = useCallback(async () => {
  if (loading) return;

  setLoading(true);
  try {
    const newItems = await fetchItems(page + 1);
    setItems((prev) => [...prev, ...newItems]);
    setPage((prev) => prev + 1);
  } finally {
    setLoading(false);
  }
}, [loading, page]);

<FlatList
  data={items}
  onEndReached={loadMore}
  onEndReachedThreshold={0.5}
  ListFooterComponent={loading ? <ActivityIndicator /> : null}
/>
```

### Pull to Refresh

```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = useCallback(async () => {
  setRefreshing(true);
  try {
    const newItems = await fetchItems(1);
    setItems(newItems);
    setPage(1);
  } finally {
    setRefreshing(false);
  }
}, []);

<FlatList
  data={items}
  refreshing={refreshing}
  onRefresh={onRefresh}
/>
```

## Empty State

```typescript
const ListEmptyComponent = useMemo(() => (
  <View style={styles.empty}>
    <Text>No items found</Text>
  </View>
), []);

<FlatList
  data={items}
  ListEmptyComponent={ListEmptyComponent}
/>
```

## Section List Optimization

```typescript
<SectionList
  sections={sections}
  renderItem={renderItem}
  renderSectionHeader={renderSectionHeader}
  keyExtractor={keyExtractor}
  stickySectionHeadersEnabled={true}

  // Same optimization props as FlatList
  windowSize={5}
  initialNumToRender={10}
  removeClippedSubviews={Platform.OS === 'android'}
/>
```

## Common Issues

### Blank Screen on Fast Scroll

**Problem:** Items disappear when scrolling fast

**Solution:**
```typescript
// Increase windowSize
windowSize={10}

// Increase maxToRenderPerBatch
maxToRenderPerBatch={20}

// Disable removeClippedSubviews on iOS
removeClippedSubviews={Platform.OS === 'android'}
```

### Slow Initial Render

**Problem:** Takes too long to show first items

**Solution:**
```typescript
// Reduce initialNumToRender
initialNumToRender={5}

// Use getItemLayout
getItemLayout={getItemLayout}

// Simplify item component
```

### Memory Issues

**Problem:** App crashes with large lists

**Solution:**
```typescript
// Decrease windowSize
windowSize={3}

// Decrease initialNumToRender
initialNumToRender={5}

// Enable removeClippedSubviews
removeClippedSubviews={true}

// Use pagination
```

## Performance Checklist

- [ ] Use stable key extractor (not index)
- [ ] Memoize renderItem with useCallback
- [ ] Memoize child components with React.memo
- [ ] Set windowSize appropriately (3-10)
- [ ] Set initialNumToRender to cover screen
- [ ] Enable removeClippedSubviews on Android
- [ ] Implement getItemLayout for fixed-size items
- [ ] Use pagination for very long lists
- [ ] Avoid anonymous functions in renderItem
- [ ] Optimize item component (avoid heavy renders)
- [ ] Use PureComponent or memo for items
- [ ] Minimize item component depth
- [ ] Lazy load images in items
- [ ] Profile with React DevTools

## Testing Performance

```typescript
// Add performance logging
const renderItem = useCallback(({ item, index }) => {
  const startTime = performance.now();

  const result = <ListItem item={item} />;

  const endTime = performance.now();
  if (endTime - startTime > 16) { // 60fps threshold
    console.warn(`Slow render: ${index} (${endTime - startTime}ms)`);
  }

  return result;
}, []);
```

## References

- [FlatList Documentation](https://reactnative.dev/docs/flatlist)
- [Performance](https://reactnative.dev/docs/performance)
- [Optimizing Flatlist Configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration)
