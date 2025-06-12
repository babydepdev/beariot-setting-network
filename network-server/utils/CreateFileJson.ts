import fs from "fs/promises";

export const CreateFileJson = async (
  fileName: string,
  data: any
): Promise<void> => {
  try {
    const jsonString = JSON.stringify(data, null, 4);
    await fs.writeFile(fileName, jsonString, "utf8");
    console.log(`JSON file "${fileName}" has been saved.`);
  } catch (e) {
    console.error("Error writing JSON file:", e);
    throw e;
  }
};
