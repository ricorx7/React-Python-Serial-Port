import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import React, { useState, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

/**
 * Serial Port page.  This will handle a connection to a serial port.
 * The serial port is controlled by a websocket on the API server.
 */
export default function SerialPortPage() {

    // UI References to call in code
    const serialConsoleTextFieldRef = useRef(null);

    // State Variables
    const [serialInputText, setSerialInputText] = useState("");
    const [serialCmdTxt, setSerialCmdTxt] = useState("");
    const [socketUrl, setSocketUrl] = useState("ws://127.0.0.1:8000/ws")

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

    // Update the serial input messages when lastMessage from websocket is received.
    useEffect(() => {
        console.log(lastMessage);
        if (lastMessage !== null) {
            setSerialInputText(s => s + lastMessage.data);

            // Autoscroll to the bottom
            serialConsoleTextFieldRef.current.scrollTop = serialConsoleTextFieldRef.current.scrollHeight;
        }
    },[lastMessage, setSerialInputText]);

    /**
     * Handle the send command button click.
     * This will call the API to call the serial port.
     * The websocket will return the response.
     */
    const handleSendCmdClick = (event) => {
        console.log("Send Command: " + serialCmdTxt);
        setSerialInputText(serialInputText + "Send Command: " + serialCmdTxt + "\n");

        // Send to websocket the message
        sendMessage(JSON.stringify({"cmd": serialCmdTxt}));
    };

    /**
     * Update the command value to send to the serial port.
     * @param {*} event 
     */
    const updateSendCmd = (event) => {
        setSerialCmdTxt(event.target.value);
    }

    /**
     * Populate the serial send command text with the cart insert.
     * Then send the command to the serial port.
     * @param {*} event 
     */
    const handleCartInsertCmdClick = (event) => {
        setSerialCmdTxt("cart insert");
    }

    /**
     * Populate the serial send command text with the cart insert.
     * Then send the command to the serial port.
     * @param {*} event 
     */
        const handleCartInsertJsonCmdClick = (event) => {
            setSerialCmdTxt('{"cmd": "cart", "subcmd": "insert"}');
        }

    /**
     * Populate the serial send command text with the scan label.
     * Then send the command to the serial port.
     * @param {*} event 
     */
    const handleScanLabelCmdClick = (event) => {
        setSerialCmdTxt("label scan rvp Alexander Smith 06/14/1991");
    }

    /**
     * Populate the serial send command text with the scan label.
     * Then send the command to the serial port.
     * @param {*} event 
     */
    const handleScanLabelJsonCmdClick = (event) => {
        setSerialCmdTxt('{"cmd": "label", "subcmd": "scan", "test_type": "rvp", "first_name": "LLexander", "last_name": "Snith", "dob": "06/14/1791"}');
    }

    /**
     * GUI
     */
    return (
        <Grid container spacing={3}>
            <span>The WebSocket is currently {connectionStatus}</span>
            {/* Serial Port Text Input */}
            <Grid item xs={12} md={8} lg={9}>
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
            {/* Common Commands */}
            <Grid item xs={12} md={4} lg={3}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', minHeight: 300 }}>
                    <React.Fragment>
                        <Stack spacing={2} direction="column">
                            <Button variant="outlined" onClick={handleCartInsertCmdClick}>Cartridge Insert</Button>
                            <Button variant="outlined" onClick={handleCartInsertJsonCmdClick}>Cartridge Insert[JSON]</Button>
                            <Button variant="outlined" onClick={handleScanLabelCmdClick}>Scan Label</Button>
                            <Button variant="outlined" onClick={handleScanLabelJsonCmdClick}>Scan Label[JSON]</Button>
                        </Stack>

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
                                <Button variant="outlined" onClick={handleSendCmdClick}>SEND</Button>
                            </Stack>
                        </Paper>
                    </React.Fragment>
                </Paper>
            </Grid>
        </Grid>

    );
}