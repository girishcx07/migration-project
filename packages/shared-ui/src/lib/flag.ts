export const getCountryFlagBy3Code = (countryCode: string = ""): string => {
  if (!countryCode) return "";
  const flagUrl = `https://s3.ap-southeast-1.amazonaws.com/visaero.assets/flags/${countryCode?.toLowerCase()}.png`;
  return flagUrl;
};
