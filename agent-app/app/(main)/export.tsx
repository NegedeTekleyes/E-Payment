import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useState } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import Button from "../../components/Button";
import { COLORS } from "../../constants/colors";

export default function Export() {
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const [showFrom, setShowFrom] = useState(false);
  const [showTo, setShowTo] = useState(false);

  const formatDate = (date: any) => {
    if (!date) return "mm/dd/yyyy";
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Payments</Text>

      {/* FROM DATE */}
      <Text style={styles.label}>From Date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowFrom(true)}
      >
        <Text>{formatDate(fromDate)}</Text>
      </TouchableOpacity>

      {showFrom && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          onChange={(event, selectedDate: any) => {
            setShowFrom(false);
            if (selectedDate) setFromDate(selectedDate);
          }}
        />
      )}

      {/* TO DATE */}
      <Text style={styles.label}>To Date</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowTo(true)}
      >
        <Text>{formatDate(toDate)}</Text>
      </TouchableOpacity>

      {showTo && (
        <DateTimePicker
          value={toDate || new Date()}
          mode="date"
          onChange={(event, selectedDate:any) => {
            setShowTo(false);
            if (selectedDate) setToDate(selectedDate);
          }}
        />
      )}

      {/* DOWNLOAD BUTTON */}
      <Button title="Download CSV" onPress={() => {}} />

      {/* SHARE BUTTON */}
      <TouchableOpacity style={styles.shareBtn}>
        <Text style={styles.shareText}>Share</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 22,
    marginTop:30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  shareBtn: {
    marginTop: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  shareText: {
    fontWeight: "600",
  },
});