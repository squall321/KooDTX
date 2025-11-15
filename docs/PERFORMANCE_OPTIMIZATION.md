# Performance Optimization Guide
**Phase 158: React.memo and Performance Best Practices**

## React.memo

### When to Use React.memo
- Component renders often with the same props
- Component re-renders when parent re-renders but props don't change
- Component is computationally expensive

### Example
```typescript
import React, { memo } from 'react';

interface ItemProps {
  id: string;
  name: string;
  onPress: () => void;
}

const Item = memo<ItemProps>(({ id, name, onPress }) => {
  console.log(`Rendering item ${id}`);

  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{name}</Text>
    </TouchableOpacity>
  );
});

export default Item;
```

### Custom Comparison Function
```typescript
const Item = memo<ItemProps>(
  ({ id, name, onPress }) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Return true if props are equal (no re-render needed)
    return (
      prevProps.id === nextProps.id &&
      prevProps.name === nextProps.name
    );
  }
);
```

## useCallback

### When to Use
- Passing callbacks to memoized child components
- Callbacks used as dependencies in useEffect
- Event handlers passed to optimized components

### Example
```typescript
const handlePress = useCallback(() => {
  console.log('Button pressed');
  // Handle press
}, []); // Empty deps = never changes

const handleItemPress = useCallback((id: string) => {
  console.log('Item pressed:', id);
  setSelectedId(id);
}, []); // selectedId not in deps because we're using functional update
```

### With Dependencies
```typescript
const handleSearch = useCallback((query: string) => {
  // Uses filter from props/state
  const results = items.filter(item =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );
  setSearchResults(results);
}, [items]); // Re-create when items change
```

## useMemo

### When to Use
- Expensive calculations
- Creating objects/arrays passed to memoized components
- Filtering/mapping large arrays

### Example
```typescript
const expensiveValue = useMemo(() => {
  // Expensive calculation
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);

const filteredItems = useMemo(() => {
  return items.filter(item => item.active);
}, [items]);

const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}, [items]);
```

## Common Pitfalls

### 1. Inline Object/Array Creation
```typescript
// ❌ Bad - Creates new object every render
<ChildComponent style={{ marginTop: 10 }} />

// ✅ Good - Create outside or use useMemo
const style = { marginTop: 10 };
<ChildComponent style={style} />

// Or
const style = useMemo(() => ({ marginTop: 10 }), []);
<ChildComponent style={style} />
```

### 2. Inline Functions
```typescript
// ❌ Bad - New function every render
<Button onPress={() => handlePress(id)} />

// ✅ Good - Use useCallback
const handlePressWithId = useCallback(() => {
  handlePress(id);
}, [id]);
<Button onPress={handlePressWithId} />
```

### 3. Non-Primitive Props
```typescript
// ❌ Bad - memo won't work
const data = { name: 'John', age: 30 };
<MemoizedComponent data={data} />

// ✅ Good - useMemo for object
const data = useMemo(() => ({ name: 'John', age: 30 }), []);
<MemoizedComponent data={data} />
```

## FlatList Optimization

### Basic Optimization
```typescript
<FlatList
  data={items}
  renderItem={renderItem}
  keyExtractor={(item) => item.id}
  windowSize={5}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  updateCellsBatchingPeriod={50}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### Memoized renderItem
```typescript
const renderItem = useCallback(({ item }) => (
  <MemoizedListItem
    item={item}
    onPress={handleItemPress}
  />
), [handleItemPress]);
```

## Image Optimization

### Use FastImage
```typescript
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>
```

### Preload Images
```typescript
const preloadImages = async () => {
  await FastImage.preload([
    { uri: 'https://example.com/image1.jpg' },
    { uri: 'https://example.com/image2.jpg' },
  ]);
};
```

## Debugging Performance

### Use Performance Monitor
```typescript
import { useRenderCount, useWhyDidYouUpdate } from '@utils/performanceOptimization';

const MyComponent = (props) => {
  useRenderCount('MyComponent');
  useWhyDidYouUpdate('MyComponent', props);

  // Component implementation
};
```

### React DevTools Profiler
1. Open React DevTools
2. Go to Profiler tab
3. Click Record
4. Interact with app
5. Stop recording
6. Analyze flame graph

## Performance Checklist

- [ ] Use React.memo for expensive components
- [ ] Use useCallback for event handlers passed to children
- [ ] Use useMemo for expensive calculations
- [ ] Avoid inline object/array creation in render
- [ ] Optimize FlatList with proper props
- [ ] Use getItemLayout for fixed-size items
- [ ] Memoize renderItem in lists
- [ ] Use proper keys in lists (not index)
- [ ] Lazy load images
- [ ] Use FastImage for network images
- [ ] Remove console.logs in production
- [ ] Enable Hermes engine
- [ ] Use ProGuard/R8 for Android
- [ ] Profile with React DevTools
- [ ] Check for memory leaks

## Anti-Patterns

### Over-Optimization
```typescript
// ❌ Don't memoize everything
const simpleValue = useMemo(() => 1 + 1, []); // Overkill

// ✅ Only memoize when needed
const expensiveValue = useMemo(() => {
  // Complex calculation
}, [deps]);
```

### Wrong Dependencies
```typescript
// ❌ Missing dependencies
const value = useCallback(() => {
  return count + 1;
}, []); // Should include count

// ✅ Correct dependencies
const value = useCallback(() => {
  return count + 1;
}, [count]);
```

## References

- [React.memo Documentation](https://react.dev/reference/react/memo)
- [useCallback Documentation](https://react.dev/reference/react/useCallback)
- [useMemo Documentation](https://react.dev/reference/react/useMemo)
- [React Native Performance](https://reactnative.dev/docs/performance)
