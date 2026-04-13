import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { addPayment, getPaymentsForCustomer, updatePayment } from "../../services/paymentService";

export default function CustomerDetail() {
  const params = useLocalSearchParams();
  const name = params.name as string;
  const phone = params.phone as string;
  const account = params.account as string;

  const router = useRouter();

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  interface PaymentRecord {
    amount: number;
    date: string;
  }
  const [paidMonths, setPaidMonths] = useState<Record<string, PaymentRecord>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [amount, setAmount] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Format date for display
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const customerPayments = await getPaymentsForCustomer(phone);
      setPaidMonths(customerPayments as Record<string, PaymentRecord>);
    } catch (error) {
      console.error("Error loading payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handlePay = (month: string) => {
    setSelectedMonth(month);
    setAmount("");
    setModalVisible(true);
  };

  const handleEdit = (month: string, payment: PaymentRecord) => {
    setSelectedMonth(month);
    setSelectedPayment(payment);
    setEditAmount(payment.amount.toString());
    setEditModalVisible(true);
  };

  const confirmPayment = async () => {
    if (!amount || saving) return;
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive number.");
      return;
    }

    setSaving(true);
    try {
      await addPayment(phone, selectedMonth, numericAmount);
      await loadPayments();
      setModalVisible(false);
      setAmount("");
    } catch (error) {
      console.error("Error saving payment:", error);
      Alert.alert("Payment Failed", "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmEdit = async () => {
    if (!editAmount || updating) return;
    const numericAmount = Number(editAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid positive number.");
      return;
    }

    setUpdating(true);
    try {
      await updatePayment(phone, selectedMonth, numericAmount);
      await loadPayments();
      setEditModalVisible(false);
      setEditAmount("");
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error updating payment:", error);
      Alert.alert("Update Failed", "Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading payment history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* BACK */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* CUSTOMER INFO */}
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.detailText}>{phone}</Text>
        <Text style={styles.detailText}>Account: {account}</Text>
      </View>

      <Text style={styles.section}>Payment History</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {months.map((month) => {
          const payment = paidMonths[month];
          const isPaid = !!payment;
          return (
            <View key={month} style={styles.paymentCard}>
              <Text style={styles.monthText}>{month}</Text>
              {isPaid ? (
                <View style={styles.paidContainer}>
                  <View style={styles.paymentDetails}>
                    <Text style={styles.amountText}>{payment.amount} ETB</Text>
                    <Text style={styles.dateText}>📅 {formatDate(payment.date)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEdit(month, payment)}
                    disabled={updating}
                  >
                    <Text style={styles.editText}>✏️</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() => handlePay(month)}
                  disabled={saving}
                >
                  <Text style={styles.payText}>Pay</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* PAY MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pay for {selectedMonth}</Text>
            <Text style={styles.label}>Amount (ETB)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmPayment}
              disabled={saving}
            >
              <Text style={styles.confirmText}>
                {saving ? "Processing..." : "Confirm Payment"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Payment for {selectedMonth}</Text>
            <Text style={styles.label}>New Amount (ETB)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={editAmount}
              onChangeText={setEditAmount}
              placeholder="Enter new amount"
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmEdit}
              disabled={updating}
            >
              <Text style={styles.confirmText}>
                {updating ? "Updating..." : "Update Payment"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
  backBtn: {
    marginBottom: 10,
    marginTop: 30,
  },
  backArrow: {
    fontSize: 28,
    color: COLORS.primary,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 4,
    color: "#111",
  },
  detailText: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  section: {
    fontWeight: "bold",
    marginBottom: 12,
    fontSize: 18,
    color: "#333",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  paymentCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 0.5,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  paidContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentDetails: {
    alignItems: "flex-end",
  },
  amountText: {
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  dateText: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  payText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  editBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f0f0f0",
  },
  editText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
    color: "#555",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: "#fafafa",
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  confirmText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#888",
    fontSize: 16,
    fontWeight: "500",
  },
});