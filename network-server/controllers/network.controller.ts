import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../utils/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";

interface NetworkSettings {
  ethernet: {
    enable: boolean;
    priority: number;
    ipMode: "manual" | "auto";
    ipAddress?: string;
    ipGateway?: string;
    dnsAddress?: string;
  };
  wifi: {
    enable: boolean;
    priority: number;
    ipMode: "manual" | "auto";
    accessPoint?: string;
    password?: string;
    ipAddress?: string;
    ipGateway?: string;
    dnsAddress?: string;
  };
  cellular: {
    enable: boolean;
    priority: number;
  };
}

export const createFileYAML = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { networkSettings }: { networkSettings: NetworkSettings } =
        req.body;
      if (!networkSettings) {
        return next(new ErrorHandler("Network settings are required", 400));
      }

      const { ethernet, wifi, cellular } = networkSettings;

      const netplanConfig: any = {
        network: {
          version: 2,
          renderer: "networkd",
        },
      };

      if (ethernet && ethernet.enable) {
        netplanConfig.network.ethernets = {
          eth0: {
            dhcp4: ethernet.ipMode === "auto",
            "dhcp4-overrides": {
              "route-metric": ethernet.priority,
            },
            addresses:
              ethernet.ipMode === "manual" && ethernet.ipAddress
                ? `[${ethernet.ipAddress}]`
                : undefined,
            gateway4: ethernet.ipGateway || undefined,
            nameservers: ethernet.dnsAddress
              ? { addresses: `[${ethernet.dnsAddress}]` }
              : undefined,
          },
        };
      }

      if (cellular && cellular.enable) {
        if (!netplanConfig.network.ethernets) {
          netplanConfig.network.ethernets = {};
        }

        netplanConfig.network.ethernets.usb0 = {
          dhcp4: true,
          "dhcp4-overrides": {
            "route-metric": cellular.priority,
          },
        };
      }

      if (wifi && wifi.enable) {
        netplanConfig.network.wifis = {
          wlan0: {
            dhcp4: wifi.ipMode === "auto",
            "dhcp4-overrides": {
              "route-metric": wifi.priority,
            },
            "access-points": wifi.accessPoint
              ? {
                  [wifi.accessPoint]: {
                    password: wifi.password || undefined,
                  },
                }
              : undefined,
            addresses:
              wifi.ipMode === "manual" && wifi.ipAddress
                ? `[${wifi.ipAddress}]`
                : undefined,
            gateway4: wifi.ipGateway || undefined,
            nameservers: wifi.dnsAddress
              ? { addresses: `[${wifi.dnsAddress}]` }
              : undefined,
            optional: true,
          },
        };
      }

      if (!Object.keys(netplanConfig.network).includes("ethernets")) {
        delete netplanConfig.network.ethernets;
      }
      if (!Object.keys(netplanConfig.network).includes("wifis")) {
        delete netplanConfig.network.wifis;
      }

      const yamlStr = yaml.dump(netplanConfig);

      const dirPath = path.resolve(__dirname, "../etc/netplan");
      const filePath = path.join(dirPath, "50-cloud-init.yaml");

      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      fs.writeFile(filePath, yamlStr, "utf8", (writeError) => {
        if (writeError) {
          return next(
            new ErrorHandler(
              `Failed to write YAML file: ${writeError.message}`,
              500
            )
          );
        }

        res.status(200).json({
          message: "YAML configuration created successfully",
          yaml: yamlStr,
        });
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
