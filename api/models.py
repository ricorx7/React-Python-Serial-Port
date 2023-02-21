from pydantic import BaseModel
from typing import List, Union

class SerialPortInfo(BaseModel):
    device: Union[str, None] = None
    name: Union[str, None] = None
    desc: Union[str, None] = None
    hwid: Union[str, None] = None
    location: Union[str, None] = None
    interface: Union[str, None] = None

class SerialPortStatus(BaseModel):
    isConnected: bool = False
    connectedPort: str = ""
    connectedBaud: int = 115200
    portList: List[SerialPortInfo] = []

