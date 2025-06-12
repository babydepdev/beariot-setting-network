import fs from "fs/promises";

export const CreateFileText = async (
  fileName: string,
  data: string | object
): Promise<void> => {
  try {
    const content =
      typeof data === "string" ? data : JSON.stringify(data, null, 2);

    await fs.writeFile(fileName, content, "utf8");
    console.log(`Text file "${fileName}" has been saved.`);
  } catch (e) {
    console.error("Error writing text file:", e);
    throw e;
  }
};
