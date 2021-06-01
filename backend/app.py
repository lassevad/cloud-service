import subprocess
from flask import Flask, request, send_file
from flask_cors import CORS, cross_origin
from flask import jsonify
import os
import json
import pandas as pd
import os.path
from datetime import datetime



import seaborn as sns
import matplotlib.pyplot as plt
from matplotlib import pyplot

df = pd.read_csv("dataset.csv")

data2 = {'Method': [], 'N': [], 'time': []}
speedup_df = pd.DataFrame.from_dict(data2)
#gdf = gpd.read_file("geodataset.csv", GEOM_POSSIBLE_NAMES="geometry", KEEP_GEOM_COLUMNS="NO") 

#gdf.crs = 'epsg:4326'

#from shapely import wkt

#df1['geometry'] = df1['geometry'].apply(wkt.loads)
#gdf = gpd.GeoDataFrame(df1, crs='epsg:4326')
#print(gdf.head())

with open('data.json') as f:
    binaries = json.load(f)

with open('n.json') as f:
    n = json.load(f)

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

@app.route('/uploadN', methods=['POST'])
@cross_origin()
def upload_n():
    global sel_n
    print(request.json["data"]["n"])
    sel_n = request.json["data"]["n"]
    return "N recieved"


def process_image(image_id):
    before = datetime.now()
    before_timestamp = datetime.timestamp(before)
    subprocess.run([binary, "uploads/" + image_id + ".png",
                   "uploads/" + image_id + ".png"], capture_output=False)
    after = datetime.now()
    after_timestamp = datetime.timestamp(after)
    global process_time
    process_time = after_timestamp-before_timestamp
    print("Time it took : " + str(after_timestamp-before_timestamp))
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


@ app.route('/download', methods=['GET'])
def download_image():
    image_id = request.args.get('id')
    print(request.data)
    return send_file('uploads/' + image_id + '.png', mimetype='image/gif')

@ app.route('/generateGraph', methods=['GET'])
def generate_graph():
    global speedup_df
    if(binary=='./main'):
        speedup_df = speedup_df.append({'Method': 'Sequential', 'N': sel_n, 'time': process_time}, ignore_index=True)
        print(speedup_df)
    elif(binary=='./mpi-par'):
        speedup_df = speedup_df.append({'Method': 'MPI', 'N': sel_n, 'time': process_time}, ignore_index=True)
    elif(binary=='./main-omp2'):
        speedup_df = speedup_df.append({'Method': 'OpenMP', 'N': sel_n, 'time': process_time}, ignore_index=True)
    print(speedup_df.head())
    fig = sns.lineplot(data=speedup_df, y=speedup_df['time'], x=speedup_df['N'])

    filename = "graph.png"
    try:
        os.remove(filename)
    except OSError:
        pass

    fig.figure.savefig("graph.png")
    

    return send_file('graph.png', mimetype='image/gif')


@ app.route('/binaries', methods=['GET'])
def api_all():
    return jsonify(binaries)

@ app.route('/n', methods=['GET'])
def api_n():
    return jsonify(n)

@ app.route('/columns', methods=['GET'])
def api_all_2():
    return jsonify(columns)

@ app.route('/processtime', methods=['GET'])
def get_process_time():
    print(process_time)
    return jsonify(process_time)



app.run(host='0.0.0.0', port=8080)



