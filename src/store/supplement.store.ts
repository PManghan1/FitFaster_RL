// Previous imports...

const useSupplementStore = create<SupplementState & SupplementActions>()(
  persist(
    (set, get) => ({
      // Rest of the implementation...
      deleteSupplement: async supplementId => {
        try {
          set({ loading: true });
          // Cancel reminders
          const identifiers = get().reminderIdentifiers[supplementId] || [];
          for (const identifier of identifiers) {
            await notificationService.cancelSupplementReminder(identifier);
          }

          set(state => {
            const supplements = state.supplements.filter(s => s.id !== supplementId);
            const intakes = state.intakes.filter(i => i.supplementId !== supplementId);
            const remainingIdentifiers = { ...state.reminderIdentifiers };
            delete remainingIdentifiers[supplementId];

            cacheService.setSupplements(supplements);
            cacheService.setIntakes(intakes);

            return {
              supplements,
              intakes,
              reminderIdentifiers: remainingIdentifiers,
            };
          });
        } catch (error) {
          set({ error: { code: 'DELETE_ERROR', message: 'Failed to delete supplement' } });
        } finally {
          set({ loading: false });
        }
      },
      // Rest of the implementation...
    }),
    {
      name: 'supplement-storage',
      partialize: state => ({
        supplements: state.supplements,
        intakes: state.intakes,
        reminderIdentifiers: state.reminderIdentifiers,
      }),
    }
  )
);

export default useSupplementStore;
