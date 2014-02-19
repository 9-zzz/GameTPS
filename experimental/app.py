#!/usr/bin/env python
import sqlite3
import os
from flask import Flask, request, session, g, redirect, url_for, \
	abort, render_template, flash
from contextlib import closing

### CREATE APP ###
app = Flask(__name__)

### ROUTING ###
@app.route("/")
def interface():
	return render_template("index.html")

if __name__ == "__main__":
	app.run(debug = True)
