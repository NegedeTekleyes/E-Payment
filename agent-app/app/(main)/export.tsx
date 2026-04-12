import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Button from "../../components/Button";
import { COLORS } from "../../constants/colors";
import { useRouter } from "expo-router";
import { getPayments } from "../../services/paymentService";
import { getCustomers } from "../../services/customerService";

// Define types for the data structures
interface PaymentRecord {
  amount: number;
  date: string;
}

type PaymentsData = Record<string, Record<string, PaymentRecord>>;

interface Customer {
  firstName: string;
  lastName: string;
  phone: string;
  account: string;
}

interface ExportRow {
  "Customer Name": string;
  "Phone": string;
  "Account Number": string;
  "Month": string;
  "Amount (ETB)": number;
  "Payment Date": string;
}

export default function Export() {
  const router = useRouter();

  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);
  const [exporting, setExporting] = useState(false);

  const formatDate = (date: Date | null): string => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const toDateOnly = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const generateCSV = async (from: Date, to: Date): Promise<string> => {
    const payments = (await getPayments()) as PaymentsData;
    const customers = (await getCustomers()) as Customer[];

    // Build map of phone -> customer
    const customerMap: Record<string, Customer> = {};
    customers.forEach((cust) => {
      customerMap[cust.phone] = cust;
    });

    const fromStr = toDateOnly(from);
    const toStr = toDateOnly(to);

    const rows: ExportRow[] = [];

    for (const [customerId, months] of Object.entries(payments)) {
      const customer = customerMap[customerId];
      if (!customer) continue;

      for (const [month, payment] of Object.entries(months)) {
        const paymentDate = payment.date.split("T")[0];
        if (paymentDate >= fromStr && paymentDate <= toStr) {
          rows.push({
            "Customer Name": `${customer.firstName} ${customer.lastName}`,
            "Phone": customer.phone,
            "Account Number": customer.account,
            "Month": month,
            "Amount (ETB)": payment.amount,
            "Payment Date": paymentDate,
          });
        }
      }
    }

    if (rows.length === 0) {
      return "No payments found in selected date range.";
    }

    // Sort by payment date (newest first)
    rows.sort((a, b) => b["Payment Date"].localeCompare(a["Payment Date"]));

    const headers = Object.keys(rows[0]) as (keyof ExportRow)[];
    const csvRows = [
      headers.join(","),
      ...rows.map(row => headers.map(header => `"${row[header]}"`).join(","))
    ];
    return csvRows.join("\n");
  };

  const handleExport = async (share: boolean) => {
    if (!fromDate || !toDate) {
      Alert.alert("Missing Dates", "Please select both From and To dates.");
      return;
    }
    if (fromDate > toDate) {
      Alert.alert("Invalid Range", "From date must be before or equal to To date.");
      return;
    }

    setExporting(true);
    try {
      const csvContent = await generateCSV(fromDate, toDate);
      if (csvContent.startsWith("No payments")) {
        Alert.alert("No Data", csvContent);
        return;
      }

      const fileName = `payments_${formatDate(fromDate)}_to_${formatDate(toDate)}.csv`;
      const filePath = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(filePath, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
});
      

      if (share) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(filePath);
        } else {
          Alert.alert("Error", "Sharing is not available on this device.");
        }
      } else {
        Alert.alert("Download Complete", `CSV saved to:\n${filePath}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Export Failed", "Something went wrong while generating the CSV.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Export Payments</Text>
      </View>

      <Text style={styles.label}>From Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowFrom(true)}>
        <Text style={[styles.dateText, !fromDate && styles.placeholder]}>
          {formatDate(fromDate)}
        </Text>
      </TouchableOpacity>
      {showFrom && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowFrom(false);
            if (selectedDate) setFromDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>To Date</Text>
      <TouchableOpacity style={styles.input} onPress={() => setShowTo(true)}>
        <Text style={[styles.dateText, !toDate && styles.placeholder]}>
          {formatDate(toDate)}
        </Text>
      </TouchableOpacity>
      {showTo && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowTo(false);
            if (selectedDate) setToDate(selectedDate);
          }}
        />
      )}

      {fromDate && toDate && fromDate <= toDate && (
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>
            📅 Exporting payments from{" "}
            <Text style={styles.summaryHighlight}>{formatDate(fromDate)}</Text> to{" "}
            <Text style={styles.summaryHighlight}>{formatDate(toDate)}</Text>
          </Text>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <Button
          title={exporting ? "Exporting..." : "Download CSV"}
          onPress={() => handleExport(false)}
          disabled={exporting}
        />
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => handleExport(true)}
          disabled={exporting}
        >
          <Text style={styles.shareText}>{exporting ? "Exporting..." : "Share"}</Text>
        </TouchableOpacity>
      </View>

      {exporting && <ActivityIndicator style={{ marginTop: 20 }} size="large" color={COLORS.primary} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textPrimary || "#1f2937",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 6,
    marginTop: 12,
    color: "#374151",
  },
  input: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: "#1f2937",
  },
  placeholder: {
    color: "#9ca3af",
  },
  summaryBox: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 10,
    marginVertical: 16,
  },
  summaryText: {
    fontSize: 14,
    color: "#0369a1",
    textAlign: "center",
  },
  summaryHighlight: {
    fontWeight: "700",
  },
  buttonGroup: {
    marginTop: 8,
    gap: 12,
  },
  shareBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  shareText: {
    fontWeight: "600",
    color: COLORS.primary,
  },
});