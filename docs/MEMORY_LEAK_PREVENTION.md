# Memory Leak Prevention Guide
**Phase 160: Preventing Memory Leaks in React Native**

## Overview

Memory leaks occur when memory is allocated but never released, causing your app to consume increasing amounts of memory over time, leading to performance degradation and crashes.

## Common Causes

### 1. Timers Not Cleaned Up

**❌ Bad - Memory Leak**
```typescript
useEffect(() => {
  setInterval(() => {
    console.log('This keeps running after unmount!');
  }, 1000);
}, []); // No cleanup!
```

**✅ Good - Proper Cleanup**
```typescript
useEffect(() => {
  const timer = setInterval(() => {
    console.log('This stops on unmount');
  }, 1000);

  return () => {
    clearInterval(timer);
  };
}, []);
```

**✅ Best - Use Helper Hook**
```typescript
import { useTimers } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const { setTimeout, setInterval } = useTimers();

  useEffect(() => {
    // Automatically cleaned up on unmount
    setInterval(() => {
      console.log('Safe!');
    }, 1000);
  }, []);
};
```

### 2. Event Listeners Not Removed

**❌ Bad - Memory Leak**
```typescript
useEffect(() => {
  window.addEventListener('resize', handleResize);
  // Listener stays attached after unmount!
}, []);
```

