import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useState, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ButtonGroup from '@mui/material/ButtonGroup';


/**
 * Serial Port page.  This will handle a connection to a serial port.
 * The serial port is controlled by a websocket on the API server.
 */
export default function SerialPortPage() {

    // UI References to call in code
    const serialConsoleTextFieldRef = useRef<HTMLTextAreaElement>(null);

    // State Variables
    const [serialInputText, setSerialInputText] = useState("");
    const [serialCmdTxt, setSerialCmdTxt] = useState("");
    const [socketUrl, setSocketUrl] = useState("ws://127.0.0.1:8000/ws");
    const [serialPortList, setSerialPortList] = useState<string[]>([]);
    const [selectedSerialPortList, setSelectedSerialPort] = useState("");
    const [isSerialConnected, setIsSerialConnected] = useState(false);

    // Setup websocket
    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

    // Websocket status
    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    /**
     * On startup load all the serial ports available to connect to.
     * Set the list of serial ports.
     */
    useEffect(() => {
        setSerialStatus();
    }, []);

    /**
     * Update the serial input messages when lastMessage from websocket is received.
     */
    useEffect(() => {
        console.log(lastMessage);
        if (lastMessage !== null) {
            setSerialInputText(s => s + lastMessage.data);

            if (serialConsoleTextFieldRef.current != null) {
                // Autoscroll to the bottom
                serialConsoleTextFieldRef.current.scrollTop = serialConsoleTextFieldRef.current.scrollHeight;
            }
        }
    }, [lastMessage, setSerialInputText]);

    /**
     * Set the serial status.
     */
    const setSerialStatus = () => {
        // Get Serial Ports status
        axios.get('http://localhost:8000/serial_port_status')
        .then(response => {
            console.log(response.data);

            // Decode the serial port list
            var serialList: string[];
            serialList = []
            response.data["portList"].map((port: any) => {
                serialList.push(port.device);
            });
            setSerialPortList(serialList);

            // Set the connection status
            setIsSerialConnected(response.data["isConnected"]);

            // If connected, set the serial port selected
            setSelectedSerialPort(response.data["connectedPort"]);
        }, error => {
            console.log(error);
        });
    }

    /**
     * Handle the send command button click.
     * This will call the API to call the serial port.
     * The websocket will return the response.
     */
    const handleSendCmdClick = () => {
        if(isSerialConnected)
        {
            console.log("Send Command: " + serialCmdTxt);
            setSerialInputText(serialInputText + "Send Command: " + serialCmdTxt + "\n");

            // Send to websocket the message
            sendMessage(serialCmdTxt);
        }
        else 
        {
            console.log("Serial port not connected");
            setSerialInputText(serialInputText + "Serial port not connected\n");
        }
    };

    /**
     * Set the serial port selected.
     * @param event 
     */
    const handleSelectedSerialPortChange = (event: SelectChangeEvent) => {
        setSelectedSerialPort(event.target.value as string);
    };

    /**
     * Update the command value to send to the serial port.
     * @param {*} event 
     */
    const updateSendCmd = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSerialCmdTxt(event.target.value);
    }

    /**
     * Send command to connect serial port.
     */
    const handleSerialConnectCmdClick = () => {
        if(selectedSerialPortList !== "" || isSerialConnected)
        {
            // Send to websocket the message
            sendMessage('{"cmd": "serial_connect", "port": "' + selectedSerialPortList + '", "baud": 115200}');

            // Get the latest serial status
            setSerialStatus();
        }
    }

    /**
     * Send command to disconnect serial port.
     */
    const handleSerialDisconnectCmdClick = () => {
        // Send to websocket the message
        sendMessage('{"cmd": "serial_disconnect"}');

        // Get the latest serial status
        setSerialStatus();
    }

    /**
     * Populate the serial send command text with the cart insert.
     * Then send the command to the serial port.
     * @param {*} event 
     */
    const handleCartInsertCmdClick = () => {
        setSerialCmdTxt("cart insert");
    }

    /**
     * Populate the serial send command text with the cart insert.
     * Then send the command to the serial port.
     * @param {*} event 
     */
    const handleCartInsertJsonCmdClick = () => {
        setSerialCmdTxt('{"cmd": "cart", "subcmd": "insert"}');
    }

    /**
     * Populate the serial send command text with the scan label.
     * Then send the command to the serial port.
     * @param {*} event 
     */
    const handleScanLabelCmdClick = () => {
        setSerialCmdTxt("label scan rvp Alexander Smith 06/14/1991");
    }

    /**
     * Populate the serial send command text with the scan label.
     * Then send the command to the serial port.
     * @param {*} event 
     */
    const handleScanLabelJsonCmdClick = () => {
        setSerialCmdTxt('{"cmd": "label", "subcmd": "scan", "test_type": "rvp", "first_name": "LLexander", "last_name": "Snith", "dob": "06/14/1791"}');
    }

    /**
     * Clear the serial console.
     * @param {*} event 
     */
    const handleClearClick = () => {
        setSerialInputText("");
    }

    /**
     * GUI
     */
    return (
        <Grid container spacing={3}>
            <Grid item container xs={12}>
                <Grid item xs={3}>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={selectedSerialPortList}
                        label="Age"
                        onChange={handleSelectedSerialPortChange}
                    >
                        {serialPortList.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={3}>
                    <ButtonGroup size="large" aria-label="large button group">
                        <Button 
                            variant="contained" 
                            onClick={handleSerialConnectCmdClick}
                            disabled={isSerialConnected}
                        >
                                Connect
                        </Button>
                        <Button variant="contained" onClick={handleSerialDisconnectCmdClick}>Disconnect</Button>
                    </ButtonGroup>
                </Grid>

                <Grid item xs={4}> {/* Blank SPACER */}</Grid>
            </Grid>
            <Grid item container xs={12}>
                <Grid item xs={4}>
                    <span>Serial Port: {isSerialConnected ? "Connected" : "Disconnected" }</span>
                </Grid>
                <Grid item xs={4}>
                    <span>WebSocket: {connectionStatus}</span>
                </Grid>
                <Grid item xs={4}></Grid>
            </Grid>
            <Grid container item xs={12} md={8} lg={9}>
                {/* Serial Port Text Output */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 300 }} >
                        <React.Fragment>
                            <TextField
                                id="outlined-multiline-static"
                                label="Serial Output"
                                multiline
                                rows={15}
                                inputRef={serialConsoleTextFieldRef}
                                value={serialInputText}
                            />
                        </React.Fragment>
                    </Paper>
                </Grid>
                {/* Send Command to Serial port */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                        <React.Fragment>
                            <Paper sx={{ p: 2, width: '75%' }} >
                                    <Stack spacing={2} direction="row">
                                        <TextField fullWidth label="" id="fullWidth" value={serialCmdTxt} onChange={updateSendCmd} />
                                        <Button variant="contained" onClick={handleSendCmdClick}>SEND</Button>
                                    </Stack>
                            </Paper>
                        </React.Fragment>
                    </Paper>
                </Grid>
            </Grid>
            {/* Common Commands */}
            <Grid item xs={12} md={4} lg={3}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
                    <React.Fragment>
                        <Stack spacing={2} direction="column">
                            <Button variant="contained" onClick={handleClearClick}>CLEAR</Button>
                            <Button variant="outlined" onClick={handleCartInsertCmdClick}>Cartridge Insert</Button>
                            <Button variant="outlined" onClick={handleCartInsertJsonCmdClick}>Cartridge Insert[JSON]</Button>
                            <Button variant="outlined" onClick={handleScanLabelCmdClick}>Scan Label</Button>
                            <Button variant="outlined" onClick={handleScanLabelJsonCmdClick}>Scan Label[JSON]</Button>
                        </Stack>

                    </React.Fragment>
                </Paper>
            </Grid>
        </Grid>

    );
}