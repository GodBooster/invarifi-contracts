export const getKeyByValueEnum = (value: number, enumObject: any): string | undefined => {
  return Object.keys(enumObject).find(key => enumObject[key] === value);
};
