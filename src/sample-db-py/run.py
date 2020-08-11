from gevent.pywsgi import WSGIServer
import flask as _
from sample_db.flask_impl import app

server = WSGIServer(('127.0.0.1', 17327), app)
# app.logger.warning("Starting Server")
server.serve_forever()
# app.run()
