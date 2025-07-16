import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { GLView } from 'expo-gl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PerformanceMetrics {
  fps: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  javascript: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  render: {
    drawCalls: number;
    triangles: number;
    textures: number;
  };
  leaks: {
    detached: number;
    retained: number;
    growing: boolean;
  };
}

interface PerformanceMonitorProps {
  visible?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  compact?: boolean;
  glContext?: any; // WebGL context from Three.js
  sceneInfo?: {
    drawCalls?: number;
    triangles?: number;
    textures?: number;
  };
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  visible = true,
  position = 'top-right',
  compact = false,
  glContext,
  sceneInfo,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: { used: 0, total: 0, percentage: 0 },
    javascript: { heapUsed: 0, heapTotal: 0, external: 0 },
    render: { drawCalls: 0, triangles: 0, textures: 0 },
    leaks: { detached: 0, retained: 0, growing: false },
  });
  
  const [expanded, setExpanded] = useState(!compact);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
  const fadeAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;
  
  // FPS calculation
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const fpsRef = useRef(60);
  
  // Memory leak detection
  const memorySnapshots = useRef<number[]>([]);
  const leakThreshold = 5; // MB increase over 30 seconds
  
  // Calculate FPS
  const calculateFPS = useCallback(() => {
    frameCount.current++;
    const currentTime = performance.now();
    const delta = currentTime - lastTime.current;
    
    if (delta >= 1000) {
      fpsRef.current = Math.round((frameCount.current * 1000) / delta);
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  }, []);
  
  // Get memory info
  const getMemoryInfo = useCallback(() => {
    if ('memory' in performance && (performance as any).memory) {
      const memInfo = (performance as any).memory;
      return {
        used: memInfo.usedJSHeapSize / 1048576, // Convert to MB
        total: memInfo.totalJSHeapSize / 1048576,
        limit: memInfo.jsHeapSizeLimit / 1048576,
      };
    }
    return null;
  }, []);
  
  // Detect memory leaks
  const detectMemoryLeaks = useCallback((currentMemory: number) => {
    memorySnapshots.current.push(currentMemory);
    
    // Keep last 30 snapshots (30 seconds of data)
    if (memorySnapshots.current.length > 30) {
      memorySnapshots.current.shift();
    }
    
    // Check for consistent memory growth
    if (memorySnapshots.current.length >= 10) {
      const firstHalf = memorySnapshots.current.slice(0, 15);
      const secondHalf = memorySnapshots.current.slice(15);
      
      const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      return avgSecond - avgFirst > leakThreshold;
    }
    
    return false;
  }, []);
  
  // Update metrics
  useEffect(() => {
    const updateMetrics = () => {
      calculateFPS();
      
      const memInfo = getMemoryInfo();
      const currentMetrics: PerformanceMetrics = {
        fps: fpsRef.current,
        memory: {
          used: memInfo?.used || 0,
          total: memInfo?.total || 0,
          percentage: memInfo ? (memInfo.used / memInfo.total) * 100 : 0,
        },
        javascript: {
          heapUsed: memInfo?.used || 0,
          heapTotal: memInfo?.total || 0,
          external: 0,
        },
        render: {
          drawCalls: sceneInfo?.drawCalls || 0,
          triangles: sceneInfo?.triangles || 0,
          textures: sceneInfo?.textures || 0,
        },
        leaks: {
          detached: 0,
          retained: 0,
          growing: memInfo ? detectMemoryLeaks(memInfo.used) : false,
        },
      };
      
      setMetrics(currentMetrics);
      
      // Update memory history for graph
      setMemoryHistory(prev => {
        const newHistory = [...prev, currentMetrics.memory.percentage];
        return newHistory.slice(-50); // Keep last 50 data points
      });
    };
    
    const interval = setInterval(updateMetrics, 1000);
    const rafId = requestAnimationFrame(function animate() {
      calculateFPS();
      requestAnimationFrame(animate);
    });
    
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(rafId);
    };
  }, [calculateFPS, getMemoryInfo, detectMemoryLeaks, sceneInfo]);
  
  // Handle visibility animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);
  
  // Get position styles
  const getPositionStyles = () => {
    const base = { position: 'absolute' as const, zIndex: 10000 };
    switch (position) {
      case 'top-right':
        return { ...base, top: 50, right: 10 };
      case 'top-left':
        return { ...base, top: 50, left: 10 };
      case 'bottom-right':
        return { ...base, bottom: 50, right: 10 };
      case 'bottom-left':
        return { ...base, bottom: 50, left: 10 };
    }
  };
  
  // Get FPS color
  const getFPSColor = (fps: number) => {
    if (fps >= 55) return '#51cf66';
    if (fps >= 30) return '#ff9f43';
    return '#ff6b6b';
  };
  
  // Get memory color
  const getMemoryColor = (percentage: number) => {
    if (percentage < 70) return '#51cf66';
    if (percentage < 85) return '#ff9f43';
    return '#ff6b6b';
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyles(),
        { opacity: fadeAnim },
        expanded && styles.expandedContainer,
      ]}
    >
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={[styles.fps, { color: getFPSColor(metrics.fps) }]}>
              {metrics.fps} FPS
            </Text>
            <Text style={styles.separator}>|</Text>
            <Text style={[styles.memory, { color: getMemoryColor(metrics.memory.percentage) }]}>
              {metrics.memory.used.toFixed(1)}MB
            </Text>
            {metrics.leaks.growing && (
              <View style={styles.leakWarning}>
                <Text style={styles.leakText}>LEAK</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.details}>
          {/* Memory Graph */}
          <View style={styles.graphContainer}>
            <Text style={styles.sectionTitle}>Memory Usage</Text>
            <View style={styles.graph}>
              {memoryHistory.map((value, index) => (
                <View
                  key={index}
                  style={[
                    styles.graphBar,
                    {
                      height: `${value}%`,
                      backgroundColor: getMemoryColor(value),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
          
          {/* JavaScript Heap */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>JavaScript Heap</Text>
            <Text style={styles.metric}>
              Used: {metrics.javascript.heapUsed.toFixed(1)}MB
            </Text>
            <Text style={styles.metric}>
              Total: {metrics.javascript.heapTotal.toFixed(1)}MB
            </Text>
          </View>
          
          {/* Render Stats */}
          {(metrics.render.drawCalls > 0 || metrics.render.triangles > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Render Stats</Text>
              <Text style={styles.metric}>
                Draw Calls: {metrics.render.drawCalls}
              </Text>
              <Text style={styles.metric}>
                Triangles: {metrics.render.triangles.toLocaleString()}
              </Text>
              <Text style={styles.metric}>
                Textures: {metrics.render.textures}
              </Text>
            </View>
          )}
          
          {/* Leak Detection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Memory Leak Detection</Text>
            <View style={styles.leakStatus}>
              <View style={[
                styles.leakIndicator,
                { backgroundColor: metrics.leaks.growing ? '#ff6b6b' : '#51cf66' }
              ]} />
              <Text style={styles.leakStatusText}>
                {metrics.leaks.growing ? 'Potential leak detected' : 'No leaks detected'}
              </Text>
            </View>
          </View>
          
          {/* Platform Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Platform</Text>
            <Text style={styles.metric}>
              OS: {Platform.OS} {Platform.Version}
            </Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    padding: 10,
    minWidth: 150,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  expandedContainer: {
    width: 280,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fps: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Mono', android: 'monospace' }),
  },
  separator: {
    color: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  memory: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'SF Mono', android: 'monospace' }),
  },
  leakWarning: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  leakText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  details: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metric: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Platform.select({ ios: 'SF Mono', android: 'monospace' }),
    marginBottom: 2,
  },
  graphContainer: {
    marginBottom: 15,
  },
  graph: {
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 2,
    overflow: 'hidden',
  },
  graphBar: {
    width: 4,
    marginHorizontal: 1,
    borderRadius: 2,
  },
  leakStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leakIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  leakStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default PerformanceMonitor;