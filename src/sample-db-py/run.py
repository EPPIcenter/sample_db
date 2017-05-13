#!/usr/local/bin/python
import flask as _
from sample_db import app
from gevent.wsgi import WSGIServer
server = WSGIServer(('', 5000), app)
server.serve_forever()
# app.run()
