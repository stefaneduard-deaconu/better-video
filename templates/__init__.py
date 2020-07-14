from jinja2 import Environment, FileSystemLoader

file_loader = FileSystemLoader('templates')
env = Environment(loader=file_loader)

home = env.get_template('home.html')
uploaded = env.get_template('uploaded.html')

