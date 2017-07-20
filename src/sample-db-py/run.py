#!/usr/local/bin/python
import flask as _
from sample_db import app
from gevent.wsgi import WSGIServer
server = WSGIServer(('127.0.0.1', 5000), app)
# app.logger.warning("Starting Server")
server.serve_forever()
# app.run()
