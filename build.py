import os
import sys
import shutil


VENV_PATH = os.path.join(os.environ.get("WORKON_HOME"), "sample_db")
WINE_PYINSTALLER_PATH = os.path.join(os.path.expanduser("~"), ".wine", "drive_c", "Python27", "Scripts", "pyinstaller.exe")
WINE_PIP_PATH = os.path.join(os.path.expanduser("~"), ".wine", "drive_c", "Python27", "Scripts", "pip.exe")
if sys.platform == 'win32':
    activate_script = os.path.join(VENV_PATH, "Scripts", "activate_this.py")
else:
    activate_script = os.path.join(VENV_PATH, "bin", "activate_this.py")
execfile(activate_script, dict(__file__=activate_script))

BUILD_PATH = './app'
SERVER_SRC_PATH = './src/sample-db-py/'
SERVER_SRC_STATIC_PATH = os.path.join(SERVER_SRC_PATH, 'sample_db', 'static')
CLIENT_SRC_PATH = './src/sample-db-app/'
ELECTRON_SRC_PATH = './src/electron/'

SERVER_BUILD_PATH = os.path.abspath(os.path.join(BUILD_PATH, 'db-server'))
CLIENT_BUILD_PATH = os.path.abspath(os.path.join(BUILD_PATH, 'db-app'))

if not os.path.exists(BUILD_PATH):
    os.mkdir(BUILD_PATH)

def clean_build():
    if os.path.exists(BUILD_PATH):
        shutil.rmtree(BUILD_PATH)

    os.mkdir(BUILD_PATH)

def build_static_files():
    if not os.path.exists(os.path.abspath(os.path.join(SERVER_BUILD_PATH, 'static'))):
        os.makedirs(os.path.abspath(os.path.join(SERVER_BUILD_PATH, 'static')))
    for f in os.listdir(SERVER_SRC_STATIC_PATH):
        shutil.copy(os.path.join(SERVER_SRC_STATIC_PATH, f), os.path.join(SERVER_BUILD_PATH, 'static'))

def build_win_server():
    print("Building Windows Server...")
    if os.path.exists(os.path.join(SERVER_BUILD_PATH, 'win32')):
        shutil.rmtree(os.path.join(SERVER_BUILD_PATH, 'win32'))
    if sys.platform != 'win32':
        os.system("wine {} install -q -r {}".format(WINE_PIP_PATH, os.path.join(SERVER_SRC_PATH, 'requirements.txt')))
        os.system('wine {} -y --clean --workpath win-pybuild  --paths=./src  --distpath {} --log-level ERROR --hiddenimport email.mime.message {}'.format(
            WINE_PYINSTALLER_PATH,
            os.path.join(SERVER_BUILD_PATH, 'win32'),
            os.path.join(SERVER_SRC_PATH, 'run.py'),
            )
        )
    else:
        os.system("pip install -q -r {}".format(os.path.join(SERVER_SRC_PATH, 'requirements.txt')))
        os.system('pyinstaller -y --clean --distpath {} --paths=./src --workpath darwin-pybuild  --log-level ERROR --hiddenimport email.mime.message {}'.format(
            os.path.join(SERVER_BUILD_PATH, 'win32'),
            os.path.join(SERVER_SRC_PATH, 'run.py')
            )
        )

def build_darwin_server():
    if sys.platform == 'darwin':
        print("Building Mac Server")
        os.system("pip install -q -r {}".format(os.path.join(SERVER_SRC_PATH, 'requirements.txt')))
        os.system('pyinstaller -y --clean --distpath {} --workpath darwin-pybuild --log-level ERROR --hiddenimport email.mime.message {}'.format(
            os.path.join(SERVER_BUILD_PATH, 'darwin'),
            os.path.join(SERVER_SRC_PATH, 'run.py')
            )
        )
    else:
        raise Exception("Cannot compile darwin on non-darwin system.")

def build_client():
    if os.path.exists(CLIENT_BUILD_PATH):
        shutil.rmtree(CLIENT_BUILD_PATH)
    os.system("cd {} && yarn && webpack".format(CLIENT_SRC_PATH))
    shutil.move(os.path.join(CLIENT_SRC_PATH, "app"), CLIENT_BUILD_PATH)
    

def build_electron():
    for f in os.listdir(ELECTRON_SRC_PATH):
        shutil.copy(os.path.join(ELECTRON_SRC_PATH, f), BUILD_PATH)

def make_dist():
    if sys.platform != 'win32':
        os.system('yarn dist')
    else:
        os.system('yarn dist-win')

if __name__=='__main__':
    clean_build()
    build_win_server()
    if sys.platform == 'darwin':
        build_darwin_server()
    build_static_files()
    build_client()
    build_electron()
    make_dist()