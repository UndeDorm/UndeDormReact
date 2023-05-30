export const transformTimestampToDate = (timestamp?: number) => {
  if (!timestamp) {
    return new Date().toISOString().split('T')[0];
  }

  return new Date(timestamp).toISOString().split('T')[0];
};

export const transformDateToTimestamp = (date: string) => {
  return new Date(date).getTime();
};

export const getAge = (timestamp: number) => {
  const date = transformTimestampToDate(timestamp);
  const today = new Date();
  const birthDate = new Date(date);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
