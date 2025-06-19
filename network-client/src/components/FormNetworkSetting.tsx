import {
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  RadioGroup,
  Radio,
  TextField,
  CardHeader,
} from "@mui/material";
import { useState } from "react";
import { NetworkSettings } from "./types/type";

const FormNetworkSetting = () => {
  const [payload, setPayload] = useState<NetworkSettings>({
    ethernet: {
      enable: false,
      isSpecialName: false,
      specialName: "",
      priority: 100,
      ipMode: "auto",
      ipAddress: "",
      ipGateway: "",
      dnsAddress: "",
    },
    wifi: {
      enable: false,
      priority: 200,
      ipMode: "auto",
      accessPoint: "",
      password: "",
      ipAddress: "",
      ipGateway: "",
      dnsAddress: "",
    },
    cellular: {
      enable: false,
      priority: 300,
    },
  });

  console.log(payload);

  const handleCheckBoxChange = (e: any) => {
    const { name, checked } = e.target;
    setPayload((prevPayload) => ({
      ...prevPayload,
      [name]: {
        ...prevPayload[name as keyof NetworkSettings],
        enable: checked,
      },
    }));
  };

  const handleSelectPriority = (e: any) => {
    const { name, value } = e.target;
    setPayload((prevPayload) => ({
      ...prevPayload,
      [name]: {
        ...prevPayload[name as keyof NetworkSettings],
        priority: value,
      },
    }));
  };

  const handleSelectIpMode = (e: any) => {
    const { name, value } = e.target;
    setPayload((prevPayload) => ({
      ...prevPayload,
      [name]: {
        ...prevPayload[name as keyof NetworkSettings],
        ipMode: value,
        ipAddress: "",
        ipGateway: "",
        dnsAddress: "",
      },
    }));
  };

  const handleInputChange = (e: any, networkType: string) => {
    const { name, value } = e.target;
    setPayload((prevPayload) => ({
      ...prevPayload,
      [networkType]: {
        ...prevPayload[networkType as keyof NetworkSettings],
        [name]: value,
      },
    }));
  };

  const validateIP = (ip: string, isCIDR: boolean = false) => {
    const CHECK_FORMAT =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const CHECK_FORMAT_PORT =
      /^(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:3[0-2]|[12]?[0-9])$/;
    return isCIDR ? CHECK_FORMAT_PORT.test(ip) : CHECK_FORMAT.test(ip);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const ethernetInvalid =
      payload.ethernet.ipMode === "manual" &&
      (!validateIP(payload.ethernet.ipAddress, true) ||
        !validateIP(payload.ethernet.ipGateway, false) ||
        !validateIP(payload.ethernet.dnsAddress, false));
    const wifiInvalid =
      payload.wifi.ipMode === "manual" &&
      (!validateIP(payload.wifi.ipAddress, true) ||
        !validateIP(payload.wifi.ipGateway, false) ||
        !validateIP(payload.wifi.dnsAddress, false));

    if (ethernetInvalid || wifiInvalid) {
      alert("Please fix the invalid IP addresses.");
      return;
    }
    const res = await fetch("http://localhost:3000/api/v1/create-file-yaml", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        networkSettings: payload,
      }),
    });

    if (res.status === 200) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "network-config.yaml";
      a.click();
      window.URL.revokeObjectURL(url);
      alert("Download Success");
    } else {
      alert("Error");
    }
    console.log(payload);
  };

  return (
    <>
      <Card elevation={3} style={{ padding: "14px" }}>
        <CardHeader
          title="Beariot Network Setting"
          style={{ borderBottom: "1px solid #e8e8e8" }}
        />
        <form onSubmit={handleSubmit}>
          <CardContent>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={payload.ethernet.enable} />}
                label="ETHERNET"
                name="ethernet"
                onChange={handleCheckBoxChange}
              />
              {payload.ethernet.enable && (
                <>
                  <>
                    <Typography variant="subtitle1" component="h2">
                      Priority
                    </Typography>
                    <FormControl>
                      <Select
                        value={payload.ethernet.priority}
                        onChange={handleSelectPriority}
                        name="ethernet"
                      >
                        <MenuItem disabled value={""}>
                          Please select a priority
                        </MenuItem>
                        <MenuItem value={100}>100</MenuItem>
                        <MenuItem value={200}>200</MenuItem>
                        <MenuItem value={300}>300</MenuItem>
                      </Select>
                    </FormControl>
                  </>
                  <>
                    <FormControlLabel
                      control={
                        <Checkbox checked={payload.ethernet.isSpecialName} />
                      }
                      label="isSpecialName"
                      name="isSpecialName"
                      onChange={(e: any) => {
                        setPayload((prevPayload) => ({
                          ...prevPayload,
                          ethernet: {
                            ...prevPayload.ethernet,
                            isSpecialName: e.target.checked,
                          },
                        }));
                      }}
                    />
                  </>
                  {payload.ethernet.isSpecialName && (
                    <>
                      <Typography variant="subtitle1" component="h2">
                        Special Name
                      </Typography>
                      <TextField
                        variant="outlined"
                        placeholder="eth0"
                        name="specialName"
                        required
                        onChange={(e) => handleInputChange(e, "ethernet")}
                      />
                    </>
                  )}
                  <>
                    <FormControl>
                      <RadioGroup
                        defaultValue="auto"
                        name="ethernet"
                        onChange={handleSelectIpMode}
                      >
                        <FormControlLabel
                          value="auto"
                          control={<Radio />}
                          label="Obtain IP automatically"
                        />
                        <FormControlLabel
                          value="manual"
                          control={<Radio />}
                          label="Use the following IP address"
                        />
                      </RadioGroup>
                    </FormControl>
                  </>

                  {payload.ethernet.ipMode === "manual" && (
                    <>
                      <Typography variant="subtitle1" component="h2">
                        IP Address
                      </Typography>
                      <TextField
                        variant="outlined"
                        placeholder="xxx.xxx.xxx.xx/xx"
                        name="ipAddress"
                        onChange={(e) => handleInputChange(e, "ethernet")}
                        error={
                          payload.ethernet.ipAddress !== "" &&
                          !validateIP(payload.ethernet.ipAddress, true)
                        }
                        helperText={
                          payload.ethernet.ipAddress !== "" &&
                          !validateIP(payload.ethernet.ipAddress, true)
                            ? "Invalid IP address format"
                            : ""
                        }
                      />
                      <Typography variant="subtitle1" component="h2">
                        Default Gateway
                      </Typography>
                      <TextField
                        variant="outlined"
                        placeholder="xxx.xxx.xxx.xx"
                        name="ipGateway"
                        onChange={(e) => handleInputChange(e, "ethernet")}
                        error={
                          payload.ethernet.ipGateway !== "" &&
                          !validateIP(payload.ethernet.ipGateway, false)
                        }
                        helperText={
                          payload.ethernet.ipGateway !== "" &&
                          !validateIP(payload.ethernet.ipGateway, false)
                            ? "Invalid IP Gateway format"
                            : ""
                        }
                      />
                      <Typography variant="subtitle1" component="h2">
                        Preferred DNS Server
                      </Typography>
                      <TextField
                        variant="outlined"
                        placeholder="x.x.x.x"
                        onChange={(e) => {
                          setPayload((prevPayload) => ({
                            ...prevPayload,
                            ethernet: {
                              ...prevPayload.ethernet,
                              dnsAddress: e.target.value,
                            },
                          }));
                        }}
                        error={
                          payload.ethernet.dnsAddress !== "" &&
                          !validateIP(payload.ethernet.dnsAddress, false)
                        }
                        helperText={
                          payload.ethernet.dnsAddress !== "" &&
                          !validateIP(payload.ethernet.dnsAddress, false)
                            ? "Invalid DNS Server format"
                            : ""
                        }
                      />
                    </>
                  )}
                </>
              )}
              <FormControlLabel
                control={<Checkbox checked={payload.wifi.enable} />}
                label="WIFI"
                name="wifi"
                onChange={handleCheckBoxChange}
              />
              {payload.wifi.enable && (
                <>
                  <Typography variant="subtitle1" component="h2">
                    Priority
                  </Typography>
                  <FormControl>
                    <Select
                      value={payload.wifi.priority}
                      onChange={handleSelectPriority}
                      name="wifi"
                    >
                      <MenuItem disabled value={""}>
                        Please select a priority
                      </MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={200}>200</MenuItem>
                      <MenuItem value={300}>300</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <RadioGroup
                      value={payload.wifi.ipMode}
                      name="wifi"
                      onChange={handleSelectIpMode}
                    >
                      <FormControlLabel
                        value="auto"
                        control={<Radio />}
                        label="Obtain IP automatically"
                      />
                      <FormControlLabel
                        value="manual"
                        control={<Radio />}
                        label="Use the following IP address"
                      />
                    </RadioGroup>
                  </FormControl>
                  <FormControl>
                    <Typography variant="subtitle1" component="h2">
                      Access Point
                    </Typography>
                    <TextField
                      variant="outlined"
                      error={payload.wifi.accessPoint === ""}
                      helperText={
                        payload.wifi.accessPoint === ""
                          ? "Required Access Point"
                          : ""
                      }
                      required
                      placeholder="Access Point Name"
                      name="accessPoint"
                      onChange={(e) => handleInputChange(e, "wifi")}
                    />
                    <Typography variant="subtitle1" component="h2">
                      Password
                    </Typography>
                    <TextField
                      variant="outlined"
                      type="password"
                      name="password"
                      onChange={(e) => handleInputChange(e, "wifi")}
                    />
                    {payload.wifi.ipMode === "manual" && (
                      <>
                        <Typography variant="subtitle1" component="h2">
                          IP Address
                        </Typography>
                        <TextField
                          variant="outlined"
                          placeholder="xxx.xxx.xxx.xx/xx"
                          name="ipAddress"
                          error={
                            payload.wifi.ipAddress !== "" &&
                            !validateIP(payload.wifi.ipAddress, true)
                          }
                          helperText={
                            payload.wifi.ipAddress !== "" &&
                            !validateIP(payload.wifi.ipAddress, true)
                              ? "Invalid IP address format"
                              : ""
                          }
                          onChange={(e) => handleInputChange(e, "wifi")}
                        />
                        <Typography variant="subtitle1" component="h2">
                          Default Gateway
                        </Typography>
                        <TextField
                          variant="outlined"
                          placeholder="xxx.xxx.xxx.xx"
                          name="ipGateway"
                          error={
                            payload.wifi.ipGateway !== "" &&
                            !validateIP(payload.wifi.ipGateway, false)
                          }
                          helperText={
                            payload.wifi.ipGateway !== "" &&
                            !validateIP(payload.wifi.ipGateway, false)
                              ? "Invalid IP Gateway format"
                              : ""
                          }
                          onChange={(e) => handleInputChange(e, "wifi")}
                        />
                        <Typography variant="subtitle1" component="h2">
                          Preferred DNS Server
                        </Typography>
                        <TextField
                          variant="outlined"
                          placeholder="x.x.x.x"
                          error={
                            payload.wifi.dnsAddress !== "" &&
                            !validateIP(payload.wifi.dnsAddress, false)
                          }
                          helperText={
                            payload.wifi.dnsAddress !== "" &&
                            !validateIP(payload.wifi.dnsAddress, false)
                              ? "Invalid DNS Server format"
                              : ""
                          }
                          onChange={(e) => {
                            setPayload((prevPayload) => ({
                              ...prevPayload,
                              wifi: {
                                ...prevPayload.wifi,
                                dnsAddress: e.target.value,
                              },
                            }));
                          }}
                          required={payload.wifi.enable}
                        />
                      </>
                    )}
                  </FormControl>
                </>
              )}
              <FormControlLabel
                control={<Checkbox checked={payload.cellular.enable} />}
                label="CELLULAR"
                name="cellular"
                onChange={handleCheckBoxChange}
              />
              {payload.cellular.enable && (
                <>
                  <Typography variant="subtitle1" component="h2">
                    Priority
                  </Typography>
                  <FormControl>
                    <Select
                      value={payload.cellular.priority}
                      onChange={handleSelectPriority}
                      name="cellular"
                    >
                      <MenuItem disabled value={""}>
                        Please select a priority
                      </MenuItem>
                      <MenuItem value={100}>100</MenuItem>
                      <MenuItem value={200}>200</MenuItem>
                      <MenuItem value={300}>300</MenuItem>
                    </Select>
                  </FormControl>
                </>
              )}
            </FormGroup>
          </CardContent>
          <CardActions
            style={{
              justifyContent: "flex-end",
              borderTop: "1px solid #e8e8e8",
            }}
          >
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </CardActions>
        </form>
      </Card>
    </>
  );
};

export default FormNetworkSetting;
