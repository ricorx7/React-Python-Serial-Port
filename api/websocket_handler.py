import json
import logging
import serial.tools.list_ports
from fastapi import WebSocket
from seekr_device import SEEKR_Device
from WebsocketConnectionManager import WsConnectionManager

class WebsocketHandler:
    """
    Handle the websocket connection in the API.
    """

    def __init__(self, ws_manager: WsConnectionManager) -> None:
        """!
        Initialize the values.
        Get the latest lists of available serial ports.
        """
        self.ws_manager = ws_manager

        self.serialport_connected = False
        self.serialport_port = ""
        self.serialport_port_list = self.get_serial_ports()   

        self.seekr = SEEKR_Device(ws_manager)


    def get_serial_ports(self) -> list:
        """!
        Get a list of serial ports.
        
        @return List of serial ports available.
        """
        return list(serial.tools.list_ports.comports())
    
    def handle_commands(self, data: str, ws: WebSocket):
        logging.debug("Websocket Handler received command: " + data)

        # Convert the data to a json object
        try:
            json_data = json.loads(data)
        except ValueError as er:
            logging.error("Message not JSON: " + data)

            # Not a JSON object, so write the raw data to the serial port
            self.seekr.write_raw_data(data)

            return False

        # Check for the command
        if "cmd" in json_data:
            logging.debug("JSON Command Received")
            self.seekr.process_cmd(json_data)

        return True


