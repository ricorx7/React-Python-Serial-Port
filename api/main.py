from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from websocket_handler import WebsocketHandler
from starlette.middleware.cors import CORSMiddleware
import logging
import json
from WebsocketConnectionManager import WsConnectionManager
from models import SerialPortStatus

logging.basicConfig(level=logging.DEBUG)

"""
API to handle communication with a frontend.
This could a website or Electron.
"""

app = FastAPI()                                 # Create the API server
ws_manager = WsConnectionManager()              # Create the websocket manager
ws_handler = WebsocketHandler(ws_manager)       # Create the websocket command handler

# Setup Middleware
app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/serial_port_status")
async def get_serial_status() -> SerialPortStatus:
    """
    Get the status of the serial port.
    This will return if the serial port is already connected and which 
    port and baud rate it is using.  It will also give all the available
    serial ports to start a connection.
    """
    logging.debug("Serial Port Status")

    # Create a model to use as the response
    response_model = SerialPortStatus(
        isConnected=ws_handler.seekr.serial_is_connected,
        connectedPort=ws_handler.seekr.serial_port_path,
        connectedBaud=ws_handler.seekr.serial_baud_rate,
        portList=ws_handler.seekr.get_serial_port_list()
    )

    return response_model

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    Handle a websocket connection.  This will connect the websocket 
    and keep a list of all the connections.
    """
    await ws_manager.connect(websocket)
    logging.debug("Websocket connected")
    try:
        while True:
            data = await websocket.receive_text()
            logging.debug("Received data: " + data)
            response = ws_handler.handle_commands(data, websocket)
            #await websocket.send_text(f"Websocket echo: {data}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

