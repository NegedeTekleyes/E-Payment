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

// Define a type for payment data
type PaymentData = {
  month: string;
  paid: boolean;
  amount: string; // store amount as string for input convenience
};

export default function CustomerDetail() {
  const { name, phone, account } = useLocalSearchParams();
  const router = useRouter();

  // State for months with payment info (initially some paid months as example)
  const [payments, setPayments] = useState<PaymentData[]>([
    { month: "Jan", paid: true, amount: "100" },
    { month: "Feb", paid: true, amount: "100" },
    { month: "Mar", paid: true, amount: "100" },
    { month: "Apr", paid: true, amount: "100" },
    { month: "May", paid: false, amount: "" },
    { month: "Jun", paid: false, amount: "" },
    { month: "Jul", paid: false, amount: "" },
    { month: "Aug", paid: false, amount: "" },
    { month: "Sep", paid: false, amount: "" },
    { month: "Oct", paid: false, amount: "" },
    { month: "Nov", paid: false, amount: "" },
    { month: "Dec", paid: false, amount: "" },
  ]);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMonth, setEditingMonth] = useState<PaymentData | null>(null);
  const [amountInput, setAmountInput] = useState("");

  const openPaymentModal = (monthData: PaymentData) => {
    setEditingMonth(monthData);
    setAmountInput(monthData.amount);
    setModalVisible(true);
  };

  const handlePaymentAction = () => {
    if (!editingMonth) return;

    const updatedPayments = payments.map((p) => {
      if (p.month === editingMonth.month) {
        // If it was unpaid, mark as paid with amount
        // If it was paid, we either mark unpaid or update amount based on user choice
        // Since we have two actions (Mark Unpaid / Update Amount), we need to differentiate.
        // For simplicity, we'll provide two buttons in the modal: "Mark Unpaid" and "Save Amount".
        // But the requirement says "edit the paid button make it unpaid or edit the amount using same structure".
        // So we'll implement two separate actions inside the modal.
        // We'll handle this by passing an action type. For now, we'll assume the user either clicks "Mark Unpaid" or "Save".
        // But the confirmPayment function is called from a single button. Let's redesign modal to have two action buttons.
        // I'll change the modal content below.
      }
      return p;
    });
    // Not used directly; we'll handle in modal buttons.
    setModalVisible(false);
  };

  // Mark a paid month as unpaid
  const markAsUnpaid = () => {
    if (!editingMonth) return;
    setPayments((prev) =>
      prev.map((p) =>
        p.month === editingMonth.month
          ? { ...p, paid: false, amount: "" }
          : p
      )
    );
    setModalVisible(false);
    setEditingMonth(null);
    setAmountInput("");
  };

  // Update amount (keeps paid status)
  const updateAmount = () => {
    if (!editingMonth) return;
    if (!amountInput.trim()) {
      alert("Please enter an amount");
      return;
    }
    setPayments((prev) =>
      prev.map((p) =>
        p.month === editingMonth.month
          ? { ...p, amount: amountInput, paid: true }
          : p
      )
    );
    setModalVisible(false);
    setEditingMonth(null);
    setAmountInput("");
  };

  // For unpaid months: pay action (mark paid with amount)
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
    setPayments((prev) =>
      prev.map((p) =>
        p.month === editingMonth.month
          ? { ...p, paid: true, amount: amountInput }
          : p
      )
    );
    setModalVisible(false);
    setEditingMonth(null);
    setAmountInput("");
  };

  return (
    <View style={styles.container}>
      {/* BACK BUTTON - fixed */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      {/* CUSTOMER INFO - fixed */}
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text>{phone}</Text>
        <Text>{account}</Text>
      </View>

      <Text style={styles.section}>Payment History</Text>

      {/* ONLY MONTHS SCROLL */}
      <ScrollView
        style={styles.scrollArea}
        showsVerticalScrollIndicator={false}
      >
        {payments.map((item) => {
          const isPaid = item.paid;
          return (
            <View key={item.month} style={styles.paymentCard}>
              <Text style={styles.monthText}>{item.month}</Text>

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

      {/* UNIVERSAL MODAL for both paying and editing paid entries */}
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
              // For paid months: show both actions
              <>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={updateAmount}
                >
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
              // For unpaid months: just confirm payment
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={confirmPayment}
              >
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
  backText: {
    color: COLORS.primary,
    fontSize: 16,
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
    flex: 1, // takes remaining space
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
  monthText: {
    fontSize: 16,
    fontWeight: "500",
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
  paid: {
    color: "green",
    fontWeight: "bold",
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