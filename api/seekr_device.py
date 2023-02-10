import serial
import threading
import time
import serial.tools.list_ports
import logging
from pubsub import pub
import asyncio
import json
from WebsocketConnectionManager import WsConnectionManager


# TRUE = Write to serial port in single bytes
# False = Write all the bytes in a single write
BUFFERED_WRITE = True

# Wait between each byte written
WRITE_WAIT_TIME = 25/1000       # 25 milliseconds



class SEEKR_Device:

    def __init__(self, ws_manager: WsConnectionManager) -> None:
        """
        Make a connection to the serial port.
        """
        self.ws_manager = ws_manager

        #self.sp = serial.Serial("/dev/tty.usbserial-FT0TCWAS", 115200)
        self.let_thread_run = False
        self.sp = None


    def get_serial_port_list(self):
        """
        Get a list of serial ports.

        @return: List of ports: [Port, desc, hwid]
        """
        # Get serial ports
        ports = serial.tools.list_ports.comports()

        for port, desc, hwid in sorted(ports):
                print("{}: {} [{}]".format(port, desc, hwid))

        return ports


    def connect(self, serial_port: str = "/dev/tty.usbserial-FTDVSTTW", serial_baud: int = 115200):
        """
        Connect to the serial port.
        If the connection is already made, then first disconect.

        @param: serial_port: String path to the serial port.
        @param: serial_baud: Baud rate of the serial port.
        """
        # Check if serial port is currently connected
        if self.sp:
            self.disconnect()

        # connect the serial port
        self.sp = serial.Serial(serial_port, serial_baud)

        # Set the flag to let the loops run
        self.let_thread_run = True

        # Start the read thread
        reading = threading.Thread(target=self.read_thread, args=(self.sp,))
        reading.start()

    def disconnect(self):
        """
        Stop all the threads.
        """
        self.let_thread_run = False
        self.sp.close()
        self.sp = None

    def handle_ws_serial_connect(self, json_data: dict):
        """
        Handle the incoming request to connect the serial port with the given
        serial port and baud rate.
        """
        self.connect(json_data["port"], json_data["baud"])

    def handle_ws_serial_disconnect(self):
        self.disconnect()

    def process_cmd(self, json_data: dict):
        """
        Process the JSON command.  Then write it to 
        the serial port.

        @param: json_data: Data to write to the serial port.
        """
        logging.debug("Send_cmd to serial port: " + str(json_data))
        # Check the command
        if(json_data["cmd"] == "serial_connect"):
            logging.debug("Connect serial port")
            self.handle_ws_serial_connect(json_data)
            return
        
        # Write command to serial port
        self.write_json_cmd(json_data)

    def write_json_cmd(self, json_data: dict):
        """
        Write the JSON data to the serial port.

        @param json_data: JSON command.
        """
        # Convert the JSON dict to a string
        cmd = json.dumps(json_data)

        # Write the string
        self. write_raw_data(cmd)


    
    def write_raw_data(self, cmd: str):
        """
        Write a raw string to the serial port.

        @param: cmd: String to write to the serial port.
        """
        # Make sure the serial port is connected
        if self.sp and self.sp.is_open:
            if BUFFERED_WRITE:
                # This version will reduce the write size to single bytes
                # Break up the characters to send characters slower
                cmd = cmd + "\r\n"
                for serial_char in cmd:
                    self.sp.write(serial_char.encode('Ascii'))
                    time.sleep(WRITE_WAIT_TIME)
            else:
                # Write data all at once
                self.sp.write((cmd + "\r\n").encode())
        else:
            logging.debug("Serial port is not connected")


    async def ws_write(self, data: str):
        """
        Write data to the websocket.  Because this async, and the read is done
        within a thread, use ws_write_async to write the data without needed await.

        @param: data: String to write to the websocket.
        """
        await self.ws_manager.broadcast(data);

    def ws_write_async(self, data: str):
        """
        This is used so the read thread can call the websocket write without an
        async/await.

        Write to the websocket.

        @param: data: String to write to the websocket.
        """
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

        loop.run_until_complete(self.ws_write(data))
        loop.close()


    def read_thread(self, sp_shared):
        """
        Read data from the serial port in this thread worker.
        """
        # Used to hold data coming over UART
        serialString = ""          
        while(self.let_thread_run):

            # Wait until there is data waiting in the serial buffer
            if(sp_shared.in_waiting > 0):

                # Read data out of the buffer until a carraige return / new line is found
                serialString = sp_shared.readline()

                # Print the contents of the serial data
                logging.debug("Serial Read: " + serialString.decode('Ascii'))

                # Publish the message
                self.ws_write_async(serialString.decode('Ascii'))
