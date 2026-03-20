export const generateSyntheticBiasData = (): number[][] => {
  const biasData: number[][] = [];

  for (let hour = 0; hour < 24; hour++) {
    const hourRow: number[] = [];

    for (let day = 0; day < 7; day++) {
      let bias = 0;

      if (hour >= 6 && hour <= 9) {
        bias = Math.random() * 3 + 0.5;
      } else if (hour >= 16 && hour <= 19) {
        bias = Math.random() * 4 + 1;
      } else if (hour >= 20 && hour <= 22) {
        bias = -(Math.random() * 2 + 0.5);
      } else if (hour >= 0 && hour <= 5) {
        bias = -(Math.random() * 1.5);
      } else {
        bias = (Math.random() - 0.5) * 2;
      }

      if (day === 1 && hour === 16) {
        bias = 4.5;
      }
      if (day === 5 || day === 6) {
        bias *= 0.7;
      }

      hourRow.push(bias);
    }

    biasData.push(hourRow);
  }

  return biasData;
};

export const getBiasForHour = (biasData: number[][], hour: number): number => {
  if (!biasData || biasData.length === 0) return 0;

  const hourIndex = hour % 24;
  if (hourIndex >= biasData.length) return 0;

  const hourRow = biasData[hourIndex];
  const avgBias = hourRow.reduce((sum, val) => sum + val, 0) / hourRow.length;
  return avgBias;
};
