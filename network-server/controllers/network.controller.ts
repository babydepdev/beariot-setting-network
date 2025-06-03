import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../utils/catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import yaml from "js-yaml";

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
            ...(ethernet.ipMode === "auto" && {
              "dhcp4-overrides": {
                "route-metric": ethernet.priority,
              },
            }),
            addresses:
              ethernet.ipMode === "manual" && ethernet.ipAddress
                ? [ethernet.ipAddress]
                : undefined,
            // gateway4: ethernet.ipGateway || undefined,
            nameservers: ethernet.dnsAddress
              ? { addresses: [ethernet.dnsAddress] }
              : undefined,
            ...(ethernet.ipMode === "manual" && {
              routes: [
                {
                  to: "0.0.0.0/0",
                  via: ethernet.ipGateway,
                  metric: ethernet.priority,
                },
              ],
            }),
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
            ...(wifi.ipMode === "auto" && {
              "dhcp4-overrides": {
                "route-metric": wifi.priority,
              },
            }),
            "access-points": wifi.accessPoint
              ? {
                  [wifi.accessPoint]: {
                    password: wifi.password || undefined,
                  },
                }
              : undefined,
            addresses:
              wifi.ipMode === "manual" && wifi.ipAddress
                ? [wifi.ipAddress]
                : undefined,
            // gateway4: wifi.ipGateway || undefined,
            nameservers: wifi.dnsAddress
              ? { addresses: [wifi.dnsAddress] }
              : undefined,
            optional: true,
            ...(wifi.ipMode === "manual" && {
              routes: [
                {
                  to: "0.0.0.0/0",
                  via: wifi.ipGateway,
                  metric: wifi.priority,
                },
              ],
            }),
          },
        };
      }

      if (
        !netplanConfig.network.ethernets ||
        Object.keys(netplanConfig.network.ethernets).length === 0
      ) {
        delete netplanConfig.network.ethernets;
      }
      if (
        !netplanConfig.network.wifis ||
        Object.keys(netplanConfig.network.wifis).length === 0
      ) {
        delete netplanConfig.network.wifis;
      }

      const yamlStr = yaml.dump(netplanConfig, {
        noArrayIndent: true,
        flowLevel: -1,
        styles: {
          "!!str": "plain",
        },
      });

      const buffer = Buffer.from(yamlStr, "utf8");

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=network-config.yaml"
      );
      res.setHeader("Content-Type", "application/x-yaml");
      res.status(200).send(buffer);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
