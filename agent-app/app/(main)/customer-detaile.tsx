import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../../constants/colors";

type PaymentData = {
  month: string;
  paid: boolean;
  amount: string;
  paidDate?: string; // ISO date string, e.g., "2026-01-15T10:30:00.000Z"
};

export default function CustomerDetail() {
  const { name, phone, account } = useLocalSearchParams();
  const router = useRouter();

  // Initial data with payment dates for demonstration
  const [payments, setPayments] = useState<PaymentData[]>([
    { month: "Jan", paid: true, amount: "100", paidDate: "2026-01-15T10:00:00.000Z" },
    { month: "Feb", paid: true, amount: "100", paidDate: "2026-02-18T09:30:00.000Z" },
    { month: "Mar", paid: true, amount: "100", paidDate: "2026-03-20T14:15:00.000Z" },
    { month: "Apr", paid: true, amount: "100", paidDate: "2026-04-10T11:45:00.000Z" },
    { month: "May", paid: false, amount: "" },
    { month: "Jun", paid: false, amount: "" },
    { month: "Jul", paid: false, amount: "" },
    { month: "Aug", paid: false, amount: "" },
    { month: "Sep", paid: false, amount: "" },
    { month: "Oct", paid: false, amount: "" },
    { month: "Nov", paid: false, amount: "" },
    { month: "Dec", paid: false, amount: "" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingMonth, setEditingMonth] = useState<PaymentData | null>(null);
  const [amountInput, setAmountInput] = useState("");

  // Helper to format date nicely
  const formatPaymentDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openPaymentModal = (monthData: PaymentData) => {
    setEditingMonth(monthData);
    setAmountInput(monthData.amount);
    setModalVisible(true);
  };

  // Mark as unpaid: clear amount and paidDate
  const markAsUnpaid = () => {
    if (!editingMonth) return;
    setPayments((prev) =>
      prev.map((p) =>
        p.month === editingMonth.month
          ? { ...p, paid: false, amount: "", paidDate: undefined }
          : p
      )
    );
    setModalVisible(false);
    setEditingMonth(null);
    setAmountInput("");
  };

  // Update amount: keep existing paidDate (don't change)
  const updateAmount = () => {
    if (!editingMonth) return;
    if (!amountInput.trim()) {
      alert("Please enter an amount");
      return;
    }
    setPayments((prev) =>
      prev.map((p) =>
        p.month === editingMonth.month
          ? { ...p, amount: amountInput, paid: true } // keep original paidDate
          : p
      )
    );
    setModalVisible(false);
    setEditingMonth(null);
    setAmountInput("");
  };

  // Pay for an unpaid month: set current date as paidDate
  const handlePay = (monthData: PaymentData) => {
    setEditingMonth(monthData);
    setAmountInput("");
    setModalVisible(true);
  };

  const confirmPayment = () => {
    if (!editingMonth) return;
    if (!amountInput.trim()) {
      alert("Please enter an amount");
      return;
    }
    const now = new Date().toISOString();
    setPayments((prev) =>
      prev.map((p) =>
        p.month === editingMonth.month
          ? { ...p, paid: true, amount: amountInput, paidDate: now }
          : p
      )
    );
    setModalVisible(false);
    setEditingMonth(null);
    setAmountInput("");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text>{phone}</Text>
        <Text>{account}</Text>
      </View>

      <Text style={styles.section}>Payment History</Text>

      <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {payments.map((item) => {
          const isPaid = item.paid;
          return (
            <View key={item.month} style={styles.paymentCard}>
              <View style={styles.leftSection}>
                <Text style={styles.monthText}>{item.month}</Text>
                {isPaid && item.paidDate && (
                  <Text style={styles.dateText}>Paid: {formatPaymentDate(item.paidDate)}</Text>
                )}
              </View>

              <View style={styles.rightSection}>
                {isPaid ? (
                  <>
                    <Text style={styles.amountText}>{item.amount} ETB</Text>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => openPaymentModal(item)}
                    >
                      <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => handlePay(item)}
                  >
                    <Text style={styles.payText}>Pay</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMonth?.paid
                ? `Edit payment for ${editingMonth?.month}`
                : `Pay for ${editingMonth?.month}`}
            </Text>

            <Text style={styles.label}>Amount (ETB)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={amountInput}
              onChangeText={setAmountInput}
              placeholder="Enter amount"
            />

            {editingMonth?.paid ? (
              <>
                <TouchableOpacity style={styles.confirmBtn} onPress={updateAmount}>
                  <Text style={styles.confirmText}>Update Amount</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: "#dc2626", marginTop: 10 }]}
                  onPress={markAsUnpaid}
                >
                  <Text style={styles.confirmText}>Mark as Unpaid</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmPayment}>
                <Text style={styles.confirmText}>Confirm Payment</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ marginTop: 15, textAlign: "center", color: "#6b7280" }}>
                Cancel
              </Text>
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
});