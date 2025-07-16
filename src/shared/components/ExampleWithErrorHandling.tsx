// Example component showing how to use error handling
// This is a reference implementation - delete or modify as needed

import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useErrorHandler } from '../../core/hooks/useErrorHandler';

export const ExampleComponent: React.FC = () => {
  const [data, setData] = useState<any>(null);
  
  // Initialize error handler for this component
  const { captureError, handleApiCall, tryAsync } = useErrorHandler({
    context: {
      component: 'ExampleComponent',
      screen: 'ExampleScreen',
    },
    onError: (errorReport) => {
      console.log('Component received error:', errorReport);
    },
  });

  // Example 1: Handling API calls
  const fetchData = async () => {
    const result = await handleApiCall(
      async () => {
        const response = await fetch('/api/data');
        if (!response.ok) throw new Error('API request failed');
        return response.json();
      },
      {
        onSuccess: (data) => {
          setData(data);
          console.log('Data fetched successfully');
        },
        onError: (error) => {
          console.log('API call failed:', error.message);
        },
        fallback: { defaultData: true },
      }
    );
  };

  // Example 2: Try-catch wrapper
  const performRiskyOperation = async () => {
    const result = await tryAsync(
      async () => {
        // Some operation that might fail
        const random = Math.random();
        if (random < 0.5) {
          throw new Error('Random failure occurred');
        }
        return 'Success!';
      },
      'Fallback value'
    );
    
    console.log('Result:', result);
  };

  // Example 3: Manual error capture
  const handleButtonPress = () => {
    try {
      // Some synchronous operation
      throw new Error('Button press error');
    } catch (error) {
      captureError(error as Error, 'low');
    }
  };

  return (
    <View>
      <Text>Example Component with Error Handling</Text>
      <Button title="Fetch Data" onPress={fetchData} />
      <Button title="Risky Operation" onPress={performRiskyOperation} />
      <Button title="Trigger Error" onPress={handleButtonPress} />
      {data && <Text>Data: {JSON.stringify(data)}</Text>}
    </View>
  );
};