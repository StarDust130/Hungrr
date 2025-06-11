
const AmountInWords = (number: number): string => {
  // Handle non-numeric or negative inputs
  if (isNaN(number) || number < 0) return "";

  // Discard decimal part
  const num = Math.floor(number);

  // Numbers greater than 99,99,999 are not handled and will return an empty string
  if (num > 9999999) return "";

  const a = [
    "",
    "one ",
    "two ",
    "three ",
    "four ",
    "five ",
    "six ",
    "seven ",
    "eight ",
    "nine ",
    "ten ",
    "eleven ",
    "twelve ",
    "thirteen ",
    "fourteen ",
    "fifteen ",
    "sixteen ",
    "seventeen ",
    "eighteen ",
    "nineteen ",
  ];
  const b = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];

  const numStr = ("0000000" + num)
    .substr(-7)
    .match(/^(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!numStr) return "";

  let str = "";
  str +=
    parseInt(numStr[1]) != 0
      ? (a[Number(numStr[1])] ||
          b[Number(numStr[1][0])] + " " + a[Number(numStr[1][1])]) + "lakh "
      : "";
  str +=
    parseInt(numStr[2]) != 0
      ? (a[Number(numStr[2])] ||
          b[Number(numStr[2][0])] + " " + a[Number(numStr[2][1])]) + "thousand "
      : "";
  str +=
    parseInt(numStr[3]) != 0
      ? (a[Number(numStr[3])] ||
          b[Number(numStr[3][0])] + " " + a[Number(numStr[3][1])]) + "hundred "
      : "";
  str +=
    parseInt(numStr[4]) != 0
      ? (str != "" ? "and " : "") +
        (a[Number(numStr[4])] ||
          b[Number(numStr[4][0])] + " " + a[Number(numStr[4][1])])
      : "";

  if (str.trim() === "") return "";

  // Capitalize first letter and add "Rupees Only"
  str = str.charAt(0).toUpperCase() + str.slice(1);
  return str.trim() + " Rupees Only";
};

export default AmountInWords;