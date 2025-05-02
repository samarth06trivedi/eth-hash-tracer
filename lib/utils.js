export function formatNumber(num) {
  if (isNaN(num) || num === null || num === undefined) {
    return "0.00"
  }

  if (num >= 1.0e9) {
    return (num / 1.0e9).toFixed(2) + "B"
  } else if (num >= 1.0e6) {
    return (num / 1.0e6).toFixed(2) + "M"
  } else if (num >= 1.0e3) {
    return (num / 1.0e3).toFixed(2) + "K"
  } else {
    if (num < 0.1) {
      return num.toFixed(7)
    }
    return num.toFixed(2)
  }
}
