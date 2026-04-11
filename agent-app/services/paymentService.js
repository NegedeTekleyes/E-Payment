import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "PAYMENTS";

export const getPayments = async () => {
  const data = await AsyncStorage.getItem(KEY);
  return data ? JSON.parse(data) : {};
};

export const savePayments = async (payments) => {
  await AsyncStorage.setItem(KEY, JSON.stringify(payments));
};

export const addPayments = async (customerId, month, amount) => {
  if (!customerId || !month || amount === undefined) return;
  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) return;

  const payments = await getPayments();
  if (!payments[customerId]) payments[customerId] = {};
  payments[customerId][month] = {
    amount: numericAmount,
    date: new Date().toISOString(),
  };
  await savePayments(payments);
};