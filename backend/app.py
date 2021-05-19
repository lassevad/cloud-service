import subprocess
from flask import Flask, request, send_file
from flask_cors import CORS, cross_origin
from flask import jsonify
import os
import json
import pandas as pd
import os.path
from framework import *
import geoplot as gplt
import geopandas as gpd


import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib import pyplot

df = pd.read_csv("dataset.csv")

#gdf = gpd.read_file("geodataset.csv", GEOM_POSSIBLE_NAMES="geometry", KEEP_GEOM_COLUMNS="NO") 

#gdf.crs = 'epsg:4326'

#from shapely import wkt

#df1['geometry'] = df1['geometry'].apply(wkt.loads)
#gdf = gpd.GeoDataFrame(df1, crs='epsg:4326')
#print(gdf.head())

with open('data.json') as f:
    binaries = json.load(f)

with open('strategies.json') as f:
    strategies = json.load(f)

with open('maps.json') as f:
    maps = json.load(f)

with open('cmaps.json') as f:
    cmaps = json.load(f)

UPLOAD_FOLDER = '/uploads'
ALLOWED_EXTENSIONS = set(['png'])

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/uploadBinary', methods=['POST'])
@cross_origin()
def upload_binary():
    global binary
    print("hei")
    print(request.json["data"]["parallel"])
    binary = request.json["data"]["parallel"]
    return "Binary recieved"

@app.route('/uploadStrategy', methods=['POST'])
@cross_origin()
def upload_strategy():
    global strategy
    strategy_id = int(request.json["data"]["strategy"]) - 1
    print("strategy = " + strategies["strategies"][strategy_id]["value"])
    strategy = strategies["strategies"][strategy_id]["value"]
    return "Strategy recieved"

@app.route('/uploadMap', methods=['POST'])
@cross_origin()
def upload_map():
    global _map
    print(request.json)
    map_id = int(request.json["data"]["map"]) - 1
    print("map = " + maps["maps"][map_id]["value"])
    _map = maps["maps"][map_id]["value"]
    return "map recieved"

@app.route('/uploadColorMap', methods=['POST'])
@cross_origin()
def upload_cmap():
    global cmap
    cmap_id = int(request.json["data"]["cmap"]) - 1
    print("cmap = " + cmaps["cmaps"][cmap_id]["value"])
    cmap = cmaps["cmaps"][cmap_id]["value"]
    return "cmap recieved"

@app.route('/uploadCol1', methods=['POST'])
@cross_origin()
def upload_col1():
    global col1
    print(columns)
    col1 = columns[int(request.json["data"]["col1"])]
    print("col1 = " + col1)
    return "col1 recieved"

@app.route('/uploadCol2', methods=['POST'])
@cross_origin()
def upload_col2():
    global col2
    print(columns)
    col2 = columns[int(request.json["data"]["col2"])]
    print("col2 = " + col2)
    return "col2 recieved"

@app.route('/uploadHue', methods=['POST'])
@cross_origin()
def upload_hue():
    global hue
    print(columns)

    hue = columns[int(request.json["data"]["hue"])]

    print("hue: " + hue)
    return "hue recieved"

@app.route('/uploadGeoHue', methods=['POST'])
@cross_origin()
def upload_geohue():
    global geohue
    print(geocolumns)

    geohue = geocolumns[int(request.json["data"]["geohue"])]

    print("geohue: " + geohue)
    return "geohue recieved"


def process_image(image_id):
    subprocess.run([binary, "uploads/" + image_id + ".png",
                   "uploads/" + image_id + ".png"], capture_output=False)
    print("Processing image with: ", binary)


@app.route('/', methods=['GET'])
def home():
    return "Service connected"


@ app.route('/upload', methods=['POST'])
@ cross_origin()
def upload_image():
    image_id = request.args.get('id')
    print(request.data)
    with open('uploads/' + image_id + '.png', 'wb') as file:
        file.write(request.data)
        file.close()
    process_image(image_id)
    return "Image recieved"

@ app.route('/csv', methods=['POST'])
@ cross_origin()
def upload_csv():
    global df
    global columns
    print(request.data)
    with open("dataset.csv", "wb") as file:
        file.write(request.data)
        file.close
    df = pd.read_csv("dataset.csv")
    columns = list(df.columns)
    print(columns)
    return "csv recieved"

@ app.route('/geocsv', methods=['POST'])
@ cross_origin()
def upload_geocsv():
    global gdf
    global geocolumns
    print(request.data)
    with open("geodataset.csv", "wb") as file:
        file.write(request.data)
        file.close
    gdf = gpd.read_file("geodataset.csv", GEOM_POSSIBLE_NAMES="geometry", KEEP_GEOM_COLUMNS="NO") 
    df_ = pd.read_csv("geodataset.csv")
    geocolumns = list(df_.columns)
    print(geocolumns)
    return "geocsv recieved"

@ app.route('/download', methods=['GET'])
def download_image():
    image_id = request.args.get('id')
    print(request.data)
    return send_file('uploads/' + image_id + '.png', mimetype='image/gif')

@ app.route('/generateGraph', methods=['GET'])
def generate_graph():
    print(eval(strategy))
    con = Context(eval(strategy), df)

    fig = con.plot(col1, col2, hue)

    filename = "graph.png"
    try:
        os.remove(filename)
    except OSError:
        pass

    fig.figure.savefig("graph.png")

    return send_file('graph.png', mimetype='image/gif')

@ app.route('/generateMap', methods=['GET'])
def generate_map():
    print(eval(_map))
    geocon = MapContext(eval(_map), gdf)

    geofig = geocon.geoPlot(geohue, cmap)

    filename = "map.png"
    try:
        os.remove(filename)
    except OSError:
        pass

    geofig.figure.savefig("map.png")

    return send_file('map.png', mimetype='image/gif')

@ app.route('/binaries', methods=['GET'])
def api_all():
    return jsonify(binaries)

@ app.route('/strategies', methods=['GET'])
def api_all_1():
    return jsonify(strategies)

@ app.route('/maps', methods=['GET'])
def get_maps():
    return jsonify(maps)

@ app.route('/columns', methods=['GET'])
def api_all_2():
    return jsonify(columns)

@ app.route('/geocolumns', methods=['GET'])
def get_geocolumns():
    return jsonify(geocolumns)

@ app.route('/colormaps', methods=['GET'])
def get_cmaps():
    return jsonify(cmaps)



app.run(host='0.0.0.0', port=8080)



