export interface NetworkSettings {
  ethernet: {
    enable: boolean;
    priority: number | "";
    ipMode: "auto" | "manual";
    ipAddress: string;
    ipGateway: string;
    dnsAddress: string;
  };
  wifi: {
    enable: boolean;
    priority: number | "";
    ipMode: "auto" | "manual";
    accessPoint: string;
    password: string;
    ipAddress: string;
    ipGateway: string;
    dnsAddress: string;
  };
  cellular: {
    enable: boolean;
    priority: number | "";
  };
}

export interface DialogAlert {
  open: boolean;
  message: string;
}
