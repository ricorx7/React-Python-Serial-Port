# Intro
There will be an electron app to run applications locally and a webapp to run through a web browser.

# Start Electron
```
cd seekr-web
npm install
npm run electron:dev
```

# Start Web App
```
cd seekr-web
npm install
npm start
```

# Start backend server
You will want a virtual environment to run this python code.
Create the virtual environment.
```
python -m venv venv
source venv/bin/activate
```

Then you can run the application

``` 
cd api
pip install -r requirements.txt
uvicorn main:app --reload 
```

You can also use the script file in scripts/backend_startup.sh to start the backend.
```
cd scripts
./backend_scripts.sh
```
