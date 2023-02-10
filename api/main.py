from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, JSONResponse
from websocket_handler import WebsocketHandler
from starlette.middleware.cors import CORSMiddleware
import logging
import json
from WebsocketConnectionManager import WsConnectionManager

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

@app.get("/")
async def root():
    """
    API Root call.
    """
    return {"data": "SEEKR API", "version": "1.0.0"}

@app.get("/available_ports")
async def get_available_ports():
    ports = ws_handler.get_serial_ports()
    logging.debug("Available Ports Requested")

    port_list = []
    for port in ports:
        port_info = {}
        port_info["device"] = port.device
        port_info["name"] = port.name
        port_info["desc"] = port.description
        port_info["hwid"] = port.hwid
        port_info["location"] = port.location
        port_info["interface"] = port.interface
        logging.debug("Port: {} {} {}".format(port_info["device"], port_info["name"], port_info["desc"], port_info["hwid"], port_info["location"], port_info["interface"]))

        port_list.append(port_info)

    return JSONResponse({"ports": port_list})



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

