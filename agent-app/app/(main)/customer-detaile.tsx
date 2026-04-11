import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";
import { addPayments, getPayments } from "../../services/paymentService";

export default function CustomerDetail() {
  const params = useLocalSearchParams();
  const name = params.name as string
  const phone = params.phone as string
  const account = params.account as string

  const router = useRouter();

  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec"
  ];

interface PaymentRecord { amount: number; }
  const [paidMonths, setPaidMonths] = useState<Record<string, PaymentRecord>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [amount, setAmount] = useState("");

  // Load payments
  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const allPayments = await getPayments();
    const customerPayments = allPayments[phone] || {};
    setPaidMonths(customerPayments);
  };

  // Open modal
  const handlePay = (month: any) => {
    setSelectedMonth(month);
    setModalVisible(true);
  };

  // Confirm payment
  const confirmPayment = async () => {
    if (!amount) return;

    await addPayments(phone, selectedMonth, amount);
    await loadPayments();

    setModalVisible(false);
    setAmount("");
  };

  return (
    <View style={styles.container}>
      {/* BACK */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* CUSTOMER INFO */}
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text>{phone}</Text>
        <Text>{account}</Text>
      </View>

      <Text style={styles.section}>Payment History</Text>

      {/* SCROLL */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {months.map((month) => {
          const isPaid = paidMonths[month];

          return (
            <View key={month} style={styles.paymentCard}>
              <Text style={styles.monthText}>{month}</Text>

              {isPaid ? (
                <Text style={styles.amountText}>
                  {isPaid.amount} ETB
                </Text>
              ) : (
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() => handlePay(month)}
                >
                  <Text style={styles.payText}>Pay</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Pay for {selectedMonth}
            </Text>

            <Text style={styles.label}>Enter Amount (ETB)</Text>

            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
            />

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={confirmPayment}
            >
              <Text style={styles.confirmText}>Confirm Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
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
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  section: {
    fontWeight: "bold",
    marginBottom: 10,
    fontSize: 16,
  },
  scrollArea: {
    flex: 1,
  },
  paymentCard: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  leftSection: {
    flex: 1,
  },
  monthText: {
    fontSize: 16,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  amountText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payText: {
    color: "#fff",
    fontWeight: "500",
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  editText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 16,
  },
  label: {
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  confirmBtn: {
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  confirmText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
   cancelText: {
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },
});