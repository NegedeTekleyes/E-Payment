import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { getCustomers, deleteCustomerAndPayments } from "../../services/customerService";

interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  account: string;
  createdAt?: string;
}

export default function Search() {
  const router = useRouter();

  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Load customers from Firestore
  const loadCustomers = async () => {
    setLoading(true);
    const customers = await getCustomers();
    setAllCustomers(customers);
    setLoading(false);
  };

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = allCustomers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      customer.phone.includes(query) ||
      customer.account.toLowerCase().includes(query)
    );
  });

  // Edit handler
  const handleEditCustomer = (customer: Customer) => {
    router.push({
      pathname: "/edit-customer",
      params: {
        account: customer.account,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
      },
    });
  };

  // Delete handler
  const handleDeleteCustomer = (account: string, firstName: string, lastName: string) => {
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete ${firstName} ${lastName}?\nAll payment records will also be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCustomerAndPayments(account);
              loadCustomers(); // refresh list after delete
              Alert.alert("Success", "Customer deleted successfully.");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to delete customer.");
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={() =>
          router.push({
            pathname: "/customer-detaile",
            params: {
              name: `${item.firstName} ${item.lastName}`,
              phone: item.phone,
              account: item.account,
            },
          })
        }
      >
        <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
        <Text style={styles.details}>{item.phone} • {item.account}</Text>
      </TouchableOpacity>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditCustomer(item)}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteCustomer(item.account, item.firstName, item.lastName)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search Customer</Text>
        {/* Refresh button */}
        <TouchableOpacity onPress={loadCustomers} style={styles.refreshButton}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone or account..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        {searchQuery !== "" && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item, index) => item.account + index}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? "No matching customers found" : "No customers registered yet"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={filteredCustomers.length === 0 && styles.emptyList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.textPrimary || "#1f2937",
    flex: 1, // pushes refresh button to the right
  },
  refreshButton: {
    padding: 8,
  },
  refreshIcon: {
    fontSize: 22,
    color: COLORS.primary,
  },
  searchWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#fff",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#333",
  },
  clearButton: {
    position: "absolute",
    right: 15,
    top: 12,
    padding: 4,
  },
  clearText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
    color: "#111827",
  },
  details: {
    color: "#6b7280",
    fontSize: 14,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    padding: 6,
  },
  editButtonText: {
    fontSize: 18,
    color: COLORS.primary,
  },
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    fontSize: 18,
    color: "red",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 16,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: "center",
  },
});