import subprocess
from flask import Flask, request, send_file
from flask_cors import CORS, cross_origin

UPLOAD_FOLDER = '/uploads'
ALLOWED_EXTENSIONS = set(['png'])

app = Flask(__name__)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


def process_image(image_id):
    subprocess.run(["./main", "uploads/" + image_id + ".png",
                   "uploads/" + image_id + ".png"], capture_output=False)


@app.route('/', methods=['GET'])
def home():
    return "Service connected"


@app.route('/upload', methods=['POST'])
@cross_origin()
def upload_image():
    image_id = request.args.get('id')
    print(request.data)
    with open('uploads/' + image_id + '.png', 'wb') as file:
        file.write(request.data)
        file.close()
    process_image(image_id)
    return "Image recieved"


@app.route('/download', methods=['GET'])
def download_image():
    image_id = request.args.get('id')
    print(request.data)
    return send_file('uploads/' + image_id + '.png', mimetype='image/gif')


app.run()