**✅ Good - Proper Cleanup**
```typescript
useEffect(() => {
  window.addEventListener('resize', handleResize);

  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

**✅ Best - Use Helper Hook**
```typescript
import { useEventListener } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  // Automatically cleaned up on unmount
  useEventListener('resize', handleResize);
};
```

### 3. Subscriptions Not Unsubscribed

**❌ Bad - Memory Leak**
```typescript
useEffect(() => {
  const subscription = eventEmitter.on('data', handleData);
  // Subscription stays active after unmount!
}, []);
```

**✅ Good - Proper Cleanup**
```typescript
useEffect(() => {
  const subscription = eventEmitter.on('data', handleData);

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

**✅ Best - Use Helper Hook**
```typescript
import { useSubscription } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const { addSubscription } = useSubscription();

  useEffect(() => {
    const subscription = eventEmitter.on('data', handleData);

    // Automatically unsubscribed on unmount
    addSubscription(() => subscription.unsubscribe());
  }, []);
};
```

### 4. setState After Unmount

**❌ Bad - Memory Leak & Warning**
```typescript
useEffect(() => {
  fetchData().then((data) => {
    setState(data); // Component might be unmounted!
  });
}, []);
```

**✅ Good - Check if Mounted**
```typescript
useEffect(() => {
  let isMounted = true;

  fetchData().then((data) => {
    if (isMounted) {
      setState(data);
    }
  });

  return () => {
    isMounted = false;
  };
}, []);
```

**✅ Best - Use Helper Hook**
```typescript
import { useMounted, useSafeAsync } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const isMounted = useMounted();

  useEffect(() => {
    fetchData().then((data) => {
      if (isMounted()) {
        setState(data);
      }
    });
  }, []);
};
```

### 5. Fetch Requests Not Aborted

**❌ Bad - Memory Leak**
```typescript
useEffect(() => {
  fetch('/api/data').then((response) => {
    setState(response.data); // Request continues after unmount!
  });
}, []);
```

**✅ Good - Abort Controller**
```typescript
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then((response) => setState(response.data))
    .catch((error) => {
      if (error.name === 'AbortError') {
        console.log('Fetch aborted');
      }
    });

  return () => {
    controller.abort();
  };
}, []);
```

**✅ Best - Use Helper Hook**
```typescript
import { useAbortController } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const { createAbortController, signal } = useAbortController();

  useEffect(() => {
    const controller = createAbortController();

    fetch('/api/data', { signal })
      .then((response) => setState(response.data))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      });
  }, []);
};
```

### 6. Animation Frames Not Cancelled

**❌ Bad - Memory Leak**
```typescript
useEffect(() => {
  const animate = () => {
    // Animation logic
    requestAnimationFrame(animate);
  };
  animate();
  // Animation continues after unmount!
}, []);
```

**✅ Good - Cancel Animation**
```typescript
useEffect(() => {
  let frameId: number;

  const animate = () => {
    // Animation logic
    frameId = requestAnimationFrame(animate);
  };
  animate();

  return () => {
    cancelAnimationFrame(frameId);
  };
}, []);
```

**✅ Best - Use Helper Hook**
```typescript
import { useAnimationCleanup } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const { requestAnimationFrame } = useAnimationCleanup();

  useEffect(() => {
    const animate = () => {
      // Animation logic
      requestAnimationFrame(animate);
    };
    animate(); // Automatically cancelled on unmount
  }, []);
};
```

## React Native Specific Leaks

### Animated Values

**✅ Proper Cleanup**
```typescript
useEffect(() => {
  const animation = Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 1000,
    useNativeDriver: true,
  });

  animation.start();

  return () => {
    animation.stop();
  };
}, []);
```

### Keyboard Listeners

**✅ Proper Cleanup**
```typescript
useEffect(() => {
  const showSubscription = Keyboard.addListener('keyboardDidShow', handleShow);
  const hideSubscription = Keyboard.addListener('keyboardDidHide', handleHide);

  return () => {
    showSubscription.remove();
    hideSubscription.remove();
  };
}, []);
```

### AppState Listener

**✅ Proper Cleanup**
```typescript
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppStateChange);

  return () => {
    subscription.remove();
  };
}, []);
```

### NetInfo Listener

**✅ Proper Cleanup**
```typescript
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener((state) => {
    setIsConnected(state.isConnected);
  });

  return () => {
    unsubscribe();
  };
}, []);
```

### BackHandler

**✅ Proper Cleanup**
```typescript
useEffect(() => {
  const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
    // Handle back press
    return true;
  });

  return () => {
    backHandler.remove();
  };
}, []);
```

## Detection Tools

### 1. React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Enable "Record why each component rendered"
4. Record while using the app
5. Look for components that render too frequently

### 2. Hermes Profiler (React Native)

**Enable Hermes in android/app/build.gradle:**
```gradle
project.ext.react = [
    enableHermes: true
]
```

**Start profiling:**
```bash
# Start recording
npx react-native profile-hermes

# Use your app
# Stop recording (Ctrl+C)

# Open profile in Chrome DevTools
# chrome://tracing
```

**What to look for:**
- Memory usage increasing over time
- Objects not being garbage collected
- Growing number of event listeners
- Increasing timer count

### 3. Memory Leak Detection Hook

**Use in development:**
```typescript
import { useLeakDetection } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  useLeakDetection('MyComponent');

  // Component logic
};
```

**Console output:**
```
[Memory Leak Warning] MyComponent rendered 150 times in 5000ms
[Leak Detection] MyComponent unmounted after 10000ms with 150 renders
```

### 4. React Native Debugger

1. Install React Native Debugger
2. Open app with remote debugging
3. Use Chrome DevTools Performance tab
4. Take heap snapshots over time
5. Compare snapshots to find leaks

## Best Practices Checklist

### useEffect Cleanup
- [ ] Every useEffect returns a cleanup function if needed
- [ ] All timers are cleared in cleanup
- [ ] All event listeners are removed in cleanup
- [ ] All subscriptions are unsubscribed in cleanup
- [ ] All async operations are cancelled in cleanup
- [ ] All animation frames are cancelled in cleanup

### Event Listeners
- [ ] addEventListener always paired with removeEventListener
- [ ] React Native listeners call .remove() in cleanup
- [ ] Global listeners (window, document) are cleaned up
- [ ] Custom event emitters are cleaned up

### Timers
- [ ] setTimeout/setInterval always cleared
- [ ] Use useTimers hook for automatic cleanup
- [ ] Track timer IDs in refs for cleanup

### Subscriptions
- [ ] Store unsubscribe functions
- [ ] Call unsubscribe in cleanup
- [ ] Use useSubscription hook
- [ ] WebSocket connections closed
- [ ] EventEmitter listeners removed

### Async Operations
- [ ] Check if component is mounted before setState
- [ ] Use AbortController for fetch requests
- [ ] Cancel pending promises on unmount
- [ ] Handle race conditions properly

### Refs
- [ ] Don't create circular references
- [ ] Clean up ref callbacks if needed
- [ ] Set complex refs to null on unmount if needed

### Third-Party Libraries
- [ ] Destroy/dispose library instances
- [ ] Clean up chart/map instances
- [ ] Close database connections
- [ ] Stop location tracking

## Testing for Leaks

### Manual Testing

1. **Navigate back and forth:**
   - Go to screen
   - Leave screen
   - Repeat 10-20 times
   - Check if memory increases

2. **Long-running operations:**
   - Start operation
   - Navigate away immediately
   - Check for errors or warnings

3. **Check console:**
   - Look for "Can't perform a React state update on an unmounted component" warnings
   - These indicate potential memory leaks

### Automated Testing

```typescript
import { render, waitFor } from '@testing-library/react-native';

test('cleans up on unmount', async () => {
  const mockCleanup = jest.fn();

  const { unmount } = render(<MyComponent onCleanup={mockCleanup} />);

  unmount();

  await waitFor(() => {
    expect(mockCleanup).toHaveBeenCalled();
  });
});
```

## Common Patterns

### Pattern 1: Timer Cleanup

```typescript
import { useTimers } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const { setTimeout, setInterval, clearAllTimers } = useTimers();

  useEffect(() => {
    const timer1 = setTimeout(() => console.log('A'), 1000);
    const timer2 = setInterval(() => console.log('B'), 2000);

    // All timers automatically cleaned up on unmount
  }, []);
};
```

### Pattern 2: Subscription Cleanup

```typescript
import { useSubscription } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const { addSubscription } = useSubscription();

  useEffect(() => {
    const sub1 = eventEmitter.on('event1', handler1);
    const sub2 = eventEmitter.on('event2', handler2);

    addSubscription(() => sub1.unsubscribe());
    addSubscription(() => sub2.unsubscribe());

    // All subscriptions automatically cleaned up on unmount
  }, []);
};
```

### Pattern 3: Safe Async

```typescript
import { useSafeAsync } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const [data, setData] = useState(null);

  const fetchData = useSafeAsync(async () => {
    const response = await fetch('/api/data');
    return response.json();
  });

  useEffect(() => {
    fetchData().then((result) => {
      setData(result); // Safe - won't set state if unmounted
    });
  }, []);
};
```

### Pattern 4: Abort Controller

```typescript
import { useAbortController } from '@utils/memoryLeakDetection';

const MyComponent = () => {
  const { createAbortController, signal } = useAbortController();

  useEffect(() => {
    const controller = createAbortController();

    fetch('/api/data', { signal })
      .then((response) => response.json())
      .then((data) => setData(data))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error(error);
        }
      });

    // Request automatically aborted on unmount
  }, []);
};
```

## Hermes Memory Profiler

### Enable Profiling

**iOS:**
```bash
# Record profile
npx react-native profile-hermes --sourcemaps

# Open Chrome DevTools
# Load the .cpuprofile file
```

**Android:**
```bash
# Record profile
adb shell am start -n com.yourapp/com.yourapp.MainActivity --enable-hermes-sampling-profiler

# Download profile
adb pull /sdcard/Download/hermes.cpuprofile

# Open in Chrome DevTools
```

### Analyzing Memory

1. Open Chrome DevTools
2. Go to Memory tab
3. Take heap snapshot
4. Use app for a while
5. Take another snapshot
6. Compare snapshots
7. Look for objects that should have been garbage collected

### What to Look For

- **Detached DOM nodes**: Components that should be unmounted
- **Growing arrays/objects**: Data structures that keep growing
- **Event listeners**: Listeners that weren't removed
- **Timers**: Timers that weren't cleared

## References

- [React useEffect Cleanup](https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development)
- [Hermes Profiler](https://reactnative.dev/docs/profile-hermes)
- [Chrome DevTools Memory Profiler](https://developer.chrome.com/docs/devtools/memory-problems/)
- [React Native Performance](https://reactnative.dev/docs/performance)
