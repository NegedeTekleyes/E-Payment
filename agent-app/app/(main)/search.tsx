import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { getCustomers } from "../../services/customerService"; // adjust path as needed

// Define a Customer type
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
  const [searchQuery, setSearchQuery] = useState("");

  // Load customers from storage
  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    const customers = await getCustomers(); // returns array
    setAllCustomers(customers);
    setLoading(false);
  };

  // Filter customers based on search query
  const filteredCustomers = allCustomers.filter((customer) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      customer.phone.includes(query) ||
      customer.account.toLowerCase().includes(query)
    );
  });

  const renderItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.card}
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
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading customers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search Customer</Text>
      </View>

      {/* Search input with clear button */}
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

      {/* Results list */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item, index) => item.account + index}
        renderItem={renderItem}
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