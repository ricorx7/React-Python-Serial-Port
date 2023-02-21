from pydantic import BaseModel, Field
from typing import List, Union

"""
Models used in the API calls.  These models can be viewed in the browser:
http://localhost:8000/docs

"""


class SerialPortInfo(BaseModel):
    """
    Details of an available serial port.
    """
    device: Union[str, None] = Field(title="device", default=None, example="/dev/cu.usbserial-FT0TCWAS", description="Device Path.  Typically the full path in linux")
    name: Union[str, None] = Field(title="name", default=None, example="cu.usbserial-FT0TCWAS", description="Device name.  Typically on the unique name in linux")
    desc: Union[str, None] = Field(title="desc", default=None, example="US232R", description="Hardware or device description")
    hwid: Union[str, None] = Field(title="hwid", default=None, example="USB VID:PID=0403:6001 SER=FT0TCWAS LOCATION=0-1.1.3", description="Hardware ID.")
    location: Union[str, None] = Field(title="location", default=None, example="0-1.1.3", description="Typically the version number or null")
    interface: Union[str, None] = Field(title="interface", default=None, example="None", description="Serial interface.  Typically null")



class SerialPortStatus(BaseModel):
    """
    Give the serial port status.  If the serial port is connected
    then it will list the serial port and baud rate used.
    Also give the list of available serial ports.
    """
    isConnected: bool = Field(title="isConnected", default=False, example=True, description="True if serial port is currently connected")
    connectedPort: str = Field(title="connectedPort", default="", example="/dev/cu.usbserial-FT0TCWAS", description="Serial port")
    connectedBaud: int = Field(title="connectedBaud", default=115200, example=115200, description="Serial Port Baud Rate")
    portList: List[SerialPortInfo] = Field(title="portList", default=[], description="List of available serial ports", example= [
                        {
                            "device": "/dev/cu.usbserial-FT0TCWAS",
                            "name": "cu.usbserial-FT0TCWAS",
                            "desc": "US232R",
                            "hwid": "USB VID:PID=0403:6001 SER=FT0TCWAS LOCATION=0-1.1.3",
                            "location": "0-1.1.3",
                            "interface": None
                        },
                        {
                            "device": "/dev/cu.usbmodem11203",
                            "name": "cu.usbmodem11203",
                            "desc": "STLINK-V3",
                            "hwid": "USB VID:PID=0483:374E SER=0044004D3137511033333639 LOCATION=0-1.1.2",
                            "location": "0-1.1.2",
                            "interface": None
                        }
                    ])


