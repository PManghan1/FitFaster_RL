import React, { useState, useMemo, useCallback } from 'react';
import { View, FlatList } from 'react-native';
import { Text, Button, FAB } from 'react-native-elements';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useSupplementStore from '../../store/supplement.store';
import { SupplementCard } from '../../components/supplement/SupplementCard';
import { IntakeLogModal } from '../../components/supplement/IntakeLogModal';
import { ConnectionStatus } from '../../components/supplement/ConnectionStatus';
import { useConnectionAlert } from '../../hooks/useConnectionAlert';
import { useSupplementAnalytics } from '../../hooks/useSupplementAnalytics';
import { useSupplementPerformance } from '../../hooks/useSupplementPerformance';
import { SupplementErrorBoundary } from '../../components/supplement/ErrorBoundary';
import type { Supplement } from '../../types/supplement';
import tw from '../../utils/tailwind';

type RootStackParamList = {
  SupplementDetails: { supplementId: string };
  AddSupplement: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

export const SupplementListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { supplements, logIntake } = useSupplementStore();
  const { checkConnection } = useConnectionAlert();
  const { trackLogIntake, trackViewList } = useSupplementAnalytics();
  const { memoizeSupplementData, trackRender, optimizeListRender } = useSupplementPerformance();
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);
  const [intakeModalVisible, setIntakeModalVisible] = useState(false);

  React.useEffect(() => {
    trackViewList();
    trackRender('SupplementList');
  }, [trackViewList, trackRender]);

  const memoizedSupplements = useMemo(
    () => memoizeSupplementData(supplements),
    [supplements, memoizeSupplementData]
  );

  const handleLogIntake = useCallback((supplement: Supplement) => {
    setSelectedSupplement(supplement);
    setIntakeModalVisible(true);
  }, []);

  const handleIntakeSubmit = useCallback(
    async (dosage: number, notes?: string) => {
      if (!selectedSupplement) return;

      await checkConnection(async () => {
        await logIntake(selectedSupplement.id, dosage, notes);
        trackLogIntake(selectedSupplement.id, dosage, 'manual');
        setIntakeModalVisible(false);
        setSelectedSupplement(null);
      });
    },
    [selectedSupplement, checkConnection, logIntake, trackLogIntake]
  );

  const renderItem = useCallback(
    ({ item }: { item: Supplement }) => (
      <SupplementCard
        supplement={item}
        onPress={() =>
          navigation.navigate('SupplementDetails', {
            supplementId: item.id,
          })
        }
        onLogIntake={() => handleLogIntake(item)}
      />
    ),
    [navigation, handleLogIntake]
  );

  const listOptimizations = useMemo(
    () => optimizeListRender(memoizedSupplements, (item: Supplement) => item.id),
    [memoizedSupplements, optimizeListRender]
  );

  const EmptyState = useCallback(
    () => (
      <View style={tw`flex-1 justify-center items-center p-8`}>
        <Text style={tw`text-gray-500 text-center mb-4`}>No supplements added yet</Text>
        <Button
          title="Add Your First Supplement"
          onPress={() => navigation.navigate('AddSupplement')}
          buttonStyle={tw`bg-blue-500`}
        />
      </View>
    ),
    [navigation]
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-50`}>
      <ConnectionStatus />
      <SupplementErrorBoundary>
        <View style={tw`p-4`}>
          <Text h1 style={tw`text-2xl font-bold mb-6`}>
            Supplements
          </Text>
        </View>

        <FlatList
          data={memoizedSupplements}
          renderItem={renderItem}
          contentContainerStyle={tw`px-4`}
          ListEmptyComponent={EmptyState}
          {...listOptimizations}
        />

        <FAB
          title="Add"
          placement="right"
          color="#3B82F6"
          onPress={() => navigation.navigate('AddSupplement')}
        />

        {selectedSupplement && (
          <IntakeLogModal
            visible={intakeModalVisible}
            supplement={selectedSupplement}
            onClose={() => {
              setIntakeModalVisible(false);
              setSelectedSupplement(null);
            }}
            onLog={handleIntakeSubmit}
          />
        )}
      </SupplementErrorBoundary>
    </SafeAreaView>
  );
};
