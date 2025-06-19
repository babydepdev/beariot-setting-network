import fs from "fs/promises";
import yaml from "js-yaml";

export const CreateFileYAML = async (
  fileName: string,
  data: any,
  indent: number = 4
): Promise<string> => {
  try {
    const yamlStr = yaml.dump(data, {
      noArrayIndent: true,
      flowLevel: -1,
      styles: { "!!str": "plain" },
      indent: indent,
    });
    // console.log(yamlStr);

    await fs.writeFile(fileName, yamlStr, "utf8");
    console.log(`YAML file "${fileName}" has been saved.`);
    return yamlStr;
  } catch (e) {
    console.error("Error converting or writing YAML file:", e);
    throw e;
  }
};
